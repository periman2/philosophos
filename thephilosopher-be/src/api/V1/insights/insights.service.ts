import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LangchainChatGPTService } from 'src/common/langchain/langchain.chatgpt.service';
import { SupabaseRequest } from 'src/common/supabase/supabase.request';
import { SearchEmbeddingsDto } from './insights.dto';

@Injectable()
export class InsightsService {
    constructor(
        private readonly langchain: LangchainChatGPTService, 
        private readonly configService: ConfigService,
        private readonly supabase: SupabaseRequest
        ) { }

    async searchInsights({ text, threshold, match_count }: SearchEmbeddingsDto) {

        const client = this.supabase.getClient();

        const [search_embeddings] = await this.langchain.makeEmbeddingsForTexts([text], this.configService.get("EMBEDDING_MODEL"))

        const { data: similarInsight } = await client.rpc('match_insight_embeddings', {
            match_count: match_count,
            match_threshold: threshold,
            query_embedding: search_embeddings as any
        }).throwOnError()

        return similarInsight
    }

}
