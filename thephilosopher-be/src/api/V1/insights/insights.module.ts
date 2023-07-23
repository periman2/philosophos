import { Module } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { SupabaseModule } from 'src/common/supabase';
import { LangchainModule } from 'src/common/langchain/langchain.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, SupabaseModule, LangchainModule],
  providers: [InsightsService],
  controllers: [InsightsController]
})
export class InsightsModule {}
