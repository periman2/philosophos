import * as dotenv from 'dotenv'
dotenv.config()
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedModule } from './api/V1/seed/seed.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AgentModule } from './api/V1/agent/agent.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AgentModule,
    SeedModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
