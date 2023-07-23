export default function TextResource({ title, author_names, url, id, onClick }: { title: string, author_names: string, url: string, id: string, onClick?: () => void }) {
    return <div onClick={onClick} className="bg-white bg-opacity-5 hover:bg-opacity-25 p-4 rounded-lg cursor-pointer transition duration-300 transform hover:scale-105 hover:shadow-2xl">
        <div className="text-gray-100/80 text-md font-thin line-clamp-3 whitespace-break-spaces">
            {title}
            <br />
            by {author_names}
            <br />
            {url && <p className="text-white/100">
                <a target="_blank" href={url}>{url}</a>
            </p>}
        </div>
    </div>
}