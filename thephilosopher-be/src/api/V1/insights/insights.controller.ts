import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { SupabaseGuard } from 'src/common/supabase';
import { SearchEmbeddingsDto } from './insights.dto';

@UseGuards(SupabaseGuard)
@Controller('v1/insights')
export class InsightsController {

    constructor(private readonly insightsService: InsightsService) { }

    @Get('search')
    async searchInsights(@Query() reqBody: SearchEmbeddingsDto) {
        return this.insightsService.searchInsights(reqBody)
    }
}
