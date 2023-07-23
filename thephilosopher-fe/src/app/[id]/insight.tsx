'use client';

import PhButton from "@/components/ph-button";
import TextResource from "@/components/text-resource";
import { formatDateString } from "@/utils/datetime";
import supabase from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Insight({ id }: { id: string }) {

    const router = useRouter();

    const { data, isLoading } = useQuery({
        queryFn: async () => {
            const { data } = await supabase.from('insights').select('id, created_at, embeddings(id, content), text_resources(id, title, author_names, url)').eq('id', id).limit(1).single().throwOnError();
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
            <PhButton onClick={() => {
                router.push('/')
            }}>
                Back to Insights
            </PhButton>
            <PhButton onClick={() => (window as any).resources_modal.showModal()}>
                Show insight resources
            </PhButton>
            <dialog id="resources_modal" className="modal ">
                <form method="dialog" className="modal-box h-96 bg-zinc-900">
                    <div className="h-60 overflow-y-auto">
                        {data?.text_resources.map(r => <TextResource title={r.title} author_names={r.author_names as string} id={r.id} url={r.url as string} key={r.id} />)}
                    </div>
                    <div className="modal-action">
                        <PhButton>
                            Close
                        </PhButton>
                    </div>
                </form>
            </dialog>
            <p className="ml-72∂">{formatDateString(data?.created_at as string)}</p>
            <div className="relative w-full max-w-3xl mx-auto bg-opacity-20 bg-gradient-to-b px-6 rounded-lg shadow-lg overflow-hidden">
                <div className="pl-14 p-b-3 pr-14 pt-14 space-y-6 prose max-h-96 overflow-y-auto">
                    <p className="text-gray-100/80 font-thin whitespace-break-spaces">
                        {content}
                    </p>
                </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-gray-800 to-transparent" />
        </>
    )
}