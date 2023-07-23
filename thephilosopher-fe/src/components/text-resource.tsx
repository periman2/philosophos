export default function TextResource({ title, author_names, url, id }: { title: string, author_names: string, url: string, id: string }) {
    return <div className="bg-white bg-opacity-5 hover:bg-opacity-25 p-4 rounded-lg cursor-pointer transition duration-300 transform hover:scale-105 hover:shadow-2xl">
        <p className="text-amber-200/60 text-sm font-thin line-clamp-3 whitespace-break-spaces">
            {title}
            <br />
            by {author_names}
            <br />
            {url && <p className="text-white">
                <a target="_blank" href={url}>{url}</a>
            </p>}
        </p>
    </div>
}