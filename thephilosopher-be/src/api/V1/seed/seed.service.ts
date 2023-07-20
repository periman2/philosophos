import { Injectable, Logger } from "@nestjs/common";
import { Supabase } from "src/common/supabase";
import { v1 } from "uuid";
import * as stream from 'stream';
import { LangchainChatGPTService } from "src/common/langchain/langchain.chatgpt.service";
import { Author, Book, BooksResponse } from "./dto/seed.types";
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

    private readonly gpt = 'gpt-4-32k';
    private readonly logger = new Logger(SeedService.name);

    async load_resources() {
        try {

            const base_url = this.configService.get("GUTENDEX_BASE_URL");
            const max_books = parseInt(this.configService.get("MAX_BOOKS_TO_SEED"))

            console.log("Starting to load books")

            const books_endpoint = `${base_url}books?copyright=false&languages=en&mime_type=text&topic=philosophy`;
            const filter_format = 'text/plain';

            const all_books: Book[] = [];
            const all_authors: Author[] = [];

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

            for (let i = 0; i < all_books.length; i++) {
                const b = all_books[i]
                b.authors.forEach(author => {
                    if (!all_authors.find(a => a.name === author.name))
                        all_authors.push(author)
                })
                // b.content = (await axios.get(b.formats['text/plain'], { responseType: 'text' })).data
            }

            console.log('all books are : ', 
            all_books.length, 
            all_books.map(b => b.title))
            return { all_books }

        } catch (ex) {
            console.error(ex)
        }
    }

    @Timeout(1000) //start this method a second after the server is started
    async execute() {

        const client = this.supabase.getClient();

        // try {

        //     const { data: ai } = await client.from('ai_models').select('*').eq('name', this.gpt).limit(1).single().throwOnError()

        //     if (ai)
        //         ai.api_key = decrypt(ai.api_key as string)

        //     else throw new Error(`Cannot seed the database without ${this.gpt}`)

        //     let all_books: Book[] = [];
        //     let all_authors: Author[] = [];

        //     if (!id) {
        //         const { all_authors: a_a, all_books: a_b } = await load_books_and_authors({ max_books: 2 })
        //         all_books = a_b
        //         all_authors = a_a
        //     } else {
        //         const { all_authors: a_a, all_books: a_b } = await load_book_from_id({ id })
        //         all_books = a_b
        //         all_authors = a_a
        //     }

        //     const storage_of_books = await this.getOrCreateBooksStorage(client);

        //     /** Retrieve the storage for books from the database or create it! TODO: create if not exists */
        //     const db_authors = await this.upsertAuthors(client, all_authors)

        //     for (let book_indx = 0; book_indx < all_books.length; book_indx++) {

        //         const book = all_books[book_indx]

        //         this.logger.log("Parsing book : ", book.title)

        //         const storage_folder = await this.getOrCreateStorageFolder(client, storage_of_books.id, book)
        //         const book_path = `${book.title}.txt`
        //         const text_stream = this.getTextStream(book.content);
        //         await this.bunnyService.uploadFile(storage_of_books?.name as string, storage_folder?.url as string, book_path, text_stream, decrypt(storage_of_books?.password_hashed as string))

        //         const book_storage_file = await this.getOrCreateBookStorageFile(client, storage_folder?.id as string, book)
        //         const db_book = await this.getOrCreateBook(client, storage_folder?.id as string, book)
        //         const book_storage_folder = await this.getOrCreateBookStorageFolder(client, storage_folder?.id as string, db_book?.id as string, book)

        //         const book_segment_documents = await this.langchainChatGPTService.splitLargeText(book.content, 1500); //TODO: add to seed options model.

        //         const book_embeddings = await this.langchainChatGPTService.makeEmbeddingsForTexts(book_segment_documents, ai.embeddings_name, ai.api_key as string)

        //         for (let author_index = 0; author_index < db_authors.length; author_index++) {
        //             const a = db_authors[author_index];
        //             if (book.authors.find(at => at.name === a.name))
        //                 await client.from('book_authors').upsert({
        //                     book_id: db_book?.id as string,
        //                     author_id: a.id
        //                 })
        //             else continue;
        //         }

        //         for (let si = 0; si < book_segment_documents.length; si++) {

        //             const segment = book_segment_documents[si]
        //             const embedding = book_embeddings[si]

        //             console.log('creating embeddding' + si)

        //             const { data } = await client.from('embeddings').upsert({
        //                 content: segment,
        //                 length: segment.length,
        //                 metadata: '',
        //                 name: `${book.title}${si}`
        //             }, { onConflict: 'name' }).select().single()

        //             await client.from('embedding_vectors_1536').upsert({
        //                 ai_model_id: ai.id,
        //                 embedding_id: data?.id as string,
        //                 vector: embedding as any
        //             }, { onConflict: 'embedding_id' })

        //             await client.from('book_segments').upsert({
        //                 book_id: db_book?.id as string,
        //                 embedding_id: data?.id as string,
        //                 type: BookSegmentTypes.Text,
        //                 index: si
        //             }, { onConflict: 'embedding_id' })
        //         }
        //     }

        // console.log("Finished seeding the database!")
        // } catch (ex) {
        //     this.logger.error(ex)
        //     throw ex;
        // }
    }
}