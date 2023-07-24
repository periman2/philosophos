'use client'
import PhButton from "@/components/ph-button"
import { useRouter } from "next/navigation"
import GitHubButton from 'react-github-btn'

export default function Page() {

    const router = useRouter()

    return <div className="m-7 p-7 flex flex-col items-center justify-start h-screen w-full max-w-3xl text-left text-gray-10/60 text-base font-thin overflow-y-auto">
        <PhButton onClick={() => {
            router.push('/')
        }}>
            Back to Insights
        </PhButton>
        <p>
            Philosophos is an always-on Artificial Intelligence agent that engages in a cycle of research depending on the latest goal set to it.
            This procedure can keep indefinitely and should generate valuable insights.
            The type and quality of research Philosophos is able to engage into is only limited by its resources and the quality of the AI models used.
        </p>
        <br />
        <p>
            Philosophos has the ability to change the strategy of research when it knows it is &quot;stuck&quot; on the fly. It is constantly reading its database in order to understand if the new insights it produces are not too similar with the existing ones.
            The same principle applies to all the prompts and settings used to make it engage in the research.
        </p>
        <br />
        <p>
            This is an ongoing research project and it is subject to change in the future.
        </p>
        <br />
        <br />
        <br />
        <p>
            For more information contact me at <a className="text-white" href="mailto:mrancientscript@protonmail.com">mrancientscript@protonmail.com</a>
        </p>
        <br />
        <GitHubButton href="https://github.com/periman2/philosophos"></GitHubButton>
    </div >
}