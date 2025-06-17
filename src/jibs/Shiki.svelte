<script>
  import { onMount } from 'svelte';
  import { codeToHtml } from 'shiki';

  let code_sample = $state(`function hello() {
  console.log("Hello, world!");
  return "Welcome to Shiki!";
}

// Try editing this code!
const result = hello();`);

  let selectedLanguage = $state('javascript');
  let selectedTheme = $state('github-dark');
  let highlightedHtml = $state('');
  let isLoading = $state(false);

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 
    'rust', 'go', 'php', 'ruby', 'swift', 'kotlin', 'dart',
    'html', 'css', 'json', 'yaml', 'xml', 'markdown', 'bash'
  ];

  // Using correct Shiki v3 theme names
  const themes = [
    'github-dark', 'github-light', 'dracula', 'nord', 'monokai',
    'one-dark-pro', 'material-theme-palenight', 'solarized-dark',
    'solarized-light', 'vs-dark', 'tokyo-night', 'vitesse-dark',
    'vitesse-light', 'material-theme', 'material-theme-darker',
    'houston', 'min-dark', 'min-light'
  ];

  async function updateHighlight() {
    if (!code_sample.trim()) {
      highlightedHtml = '';
      return;
    }
    
    isLoading = true;
    try {
      const html = await codeToHtml(code_sample, {
        lang: selectedLanguage,
        theme: selectedTheme
      });
      highlightedHtml = html;
    } catch (error) {
      console.error('Highlighting error:', error);
      highlightedHtml = `<pre><code>${code_sample}</code></pre>`;
    }
    isLoading = false;
  }

  // Update highlight when code, language, or theme changes  
  $effect(() => {
    updateHighlight();
  });

  onMount(() => {
    updateHighlight();
  });
</script>

<div class="p-6 max-w-6xl mx-auto">
  <h1 class="text-3xl font-bold mb-4">Shiki Live Preview</h1>
  <p class="text-gray-600 mb-6">
    Type or paste code in the textarea below to see it highlighted in real-time with Shiki.
  </p>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Input Section -->
    <div class="space-y-4">
      <div class="flex gap-4">
        <div class="flex-1">
          <label for="language" class="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select 
            id="language"
            bind:value={selectedLanguage}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {#each languages as lang}
              <option value={lang}>{lang}</option>
            {/each}
          </select>
        </div>
        
        <div class="flex-1">
          <label for="theme" class="block text-sm font-medium text-gray-700 mb-1">
            Theme
          </label>
          <select 
            id="theme"
            bind:value={selectedTheme}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {#each themes as theme}
              <option value={theme}>{theme}</option>
            {/each}
          </select>
        </div>
      </div>

      <div>
        <label for="code-input" class="block text-sm font-medium text-gray-700 mb-1">
          Code Input
        </label>
        <textarea
          id="code-input"
          bind:value={code_sample}
          placeholder="Enter your code here..."
          class="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
        ></textarea>
      </div>
    </div>

    <!-- Preview Section -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">Live Preview</h2>
      
      {#if isLoading}
        <div class="flex items-center justify-center h-96 bg-gray-100 rounded-md">
          <div class="text-gray-500">Highlighting...</div>
        </div>
      {:else}
        <div class="border border-gray-300 rounded-md overflow-hidden">
          <div class="syntax-highlight overflow-auto max-h-96">
            {@html highlightedHtml}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  :global(.syntax-highlight pre) {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
  }
  
  :global(.syntax-highlight code) {
    font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
  }
</style>