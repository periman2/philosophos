import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { SupabaseGuard } from 'src/common/supabase';
import { SearchEmbeddingsDto } from './insights.dto';
import { AgentService } from 'src/modules/agent/agent.service';

@UseGuards(SupabaseGuard)
@Controller('v1/insights')
export class InsightsController {

    constructor(private readonly insightsService: InsightsService, private readonly agentService: AgentService) { }

    @Get('search')
    async searchInsights(@Query() reqBody: SearchEmbeddingsDto) {
        return this.insightsService.searchInsights(reqBody)
    }
    @Post('generate')
    async generateInsight(@Query() reqBody: SearchEmbeddingsDto) {
        await this.agentService.execute()
    }
}
