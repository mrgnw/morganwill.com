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
  let themePreviews = $state({});
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

  const previewCode = `const msg = "Hello";
console.log(msg);`;

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

  async function generateThemePreviews() {
    const previews = {};
    for (const theme of themes) {
      try {
        const html = await codeToHtml(previewCode, {
          lang: 'javascript',
          theme: theme
        });
        previews[theme] = html;
      } catch (error) {
        console.error(`Error generating preview for ${theme}:`, error);
        previews[theme] = `<pre><code>${previewCode}</code></pre>`;
      }
    }
    themePreviews = previews;
  }

  // Update highlight when code, language, or theme changes  
  $effect(() => {
    updateHighlight();
  });

  onMount(async () => {
    await generateThemePreviews();
    updateHighlight();
  });
</script>

<div class="p-6 max-w-full mx-auto space-y-8">
  <div class="max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-4">Shiki Live Preview</h1>
    <p class="text-gray-600 mb-6">
      Type or paste code in the textarea below to see it highlighted in real-time with Shiki.
    </p>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Input Section -->
      <div class="space-y-4">
        <div>
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

      <!-- Current Theme Preview -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold">Current Preview ({selectedTheme})</h2>
        
        {#if isLoading}
          <div class="flex items-center justify-center h-32 bg-gray-100 rounded-md">
            <div class="text-gray-500">Highlighting...</div>
          </div>
        {:else}
          <div class="syntax-highlight">
            {@html highlightedHtml}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Theme Selection Grid -->
  <div class="max-w-full">
    <h2 class="text-2xl font-semibold mb-4 max-w-6xl mx-auto">Choose a Theme</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
      {#each themes as theme}
        <button
          class="theme-card p-4 border rounded-lg hover:shadow-md transition-all duration-200 text-left {selectedTheme === theme ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300 hover:border-gray-400'}"
          onclick={() => selectedTheme = theme}
        >
          <div class="text-sm font-medium text-gray-700 mb-2 capitalize">
            {theme.replace(/-/g, ' ')}
          </div>
          <div class="theme-preview text-xs overflow-hidden">
            {#if themePreviews[theme]}
              {@html themePreviews[theme]}
            {:else}
              <div class="bg-gray-100 p-2 rounded text-gray-500">Loading...</div>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  :global(.syntax-highlight pre) {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
    border-radius: 0.5rem;
  }
  
  :global(.syntax-highlight code) {
    font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  :global(.theme-preview pre) {
    margin: 0;
    padding: 0.5rem;
    overflow: hidden;
    border-radius: 0.25rem;
    max-height: 4rem;
  }
  
  :global(.theme-preview code) {
    font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
    font-size: 0.75rem;
    line-height: 1.3;
  }

  .theme-card {
    min-height: 120px;
  }

  .theme-card:hover {
    transform: translateY(-1px);
  }

  .theme-preview {
    pointer-events: none;
  }
</style>