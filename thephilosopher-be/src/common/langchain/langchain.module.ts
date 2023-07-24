import { Module } from '@nestjs/common';
import { LangchainChatGPTService } from './langchain.chatgpt.service';

@Module({
    providers: [LangchainChatGPTService],
    exports: [LangchainChatGPTService]
})
export class LangchainModule { }
