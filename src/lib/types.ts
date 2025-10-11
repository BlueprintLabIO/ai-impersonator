export type PromptLength = 'tiny' | 'short' | 'medium' | 'long';

export interface Character {
	id: string;
	name: string;
	tags: string[];
	prompts: {
		tiny: string; // 50 chars
		short: string; // 500 chars
		medium: string; // 2000 chars
		long: string; // 15000 chars
	};
}
