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
    existing_insight_match_threshold: number;
    analysis_inspiration_seeking_prompt: string;
    analysis_deep_dive_prompt: string;
    failed_run_times: number;
    max_runs_before_strategy_changes: number;
    change_strategy_prompt: string;
    change_strategy_system_prompt: string;
    strategy: string;
    change_strategy_temperature: number;
}