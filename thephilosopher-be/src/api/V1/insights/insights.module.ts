import { Module } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { SupabaseModule } from 'src/common/supabase';
import { LangchainModule } from 'src/common/langchain/langchain.module';
import { ConfigModule } from '@nestjs/config';
import { AgentModule } from 'src/modules/agent/agent.module';

@Module({
  imports: [ConfigModule, SupabaseModule, LangchainModule, AgentModule],
  providers: [InsightsService],
  controllers: [InsightsController]
})
export class InsightsModule {}
