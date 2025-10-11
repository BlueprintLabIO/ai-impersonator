<script lang="ts">
	import { page } from '$app/stores';
	import { characters } from '$lib/data/characters';
	import type { PromptLength } from '$lib/types';

	const character = characters.find((c) => c.id === $page.params.id);

	if (!character) {
		throw new Error('Character not found');
	}

	let selectedLength: PromptLength = 'long';

	const lengths: { key: PromptLength; label: string; description: string }[] = [
		{ key: 'tiny', label: 'Tiny', description: '~50 chars - Minimal identification' },
		{ key: 'short', label: 'Short', description: '~500 chars - Brief overview' },
		{ key: 'medium', label: 'Medium', description: '~5K chars - Detailed summary' },
		{ key: 'long', label: 'Long', description: '~50K chars - Complete persona' }
	];

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
	}

	function downloadPrompt(text: string, length: string) {
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${character.id}-${length}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>{character.name} - AI Impersonator Prompts</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Back button -->
		<div class="mb-6">
			<a
				href="/"
				class="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
			>
				<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 19l-7-7m0 0l7-7m-7 7h18"
					/>
				</svg>
				Back to all characters
			</a>
		</div>

		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-4xl font-bold text-gray-900">{character.name}</h1>
			<div class="mt-4 flex flex-wrap gap-2">
				{#each character.tags as tag}
					<span class="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
						{tag}
					</span>
				{/each}
			</div>
		</div>

		<!-- Length selector -->
		<div class="mb-6">
			<div class="border-b border-gray-200">
				<nav class="-mb-px flex space-x-8" aria-label="Tabs">
					{#each lengths as length}
						<button
							on:click={() => (selectedLength = length.key)}
							class="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors {selectedLength ===
							length.key
								? 'border-blue-600 text-blue-600'
								: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
						>
							<div class="text-left">
								<div>{length.label}</div>
								<div class="text-xs font-normal text-gray-500">
									{length.description}
								</div>
							</div>
						</button>
					{/each}
				</nav>
			</div>
		</div>

		<!-- Prompt display -->
		<div class="rounded-lg border border-gray-200 bg-white">
			<!-- Actions bar -->
			<div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
				<div class="flex items-center justify-between">
					<div class="text-sm text-gray-600">
						{character.prompts[selectedLength].length.toLocaleString()} characters
					</div>
					<div class="flex gap-3">
						<button
							on:click={() => copyToClipboard(character.prompts[selectedLength])}
							class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
						>
							<svg
								class="mr-2 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
								/>
							</svg>
							Copy
						</button>
						<button
							on:click={() =>
								downloadPrompt(character.prompts[selectedLength], selectedLength)}
							class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
						>
							<svg
								class="mr-2 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								/>
							</svg>
							Download
						</button>
					</div>
				</div>
			</div>

			<!-- Prompt content -->
			<div class="p-6">
				<pre
					class="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800">{character.prompts[selectedLength]}</pre>
			</div>
		</div>

		<!-- Quick switcher for other lengths -->
		<div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
			{#each lengths as length}
				{#if length.key !== selectedLength}
					<button
						on:click={() => (selectedLength = length.key)}
						class="rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
					>
						<div class="text-sm font-medium text-gray-900">{length.label}</div>
						<div class="mt-1 text-xs text-gray-500">
							{character.prompts[length.key].length.toLocaleString()} chars
						</div>
					</button>
				{/if}
			{/each}
		</div>
	</div>
</div>
