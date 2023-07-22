import { Injectable, Logger } from "@nestjs/common";
import { Supabase } from "src/common/supabase";
import { LangchainChatGPTService } from "src/common/langchain/langchain.chatgpt.service";
import { ConfigService } from "@nestjs/config";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "src/types/supabase";
import { DBTableRow } from "src/types/db";
import { Timeout } from "@nestjs/schedule";

@Injectable()
export class AgentService {

    constructor(
        private readonly supabase: Supabase,
        private readonly langchainChatGPTService: LangchainChatGPTService,
        private readonly configService: ConfigService
    ) { }

    private readonly logger = new Logger(AgentService.name);
    private readonly agent_interval_seconds = parseInt(process.env.AGENT_INTERVAL_SECONDS)

    // @Timeout(1000) //start this method a second after the server is started
    async execute() {
        try {

            this.logger.log('Excecuting agent.')

            const client = this.supabase.getClient();

            const { data: latest_goal } = await client
                .from('goals')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            console.log('latest goal is : ', latest_goal?.name)

            if (!latest_goal) {
                this.logger.error('Could not find latest goal. Will retry in a few seconds')
                return setTimeout(this.execute.bind(this), 10000)
            }

            this.logger.log(`The current goal of the agent is: ${latest_goal.name}.`)

            const { data: latest_insights } = await client
                .from('insights')
                .select('id, goal_id, embeddings(id, content)')
                .eq('goal_id', latest_goal.id)
                .order('created_at', { ascending: false })
                .limit(2)

            let inquiry_resources_prompt = '';

            if (latest_insights && latest_insights.length > 0) {
                inquiry_resources_prompt = `
                Ideas or concepts similar to the following:
                "${latest_goal.description}"
                ${latest_insights.map(i => i.embeddings.map(e => `\n"${e.content}"`))}
                `
            } else {
                inquiry_resources_prompt = `
                Ideas or concepts similar to the following:
                "${latest_goal.description}"
                `
            }

            console.log('inquiry_resources_prompt: ', inquiry_resources_prompt)

            const results = await this.searchResources(client, inquiry_resources_prompt, latest_goal.organize_ideas_resource_similarity, latest_goal.organize_ideas_match_count)

            const ideas_to_organize = [
                ...results.map(r => r.content),
                ...latest_insights.flatMap(i => i.embeddings.map(e => e.content))
            ]

            const organized_ideas = await this.organizeSearchResults(ideas_to_organize, latest_goal)

            const analysis_result = await this.engageInMeditativeAnalysisProcess(organized_ideas, latest_goal)

            const insights = await this.craftInsights(analysis_result, latest_goal)


            const [insight_embedding] = await this.langchainChatGPTService.makeEmbeddingsForTexts([insights], this.configService.get("EMBEDDING_MODEL"))

            //TODO: save this in a db function transaction
            const { data: db_embedding } = await client.from('embeddings').insert({
                content: insights,
                embedding: insight_embedding as any,
                content_length: insights.length
            }).select("id").single().throwOnError()

            const { data: db_insight } = await client.from('insights').insert({
                goal_id: latest_goal.id,
            }).select('id').single().throwOnError();

            await client.from('insight_embeddings').insert({
                embedding_id: db_embedding.id,
                insight_id: db_insight.id
            })
            
            this.logger.log(`\n\n\n Insights :
            ${insights}`)

            setTimeout(this.execute.bind(this), 5000);
        } catch (ex) {
            this.logger.error(ex);
        }
    }

