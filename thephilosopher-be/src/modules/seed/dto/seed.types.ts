
export interface Author {
    name: string;
    birth_year: number;
    death_year: number;
}

export interface Formats {
    [key: string]: string;
}

export interface Book {
    id: number;
    title: string;
    authors: Author[];
    translators: any[]; // Adjust the type accordingly if translators have a defined structure
    subjects: string[];
    bookshelves: string[];
    languages: string[];
    copyright: boolean;
    media_type: string;
    formats: Formats;
    download_count: number;
    file_path?: string;
    content: string;
}

export interface BooksResponse {
    count: number
    next: string | null
    previous: string | null
    results: Book[]
}