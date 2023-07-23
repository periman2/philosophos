import { Module } from "@nestjs/common";
import { SupabaseModule } from "src/common/supabase";
import { LangchainModule } from "src/common/langchain/langchain.module";
import { ConfigModule } from "@nestjs/config";
import { AgentService } from "./agent.service";

@Module({
    imports: [
        ConfigModule,
        SupabaseModule,
        LangchainModule
    ],
    providers: [
        AgentService
    ]
})
export class AgentModule {
}
