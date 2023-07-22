'use client';

import supabase from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Insights() {
    const router = useRouter();
    const { data, isLoading } = useQuery({
        queryFn: async () => {
            const { data } = await supabase.from('insights').select('id, embeddings(id, content)').limit(5).throwOnError();
            return data;
        },
        queryKey: ['insights_list']
    })
    if (isLoading) return <span className="loading loading-ring loading-lg mb-64"></span>
    return (
        <>
            <div className="relative w-full max-w-3xl mx-auto bg-opacity-20 bg-gradient-to-b px-6 rounded-lg shadow-lg transition duration-300 hover:scale-105 overflow-hidden">
                <div className="pl-14 pr-14 pt-14 space-y-6 prose max-h-96 overflow-y-auto">
                    {!isLoading && data?.flatMap(d => d.embeddings.map(e => ({ ...e, f_id: d.id }))).map(d =>
                        <div onClick={() => {router.push(d.f_id)}} key={d.id} className="bg-white bg-opacity-5 hover:bg-opacity-25 p-4 rounded-lg cursor-pointer transition duration-300 transform hover:scale-105 hover:shadow-2xl">
                            <p className="text-amber-200/60 font-thin line-clamp-3 whitespace-break-spaces">
                                {d.content}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-gray-800 to-transparent" />
        </>
    )
}