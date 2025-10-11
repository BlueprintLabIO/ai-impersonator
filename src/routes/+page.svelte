<script lang="ts">
	import { characters } from '$lib/data/characters';
	import type { PromptLength } from '$lib/types';
	import Fuse from 'fuse.js';
	import { onMount } from 'svelte';

	let searchQuery = '';
	let selectedTags: string[] = [];
	let selectedLength: PromptLength = 'long';
	let fuse: Fuse<(typeof characters)[0]>;

	// Get all unique tags
	const allTags = Array.from(new Set(characters.flatMap((c) => c.tags))).sort();

	// Initialize Fuse.js
	onMount(() => {
		fuse = new Fuse(characters, {
			keys: ['name', 'tags'],
			threshold: 0.3
		});
	});

	// Filter characters based on search and tags
	$: filteredCharacters = (() => {
		let result = characters;

		// Apply search filter
		if (searchQuery && fuse) {
			result = fuse.search(searchQuery).map((r) => r.item);
		}

		// Apply tag filter
		if (selectedTags.length > 0) {
			result = result.filter((char) => selectedTags.some((tag) => char.tags.includes(tag)));
		}

		return result;
	})();

	function toggleTag(tag: string) {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}

	function downloadPrompt(character: string, prompt: string) {
		const blob = new Blob([prompt], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${character.toLowerCase().replace(/\s+/g, '-')}-${selectedLength}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function getLengthLabel(length: PromptLength): string {
		const labels = {
			tiny: '~50 chars',
			short: '~500 chars',
			medium: '~5K chars',
			long: '~50K chars'
		};
		return labels[length];
	}
</script>

<div class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-4xl font-bold text-gray-900">AI Impersonator Prompts</h1>
			<p class="mt-2 text-lg text-gray-600">
				Role-play prompts for famous programmers at varying lengths
			</p>
		</div>

		<!-- Search and Filters -->
		<div class="mb-8 space-y-4">
			<!-- Search -->
			<div>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search characters..."
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
				/>
			</div>

			<!-- Prompt Length Selector -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Prompt Length</label>
				<div class="flex flex-wrap gap-2">
					{#each ['tiny', 'short', 'medium', 'long'] as length}
						<button
							on:click={() => (selectedLength = length)}
							class="rounded-lg px-4 py-2 text-sm font-medium transition-colors {selectedLength ===
							length
								? 'bg-blue-600 text-white'
								: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}"
						>
							{getLengthLabel(length)}
						</button>
					{/each}
				</div>
			</div>

			<!-- Tags Filter -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Filter by tags</label>
				<div class="flex flex-wrap gap-2">
					{#each allTags as tag}
						<button
							on:click={() => toggleTag(tag)}
							class="rounded-full px-3 py-1 text-sm transition-colors {selectedTags.includes(tag)
								? 'bg-blue-600 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
						>
							{tag}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Results count -->
		<div class="mb-4 text-sm text-gray-600">
			Showing {filteredCharacters.length} of {characters.length} characters
		</div>

		<!-- Character Cards -->
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each filteredCharacters as character (character.id)}
				<div class="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
					<a href="/{character.id}" class="block p-6">
						<h3 class="text-xl font-semibold text-gray-900">{character.name}</h3>

						<!-- Tags -->
						<div class="mt-3 flex flex-wrap gap-1">
							{#each character.tags.slice(0, 3) as tag}
								<span class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
									{tag}
								</span>
							{/each}
							{#if character.tags.length > 3}
								<span class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
									+{character.tags.length - 3}
								</span>
							{/if}
						</div>

						<!-- Prompt Preview -->
						<div class="mt-4">
							<div class="text-sm text-gray-700">
								<div class="max-h-32 overflow-hidden">
									<p class="line-clamp-4">
										{character.prompts[selectedLength].substring(0, 200)}...
									</p>
								</div>
							</div>
						</div>

						<!-- Character count -->
						<div class="mt-4 text-xs text-gray-500">
							{character.prompts[selectedLength].length.toLocaleString()} characters
						</div>
					</a>

					<!-- Actions -->
					<div class="border-t border-gray-100 p-4 flex gap-2">
						<button
							on:click|stopPropagation={() => copyToClipboard(character.prompts[selectedLength])}
							class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
						>
							Copy
						</button>
						<button
							on:click|stopPropagation={() => downloadPrompt(character.name, character.prompts[selectedLength])}
							class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Download
						</button>
					</div>
				</div>
			{/each}
		</div>

		{#if filteredCharacters.length === 0}
			<div class="mt-8 text-center">
				<p class="text-gray-500">No characters found matching your filters.</p>
			</div>
		{/if}
	</div>
</div>
