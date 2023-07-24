'use client';

import PhButton from "@/components/ph-button";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface SearchEmbeddingsDto {
    text: string
    threshold: number
    match_count: number
}

export interface SearchEmbeddingsResponseDto {
    embedding_id: string
    insight_id: string
    content: string
    similarity: number
}

export default function Search() {

    const router = useRouter()

    const searchParams = useSearchParams()
    const queryText = searchParams.get('text')
    const [search, setSearch] = useState<string>(queryText || '')

    const { data: searchResults, isLoading, error, refetch, isFetching } = useQuery({
        queryFn: async () => {
            const { data } = await axios.get<SearchEmbeddingsResponseDto[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/v1/insights/search`, {
                params: {
                    match_count: 3,
                    text: search,
                    threshold: 0.8
                } as SearchEmbeddingsDto,
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                }
            })
            console.log('data: ', data);
            return data;
        },
        queryKey: ['search'],
        initialData: [],
        enabled: false
    })

    useEffect(() => {
        if (queryText) {
            refetch()
        }
    }, [])

    if (isLoading || isFetching) return <span className="loading loading-ring loading-lg mb-64"></span>

    const onSearchSubmit = () => {
        if (search && search !== '') {
            router.replace(`/search/?text=${search}`, { scroll: false })
            refetch();
        }
    }

    return <>
        <PhButton onClick={() => {
            router.push('/')
        }}>Back to Insights</PhButton>
        <p className="text-gray-100/80 text-md">
            Search for insights using semantic meaning
        </p>
        <div className="join w-8/12 place-content-center">
            <input value={search} type="text" placeholder="Example: What is the meaning of life?" className="text-gray-100/80 input rounded-l-full input-bordered w-full join-item bg-amber-50/10" onKeyDown={(ev) => {
                if (ev.key === 'Enter') {
                    onSearchSubmit();
                }
            }} onChange={(e) => {
                setSearch(e.target.value)
            }} />
            <button className="btn join-item rounded-r-full bg-amber-50/10 hover:bg-amber-50/40" onClick={onSearchSubmit}>Search</button>
        </div>
        <div className="relative w-full max-w-3xl mx-auto bg-opacity-20 bg-gradient-to-b px-6 rounded-lg shadow-lg transition duration-300 hover:scale-105 overflow-hidden">
            <div className="pl-14 pr-14 pt-14 space-y-6 prose max-h-96 overflow-y-auto">
                {searchResults && searchResults?.map((d, i) => {
                    return <div onClick={() => { d?.insight_id && router.push(d.insight_id) }} key={d?.insight_id} className="bg-white bg-opacity-5 hover:bg-opacity-25 p-4 rounded-lg cursor-pointer transition duration-300 transform hover:scale-105 hover:shadow-2xl">
                        <p className="text-gray-100/80 text-left font-thin line-clamp-3 whitespace-break-spaces">
                            {d?.content}
                        </p>
                    </div>
                })}
            </div>
        </div>
    </>
}