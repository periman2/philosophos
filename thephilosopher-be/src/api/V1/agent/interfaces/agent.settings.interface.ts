export interface AgentSettings {
    insight_inquiry_count: number;
    inquiry_resources_prompt: string;
    organize_ideas_similarity: number;
    organize_ideas_match_count: number;
    organize_ideas_system_prompt: string;
    organize_ideas_summarize_prompt: string;
    organize_ideas_temperature: number;
    analysis_system_prompt: string;
    analysis_prompt: string;
    analysis_temperature: number;
    insights_system_prompt: string;
    insights_prompt: string;
    insights_temperature: number;
    runs_made?: number
    runs_set?: number
}