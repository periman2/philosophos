import { Injectable } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
} from "langchain/prompts";
import { LLMChain } from 'langchain';

@Injectable()
export class LangchainChatGPTService {

    async splitLargeText(text: string, chunkSize: number, chunkOverlap: number) {
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
        return await textSplitter.splitText(text);
    }

    async splitLargeTextIntoDocs(text: string, chunkSize: number) {
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize });
        return await textSplitter.createDocuments([text]);
    }

    async makeEmbeddingsForTexts(texts: string[], model: string) {
        const embeddings = this.getOpenAIEmbeddings(model)
        return await embeddings.embedDocuments(texts);
    }

    getChatChain({ model, systemMessageTemplate, humanMessageTemplate, temperature }: { model: string, systemMessageTemplate: string, humanMessageTemplate: string, temperature: number }) {
        const chat = new ChatOpenAI({ temperature, modelName: model });
        const chat_prompt = ChatPromptTemplate.fromPromptMessages([
            SystemMessagePromptTemplate.fromTemplate(
                systemMessageTemplate
            ),
            HumanMessagePromptTemplate.fromTemplate(humanMessageTemplate),
        ])

        return new LLMChain({
            prompt: chat_prompt,
            llm: chat,
            verbose: false
        });
    }
    private getOpenAIEmbeddings(model: string) {
        return new OpenAIEmbeddings({ modelName: model }); //TODO: add to config
    }
}
