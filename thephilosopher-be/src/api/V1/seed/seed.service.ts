import { Injectable, Logger } from "@nestjs/common";
import { Supabase } from "src/common/supabase";
import { LangchainChatGPTService } from "src/common/langchain/langchain.chatgpt.service";
import { Book, BooksResponse } from "./dto/seed.types";
import axios from 'axios'
import { Timeout } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SeedService {

    constructor(
        private readonly supabase: Supabase,
        private readonly langchainChatGPTService: LangchainChatGPTService,
        private readonly configService: ConfigService
    ) { }

    private readonly logger = new Logger(SeedService.name);

    // @Timeout(1000)//Only uncomment when we want to seed the database from localhost.
    async load_resources() {

        const base_url = this.configService.get("GUTENDEX_BASE_URL");
        const max_books = parseInt(this.configService.get("MAX_BOOKS_TO_SEED"))

        this.logger.log("Starting to load books")

        const books_endpoint = `${base_url}books?copyright=false&languages=en&mime_type=text&topic=philosophy`;
        const filter_format = 'text/plain';

        let all_books: Book[] = [];

        async function fetchNextBooks(url: string) {
            const res = await axios.get<BooksResponse>(url);
            //filtering only the ones with desires format:
            res.data.results = res.data.results
                .filter(b => b.formats[filter_format] && b.subjects.find(s => s.toLowerCase().indexOf('fiction') === -1))
            return res.data
        }

        let route = books_endpoint;

        while (all_books.length < max_books) {
            const data = await fetchNextBooks(route)
            if (!data.next) break;
            all_books.push(...data.results)
            route = data.next;
        }

        if (all_books.length > max_books)
            all_books.splice(max_books, all_books.length - 1)

        const client = this.supabase.getClient();

        const { data: all_saved_books } = await client.from('text_resources').select('title').lt('created_at', new Date().toISOString()).throwOnError()
        all_books = all_books.filter(b => !all_saved_books.map(sb => sb.title).includes(b.title))

        for (let i = 0; i < all_books.length; i++) {
            const b = all_books[i]
            this.logger.log('parsing text_resource: ', b.title)
            const author_names = b.authors.map(a => a.name).join(", ")

            const { data: text_resource, error } = await client.from('text_resources').upsert({
                author_names,
                gutendex_id: b.id,
                title: b.title
            }, { onConflict: 'title' }).select('id').single().throwOnError()

            const content = (await axios.get(b.formats['text/plain'], { responseType: 'text' })).data
            const segments = await this.langchainChatGPTService.splitLargeText(content, 1500, 500)

            const embeddings: number[][] = []

            const embed_increment = 80;
            for (let sc = 0; sc < segments.length; sc += embed_increment) {
                const segment_segment = segments.slice(sc, sc + embed_increment);
                embeddings.push(...await this.langchainChatGPTService.makeEmbeddingsForTexts(segment_segment, this.configService.get("EMBEDDING_MODEL")))
            }

            const db_save_increment = 8;
            for (let si = 0; si < segments.length; si += db_save_increment) {
                const segment_segment = segments.slice(si, si + db_save_increment);
                
                await Promise.all(
                    segment_segment
                        .map((s, sindex) => {
                            return {
                                s,
                                emb: embeddings[sindex],
                                sindex: si + sindex
                            }
                        })
                        .map(async ({ emb, s, sindex }) => {

                            const embedding = emb;

                            const { data: existing_segment } = await client
                                .from('text_resource_segments')
                                .select("id")
                                .eq("index", sindex)
                                .eq('text_resource_id', text_resource.id)
                                .limit(1)
                                .single()

                            if (!existing_segment) {
                                const { data: trs } = await client.from('text_resource_segments').insert({
                                    index: sindex,
                                    text_resource_id: text_resource.id
                                }).select('id').single().throwOnError()
                                const { data: emb_res } = await client.from('embeddings').insert({
                                    content: s,
                                    embedding: embedding as any,
                                    content_length: s.length
                                }).select('id').single().throwOnError()
                                await client.from('text_resource_segment_embeddings').insert({
                                    embedding_id: emb_res.id,
                                    text_resource_segment_id: trs.id
                                }).throwOnError()
                                this.logger.log(`created ${sindex} embedding in db for book ${b.title}`)
                            }
                        }))

            }
        }

        return { all_books }
    }

}