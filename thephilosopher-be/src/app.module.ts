import * as dotenv from 'dotenv'
dotenv.config()
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AgentModule } from './modules/agent/agent.module';
import { SeedModule } from './modules/seed/seed.module';
import { InsightsModule } from './api/V1/insights/insights.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AgentModule,
    SeedModule,
    InsightsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
