'use client';

import supabase from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Insight({ id }: { id: string }) {
    const router = useRouter();
    const { data, isLoading } = useQuery({
        queryFn: async () => {
            const { data } = await supabase.from('insights').select('id, embeddings(id, content)').eq('id', id).limit(1).single().throwOnError();
            return data;
        },
        queryKey: ['insight', id]
    })

    if (isLoading) return <span className="loading loading-ring loading-lg mb-64"></span>

    const content = data?.embeddings
        .map(e => e.content)
        .join('\n\n')

    return (
        <>
            <button onClick={() => {
                router.push('/')
            }} className="btn bg-amber-50/20 hover:bg-amber-100/50 transition duration-300 hover:scale-105 text-white/80">Back to Insights</button>
            <div className="relative w-full max-w-3xl mx-auto bg-opacity-20 bg-gradient-to-b px-6 rounded-lg shadow-lg overflow-hidden">
                <div className="pl-14 p-b-3 pr-14 pt-14 space-y-6 prose max-h-96 overflow-y-auto">
                    <p className="text-white-200/60 font-thin whitespace-break-spaces">
                        {content}
                    </p>
                </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-gray-800 to-transparent" />
        </>
    )
}