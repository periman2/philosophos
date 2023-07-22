import Insight from "./insight";

export default function Page({ params }: { params: { id: string } }) {
    return <Insight id={params.id} />
}