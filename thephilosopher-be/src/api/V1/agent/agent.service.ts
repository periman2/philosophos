import { Injectable, Logger } from "@nestjs/common";
import { Supabase } from "src/common/supabase";
import { LangchainChatGPTService } from "src/common/langchain/langchain.chatgpt.service";
import { ConfigService } from "@nestjs/config";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "src/types/supabase";
import { DBTableRow } from "src/types/db";
import { Timeout } from "@nestjs/schedule";
import { AgentSettings } from "./interfaces/agent.settings.interface";


@Injectable()
export class AgentService {

    constructor(
        private readonly supabase: Supabase,
        private readonly langchainChatGPTService: LangchainChatGPTService,
        private readonly configService: ConfigService
    ) { }

    private readonly logger = new Logger(AgentService.name);
    private readonly agent_interval_seconds = parseInt(process.env.AGENT_INTERVAL_SECONDS);

    @Timeout(1000) //start this method a second after the server is started
    async execute() {
        try {

            this.logger.log('Excecuting agent.')

            const client = this.supabase.getClient();

            const { data: current_goal }: { data: DBTableRow<'goals'> & { goal_settings: DBTableRow<'goal_settings'> } } = await client
                .from('goals')
                .select('*, goal_settings(*)')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            const base_settings = <AgentSettings><unknown>current_goal?.goal_settings?.settings_base
            const dynamic_settings = <AgentSettings><unknown>current_goal?.goal_settings?.settings_dynamic

            if (!current_goal) {
                this.logger.error('Could not find latest goal. Will retry in a few seconds')
                return setTimeout(this.execute.bind(this), this.agent_interval_seconds)
            }

            this.logger.log(`The current goal of the agent is: ${current_goal.name}.`)

            const { data: latest_insights } = await client
                .from('insights')
                .select('id, goal_id, embeddings(id, content)')
                .eq('goal_id', current_goal.id)
                .order('created_at', { ascending: false })
                .limit(dynamic_settings.insight_inquiry_count)

            let inquiry_resources_prompt = '';

            if (latest_insights && latest_insights.length > 0) {
                inquiry_resources_prompt = `
                ${dynamic_settings.inquiry_resources_prompt}
                "${current_goal.description}"
                ${latest_insights.flatMap(i => i.embeddings.map(e => `\n"${e.content}"`)).join("\n")}
                `
            } else {
                inquiry_resources_prompt = `
                ${dynamic_settings.inquiry_resources_prompt}
                "${current_goal.description}"
                `
            }

            const results = await this.searchResources(client, inquiry_resources_prompt, dynamic_settings.organize_ideas_similarity, dynamic_settings.organize_ideas_match_count)

            const { data: text_resource_segments } = await client.from('text_resource_segments').select('*, text_resources(id)').in('id', results.map(r => r.id))

            const ideas_to_organize = [
                ...results.map(r => r.content),
                ...latest_insights.flatMap(i => i.embeddings.map(e => e.content))
            ]

            const organized_ideas = await this.organizeSearchResults(ideas_to_organize, current_goal, dynamic_settings)

            const analysis_result = await this.engageInMeditativeAnalysisProcess(organized_ideas, current_goal, dynamic_settings)

            const insights = await this.craftInsights(analysis_result, current_goal, dynamic_settings)

            const [insight_embedding] = await this.langchainChatGPTService.makeEmbeddingsForTexts([insights], this.configService.get("EMBEDDING_MODEL"))

            //TODO: save this in a db function transaction
            const { data: db_embedding } = await client.from('embeddings').insert({
                content: insights,
                embedding: insight_embedding as any,
                content_length: insights.length
            }).select("id").single().throwOnError()

            const { data: db_insight } = await client.from('insights').insert({
                goal_id: current_goal.id,
            }).select('id').single().throwOnError();

            await client.from('insight_embeddings').insert({
                embedding_id: db_embedding.id,
                insight_id: db_insight.id
            }).throwOnError()

            await client.from('insight_text_resources').upsert(text_resource_segments
                .flatMap(r => r.text_resources)
                .map(t => t.id)
                .filter((v, i, arr) => arr.indexOf(v) === i) //keep only unique values
                .map(t => ({
                    text_resource_id: t,
                    insight_id: db_insight.id
                })), { onConflict: 'insight_id, text_resource_id' }).throwOnError()

            this.logger.log('Philosopher finished an insight.')

            // setTimeout(this.execute.bind(this), this.agent_interval_seconds);
        } catch (ex) {
            this.logger.error(ex);
        }
    }

    private async craftInsights(analysis_result: string, current_goal: DBTableRow<'goals'>, settings: AgentSettings) {

        const craft_insight_process_chain = this.langchainChatGPTService.getChatChain({
            model: this.configService.get('OPENAI_CHAT_MODEL'),
            systemMessageTemplate: settings.insights_system_prompt,
            humanMessageTemplate: settings.insights_prompt,
            temperature: current_goal.meditative_process_temperature
        })

        const { text: insight } = await craft_insight_process_chain.call({
            goal_description: current_goal.description,
            analysis: analysis_result
        })

        if (!insight)
            throw new Error('Could not get result whilst running the craft_insight_process_chain')

        return insight as string;
    }

    private async engageInMeditativeAnalysisProcess(organized_ideas: string, current_goal: DBTableRow<'goals'>, settings: AgentSettings) {

        const craft_meditative_process_chain = this.langchainChatGPTService.getChatChain({
            model: this.configService.get('OPENAI_CHAT_MODEL'),
            systemMessageTemplate: settings.analysis_system_prompt,
            humanMessageTemplate: settings.analysis_prompt,
            temperature: current_goal.meditative_process_temperature
        })

        const { text: meditation_result } = await craft_meditative_process_chain.call({
            goal_description: current_goal.description,
            ideas: organized_ideas
        })

        if (!meditation_result)
            throw new Error('Could not get result whilst running the craft_meditative_process_chain')

        return meditation_result as string;
    }

    private async organizeSearchResults(results: string[], current_goal: DBTableRow<'goals'>, settings: AgentSettings) {

        const organize_resource_ideas_chain = this.langchainChatGPTService.getChatChain({
            model: this.configService.get('OPENAI_CHAT_MODEL'),
            systemMessageTemplate: settings.organize_ideas_system_prompt,
            humanMessageTemplate: settings.organize_ideas_summarize_prompt,
            temperature: settings.organize_ideas_temperature
        })
        
        const { text: organized_ideas } = await organize_resource_ideas_chain.call({
            goal_description: current_goal.description,
            ideas: results.map((r, i) => `IDEA ${i + 1}:${r}\n`).join("")
        })

        if (!organized_ideas)
            throw new Error('Could not get result whilst running the organize_resource_ideas_chain')

        return organized_ideas as string
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