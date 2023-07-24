export const chunkArray = async <T>(arr: T[], max_chunk_size: number, onChunk: (chunk: T[], index: number)=> (void | Promise<void>)) => {

    for (let i = 0; i < arr.length; i += max_chunk_size)
        await Promise.resolve(onChunk(arr.slice(i, i + max_chunk_size), i))
}