import { Injectable, Logger } from "@nestjs/common";
import { Supabase } from "src/common/supabase";
import { LangchainChatGPTService } from "src/common/langchain/langchain.chatgpt.service";
import { Book, BooksResponse } from "./dto/seed.types";
import axios from 'axios'
import { Timeout } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { DBTableInsert, DBTableRow } from "src/types/db";
import { chunkArray } from "src/helpers/array";
import { wait } from "src/helpers/async";

@Injectable()
export class SeedService {

    constructor(
        private readonly supabase: Supabase,
        private readonly langchainChatGPTService: LangchainChatGPTService,
        private readonly configService: ConfigService
    ) { }

    private readonly logger = new Logger(SeedService.name);

    // @Timeout(100)//Only uncomment when we want to clean the database from localhost.
    async cleanDatabase() {
        try {
            const client = this.supabase.getClient()

            this.logger.log('Starting deletion')

            await client.from('text_resources').delete().lt('created_at', new Date().toISOString())
            await client.from('insights').delete().lt('created_at', new Date().toISOString())
            await client.from('embeddings').delete().lt('created_at', new Date().toISOString())

            this.logger.log('Finishing deletion')

        } catch (ex) {
            this.logger.error(ex)
        }
    }

    // @Timeout(1000)//Only uncomment when we want to seed the database from localhost.
    async load_resources() {

        try {

            const base_url = this.configService.get("GUTENDEX_BASE_URL");
            const max_books = parseInt(this.configService.get("MAX_BOOKS_TO_SEED"))

            const books_endpoint = `${base_url}books?copyright=false&languages=en&mime_type=text&topic=philosophy`;
            const filter_format = 'text/plain';

            let all_books: Book[] = [];

            async function fetchNextBooks(url: string) {
                const res = await axios.get<BooksResponse>(url);
                //filtering only the ones with desires format:
                res.data.results = res.data.results
                    .filter(b => b.formats[filter_format] && b.formats['text/html'] && b.subjects.find(s => s.toLowerCase().indexOf('fiction') === -1))
                return res.data
            }

            let route = books_endpoint;

            this.logger.log("Starting to load books")

            while (all_books.length < max_books) {
                const data = await fetchNextBooks(route)
                if (!data.next) break;
                all_books.push(...data.results)
                route = data.next;
            }

            this.logger.log("Finished loading books")

            if (all_books.length > max_books)
                all_books.splice(max_books, all_books.length - 1)


            const client = this.supabase.getClient();

            const { data: all_saved_books } = await client.from('text_resources').select('title').lt('created_at', new Date().toISOString()).throwOnError()

            all_books = all_books.filter(b => !all_saved_books.map(sb => sb.title).includes(b.title))

            for (let i = 0; i < all_books.length; i++) {

                const b = all_books[i]
                const author_names = b.authors.map(a => a.name).join(", ")

                const { data: text_resource, error } = await client.from('text_resources').upsert({
                    author_names,
                    gutendex_id: b.id,
                    title: b.title,
                    url: b.formats['text/html']
                }, { onConflict: 'title' }).select('id').single().throwOnError()

                let content = '';

                content = (await axios.get(b.formats['text/plain'], { responseType: 'text' })).data
                const segments = await this.langchainChatGPTService.splitLargeText(content, 1500, 500)

                const embeddings: number[][] = []

                this.logger.log('creating embeddings');

                const embed_increment = 80;
                await chunkArray(segments, embed_increment, async (segment_segment) => {
                    embeddings.push(...await this.langchainChatGPTService.makeEmbeddingsForTexts(segment_segment, this.configService.get("EMBEDDING_MODEL")))
                })

                this.logger.log('embeddings are : ', embeddings.length);

                const segments_to_create: DBTableInsert<'text_resource_segments'>[] = segments.map((e, i) => ({
                    index: i,
                    text_resource_id: text_resource.id
                }))

                const embeddings_to_create: DBTableInsert<'embeddings'>[] = embeddings.map((e, i) => {
                    const content = segments[i]
                    return {
                        content,
                        embedding: e as any,
                        content_length: content.length,
                    }
                })

                const db_save_increment = 3; //Save per 100 chunks maximum

                await chunkArray(segments, db_save_increment, async (segment, si) => {

                    const chunk_segments_to_create = segments_to_create.slice(si, si + db_save_increment)
                    const chunk_embeddings_to_create = embeddings_to_create.slice(si, si + db_save_increment)

                    this.logger.log("Saving text_resource_segments si: " + chunk_segments_to_create.length)
                    const { data: text_resource_segments } = await client.from('text_resource_segments').insert(chunk_segments_to_create).select('id').throwOnError()

                    this.logger.log("Saving embeddings si: " + chunk_embeddings_to_create.length)
                    const { data: db_embeddigns } = await client.from('embeddings').insert(chunk_embeddings_to_create).select('id').throwOnError()

                    const text_resource_segment_embeddings_to_create: DBTableInsert<'text_resource_segment_embeddings'>[] = db_embeddigns.map((e, i) => ({
                        embedding_id: db_embeddigns[i]?.id,
                        text_resource_segment_id: text_resource_segments[i]?.id
                    }))

                    this.logger.log("Saving text_resource_segment_embeddings si: " + text_resource_segment_embeddings_to_create.length)
                    await client.from('text_resource_segment_embeddings').insert(text_resource_segment_embeddings_to_create).throwOnError()

                })
            }

            this.logger.log('Finished!')

            return { all_books }


        } catch (ex) {
            this.logger.error(ex);
        }
    }

}