    private async craftInsights(analysis_result: string, latest_goal: DBTableRow<'goals'>) {

        const craft_insight_process_system_prompt = `You are an expert philosopher and logical thinker called "Philosophos".
        {goal_description}`

        const craft_insight_process_prompt = `Follow the following rules for the purpose of coming up with a new and original insight:
        1. Read the following analysis and extract what you think is the single most valuable insight. 
        2. In the process of elimination should consider the insights that would align with your goals the most but also explore new pathways that might seem irrelevant now. 
        3. You should explain the structure of the insight, realizing its relevance to the philosophical ideas present in the analysis but do not mention the analysis itself.
        4. Describe your thoughts in such a way that further research by you may improve upon it.
        5. Your prose should be beautiful and elegant.

        The analysis: "{analysis}"`

        const craft_insight_process_chain = this.langchainChatGPTService.getChatChain({
            model: this.configService.get('OPENAI_CHAT_MODEL'),
            systemMessageTemplate: craft_insight_process_system_prompt,
            humanMessageTemplate: craft_insight_process_prompt,
            temperature: latest_goal.meditative_process_temperature
        })

        const { text: insight } = await craft_insight_process_chain.call({
            goal_description: latest_goal.description,
            analysis: analysis_result
        })

        if (!insight)
            throw new Error('Could not get result whilst running the craft_insight_process_chain')

        return insight as string;
    }

    private async engageInMeditativeAnalysisProcess(organized_ideas: string, latest_goal: DBTableRow<'goals'>) {

        const craft_meditative_process_system_prompt = `You are an expert philosopher and logical thinker called "Philosophos".
        {goal_description}`

        const craft_meditative_process_prompt = `Engage in an internal meditative process for the ideas and concepts provided.
        Try to find a deeper knowledge by breaking each idea into the steps required for understanding it and inquire yourself about what possibilities they could allow for new ideas to arise. 
        Lay out those new ideas if they are present and always keep in mind of your goal. 
        Explain your thought process in detail for each step.
        Ideas: "{ideas}"`

        const craft_meditative_process_chain = this.langchainChatGPTService.getChatChain({
            model: this.configService.get('OPENAI_CHAT_MODEL'),
            systemMessageTemplate: craft_meditative_process_system_prompt,
            humanMessageTemplate: craft_meditative_process_prompt,
            temperature: latest_goal.meditative_process_temperature
        })

        const { text: meditation_result } = await craft_meditative_process_chain.call({
            goal_description: latest_goal.description,
            ideas: organized_ideas
        })

        if (!meditation_result)
            throw new Error('Could not get result whilst running the craft_meditative_process_chain')

        return meditation_result as string;
    }

    private async organizeSearchResults(results: string[], latest_goal: DBTableRow<'goals'>) {

        const organize_resource_ideas_system_prompt = `You are an expert philosopher and logical thinker called "Philosophos".
        {goal_description}
        `
        const organize_resource_ideas_summarize_prompt = `Combine the following philosophical ideas into a coherent paragraph:
        {ideas}`

        const organize_resource_ideas_chain = this.langchainChatGPTService.getChatChain({
            model: this.configService.get('OPENAI_CHAT_MODEL'),
            systemMessageTemplate: organize_resource_ideas_system_prompt,
            humanMessageTemplate: organize_resource_ideas_summarize_prompt,
            temperature: latest_goal.organize_ideas_temperature
        })

        const { text: oranized_ideas } = await organize_resource_ideas_chain.call({
            goal_description: latest_goal.description,
            ideas: results.map((r, i) => `IDEA ${i + 1}:${r}\n`).join("")
        })

        if (!oranized_ideas)
            throw new Error('Could not get result whilst running the organize_resource_ideas_chain')

        return oranized_ideas as string
    }

    private async searchResources(client: SupabaseClient<Database>, content: string, similarity_threshold: number, match_count: number) {
        if (similarity_threshold > 1)
            similarity_threshold = 1
        if (similarity_threshold <= 0)
            similarity_threshold = 0.01
        const [embedding] = await this.langchainChatGPTService
            .makeEmbeddingsForTexts([content], this.configService.get("EMBEDDING_MODEL"));
        const { data } = await client.rpc('match_text_resource_segments', {
            match_count: match_count,
            match_threshold: similarity_threshold,
            query_embedding: embedding as any
        }).throwOnError()
        return data;
    }
}