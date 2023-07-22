'use client'
import PhButton from "@/components/ph-button"
import { useRouter } from "next/navigation"

export default function Page() {

    const router = useRouter()

    return <div className="m-7 p-7 flex flex-col items-center justify-start h-screen w-full max-w-3xl text-left text-amber-200/60 text-base font-thin line-clamp-3 whitespace-break-spaces">
        <PhButton onClick={() => {
            router.push('/')
        }}>
            Back to Insights
        </PhButton>
        <p>
            Philosophos is an always-on Artificial Intelligence agent that engages in a cycle of research depending on the goals set to it.
            This procedure can keep indefinitely and should generate valuable insights.
            The type and quality of research Philosophos is able to engage into is only limited by its resources in terms of text and the quality of the AI models used.
        </p>
        <br />
        <p>
            Philosophos can change goal anytime on the fly as it is constantly reading its database to understand its own temporary purpose.
            The same principle applies to all the prompts used to make it engage in the research.
        </p>
        <br />
        <br />
        <br />
        <p>
            For more information contact me at <a className="text-white" href="mailto:mrancientscript@protonmail.com">mrancientscript@protonmail.com</a>
        </p>

    </div >
}