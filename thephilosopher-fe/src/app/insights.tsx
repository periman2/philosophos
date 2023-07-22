'use client';

import PhButton from "@/components/ph-button";
import supabase from "@/utils/supabase";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { v1 } from "uuid";

export default function Insights() {
    const router = useRouter();
    const [nextInsightTime, setNextInsightTime] = useState(0)
    const pageSize = 2;

    const lastInsightRef = useRef<HTMLElement>(null)

    const { ref, entry } = useIntersection({
        root: lastInsightRef.current,
        threshold: 1
    })

    const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
        ['insights_list_infinite'],
        async ({ pageParam = 1 }) => {
            const { data } = await supabase
                .from('insights')
                .select('id, created_at, embeddings(id, content)')
                .range((pageParam - 1) * pageSize, pageSize)
                .throwOnError();
            return data;
        },
        {
            getNextPageParam: (_, pages) => {
                return pages.length + 1
            },
            initialData: {
                pageParams: [1],
                pages: []
            }
        }
    )

    if (entry?.isIntersecting) fetchNextPage()

    // const { data, isLoading } = useQuery({
    //     queryFn: async () => {
    //         const { data } = await supabase.from('insights').select('id, text_resources(id, title, author_names, url), embeddings(id, content)').limit(5).throwOnError();
    //         return data;
    //     },
    //     queryKey: ['insights_list']
    // })

    if (isFetchingNextPage) return <span className="loading loading-ring loading-lg mb-64"></span>

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
            <div className="w-full max-w-3xl text-center text-amber-200/60 text-sm font-thin line-clamp-3 whitespace-break-spaces">
                <p>Philosophos is thinking <span className="loading loading-ring loading-xs"></span></p>
                <p>The next insight will manifest in approximately {nextInsightTime || 1} minutes.</p>
            </div >
            <div className="relative w-full max-w-3xl mx-auto bg-opacity-20 bg-gradient-to-b px-6 rounded-lg shadow-lg transition duration-300 hover:scale-105 overflow-hidden">
                <div className="pl-14 pr-14 pt-14 text-sm space-y-6 prose max-h-96 overflow-y-auto">
                    {data?.pages && insights_parsed?.map((d, i) =>
                        <div ref={i === insights_parsed.length ? ref : undefined} onClick={() => { d?.f_id && router.push(d.f_id) }} key={d?.id} className="bg-white bg-opacity-5 hover:bg-opacity-25 p-4 rounded-lg cursor-pointer transition duration-300 transform hover:scale-105 hover:shadow-2xl">
                            <p className="text-amber-200/60 font-thin line-clamp-3 whitespace-break-spaces">
                                {d?.content}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-gray-800 to-transparent" />
        </>
    )
}