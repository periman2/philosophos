import * as dotenv from 'dotenv'
dotenv.config()
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedModule } from './api/V1/seed/seed.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SeedModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
