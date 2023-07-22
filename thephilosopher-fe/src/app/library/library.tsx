'use client'

import PhButton from "@/components/ph-button";
import supabase from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Library() {

    const router = useRouter()

    const { data, isLoading, error } = useQuery({
        queryFn: async () => {
            const { data } = await supabase.from('text_resources').select('id, title, author_names, url').throwOnError();
            console.log('data are : ', data);
            return data;
        },
        queryKey: ['text_resource_list']
    })

    if (isLoading) return <span className="loading loading-ring loading-lg mb-64"></span>

    return <>
        <PhButton onClick={() => {
            router.push('/')
        }}>Back to Insights</PhButton>
        <div className="text-amber-200/60 text-lg font-thin line-clamp-3 whitespace-break-spaces"   >
            Philosophos has read these {data?.length} books so far
        </div>
        <div className="relative w-full max-w-3xl mx-auto bg-opacity-20 bg-gradient-to-b px-6 rounded-lg shadow-lg transition duration-300 hover:scale-105 overflow-hidden">
            <div className="pl-14 pr-14 pt-14 space-y-6 prose max-h-96 overflow-y-auto">
                {!isLoading && data?.map(d =>
                    <div key={d.id} className="bg-white bg-opacity-5 hover:bg-opacity-25 p-4 rounded-lg cursor-pointer transition duration-300 transform hover:scale-105 hover:shadow-2xl">
                        <p className="text-amber-200/60 text-sm font-thin line-clamp-3 whitespace-break-spaces">
                            {d.title}
                            <br />
                            by {d.author_names}
                            <br />
                            {d.url && <p>
                                visit at <a target="_blank" href={d.url}>{d.url}</a>
                            </p>}
                        </p>
                    </div>
                )}
            </div>
        </div>
    </>
}