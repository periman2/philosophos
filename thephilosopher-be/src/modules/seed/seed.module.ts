import { Module } from "@nestjs/common";
import { SeedService } from "./seed.service";
import { SupabaseModule } from "src/common/supabase";
import { LangchainModule } from "src/common/langchain/langchain.module";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        ConfigModule,
        SupabaseModule,
        LangchainModule
    ],
    providers: [
        SeedService
    ],
    exports: [
        SeedService
    ]
})
export class SeedModule {
}
