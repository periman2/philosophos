import { Injectable } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

@Injectable()
export class LangchainChatGPTService {

    async splitLargeText(text: string, chunkSize: number) {
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize });
        return await textSplitter.splitText(text);
    }

    async splitLargeTextIntoDocs(text: string, chunkSize: number) {
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize });
        return await textSplitter.createDocuments([text]);
    }

    async makeEmbeddingsForTexts(texts: string[], model: string, apiKey: string) {
        const embeddings = this.getOpenAIEmbeddings(model, apiKey)
        return await embeddings.embedDocuments(texts);
    }

    private getOpenAIEmbeddings(model: string, apiKey: string) {
        return new OpenAIEmbeddings({ modelName: model, openAIApiKey: apiKey }); //TODO: add to config
    }
}
