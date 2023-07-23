'use client'

import PhButton from "@/components/ph-button";
import TextResource from "@/components/text-resource";
import supabase from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Library() {

    const router = useRouter()

    const { data, isLoading, error } = useQuery({
        queryFn: async () => {
            const { data } = await supabase.from('text_resources').select('id, title, author_names, url').throwOnError();
            return data;
        },
        queryKey: ['text_resource_list']
    })

    if (isLoading) return <span className="loading loading-ring loading-lg mb-64"></span>

    return <>
        <PhButton onClick={() => {
            router.push('/')
        }}>Back to Insights</PhButton>
        <div className="text-gray-100/80 text-md"   >
            Philosophos has read these {data?.length} books so far
        </div>
        <div className="relative w-full max-w-3xl mx-auto bg-opacity-20 bg-gradient-to-b px-6 rounded-lg shadow-lg transition duration-300 hover:scale-105 overflow-hidden">
            <div className="pl-14 pr-14 pt-14 space-y-6 prose max-h-96 overflow-y-auto">
                {!isLoading && data?.map(d =>
                    <TextResource author_names={d.author_names as string} id={d.id} title={d.title} url={d.url as string} key={d.id} />
                )}
            </div>
        </div>
    </>
}