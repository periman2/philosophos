'use client';

import PhButton from "@/components/ph-button";
import supabase from "@/utils/supabase";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Insights() {
    const router = useRouter();

    const pageSize = 5;

    const containerRef = useRef(null)
    const [count, setCount] = useState(0);

    const { ref, entry } = useIntersection({
        root: containerRef.current,
        threshold: 0.5
    })

    const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
        ['insights_list_infinite'],
        async ({ pageParam = 1 }) => {

            const from = (pageParam - 1) * pageSize
            const to = (pageParam - 1) * pageSize + pageSize - 1;

            const { data, count } = await supabase
                .from('insights')
                .select('id, created_at, embeddings(id, content)', { count: 'exact' })
                .range(from, to)
                .order('created_at', { ascending: false })
                .throwOnError();

            setCount(count as number);
            return data;
        },
        {
            getNextPageParam: (_, pages) => {
                return pages.length + 1
            },
            initialData: {
                pageParams: [1],
                pages: []
            },

        }
    )

    useEffect(() => {
        const current_length = data?.pages.flatMap(p => p).length || 0
        if (entry?.isIntersecting && count > current_length) fetchNextPage()
    }, [entry, count])

    const insights_parsed = data?.pages
        .flatMap(d => d)
        .flatMap(d => d?.embeddings.map(e => ({ ...e, f_id: d.id })))

    return (
        <>
            <div className="w-full max-w-3xl text-center text-amber-200/60 text-sm font-thin line-clamp-3 whitespace-break-spaces">
                <PhButton onClick={() => {
                    router.push('/library')
                }}>
                    Library
                </PhButton>
                <PhButton onClick={() => {
                    router.push('/about')
                }}>
                    About
                </PhButton>
            </div>
            <div className="w-full max-w-3xl pb-5 text-center text-amber-200/60 text-sm font-thin line-clamp-3 whitespace-break-spaces">
                <p>Philosophos is thinking <span className="loading loading-ring loading-xs"></span></p>
                <p>The next insight will manifest shortly.</p>
            </div >
            <div className="text-center relative w-full max-w-3xl mx-auto bg-opacity-20 bg-gradient-to-b px-6 rounded-lg shadow-lg transition duration-300 hover:scale-105 overflow-hidden">
                <div ref={containerRef} className="pl-14 pr-14 pt-14 text-sm space-y-6 prose max-h-80 h-80 overflow-y-auto">
                    {data?.pages && insights_parsed?.map((d, i) => {
                        return <div ref={i === insights_parsed.length - 1 ? ref : undefined} onClick={() => { d?.f_id && router.push(d.f_id) }} key={d?.id} className="bg-white bg-opacity-5 hover:bg-opacity-25 p-4 rounded-lg cursor-pointer transition duration-300 transform hover:scale-105 hover:shadow-2xl">
                            <p className="text-amber-200/60 text-left font-thin line-clamp-3 whitespace-break-spaces">
                                {d?.content}
                            </p>
                        </div>
                    }
                    )}

                    {isFetchingNextPage && <span className="loading loading-ring loading-md mx-auto"></span>}
                </div>
            </div>
        </>
    )
}