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
  let textareaRef = $state(null);
  let highlightRef = $state(null);
  let themeBackgrounds = $state({});
  let themeFilter = $state('all'); // 'all', 'light', 'dark'

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 
    'rust', 'go', 'php', 'ruby', 'swift', 'kotlin', 'dart',
    'html', 'css', 'json', 'yaml', 'xml', 'markdown', 'bash'
  ];

  // Using correct Shiki v3 theme names with background colors
  const themes = [
    'github-dark', 'github-light', 'dracula', 'nord', 'monokai',
    'one-dark-pro', 'material-theme-palenight', 'solarized-dark',
    'solarized-light', 'vs-dark', 'tokyo-night', 'vitesse-dark',
    'vitesse-light', 'material-theme', 'material-theme-darker',
    'houston', 'min-dark', 'min-light'
  ];

  // Categorize themes
  const lightThemes = [
    'github-light', 'solarized-light', 'vitesse-light', 'min-light'
  ];
  
  const darkThemes = [
    'github-dark', 'dracula', 'nord', 'monokai', 'one-dark-pro', 
    'material-theme-palenight', 'solarized-dark', 'vs-dark', 
    'tokyo-night', 'vitesse-dark', 'material-theme', 
    'material-theme-darker', 'houston', 'min-dark'
  ];

  // Map theme names to their background colors
  const themeBackgroundColors = {
    'github-dark': '#0d1117',
    'github-light': '#ffffff',
    'dracula': '#282a36',
    'nord': '#2e3440',
    'monokai': '#272822',
    'one-dark-pro': '#282c34',
    'material-theme-palenight': '#292d3e',
    'solarized-dark': '#002b36',
    'solarized-light': '#fdf6e3',
    'vs-dark': '#1e1e1e',
    'tokyo-night': '#1a1b26',
    'vitesse-dark': '#121212',
    'vitesse-light': '#ffffff',
    'material-theme': '#263238',
    'material-theme-darker': '#212121',
    'houston': '#0c0c0c',
    'min-dark': '#1f2937',
    'min-light': '#ffffff'
  };

  const previewCode = `const msg = "Hello";
console.log(msg);`;

  const filteredThemes = $derived.by(() => {
    switch (themeFilter) {
      case 'light':
        return lightThemes;
      case 'dark':
        return darkThemes;
      default:
        return themes;
    }
  });

  // Auto-switch to a valid theme when filter changes
  $effect(() => {
    if (!filteredThemes.includes(selectedTheme)) {
      selectedTheme = filteredThemes[0];
    }
  });

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

  function syncScroll() {
    if (textareaRef && highlightRef) {
      highlightRef.scrollTop = textareaRef.scrollTop;
      highlightRef.scrollLeft = textareaRef.scrollLeft;
    }
  }

  function detectLanguage(code) {
    const trimmed = code.trim();
    if (!trimmed) return 'javascript';

    // JavaScript/TypeScript patterns
    if (/(?:function|const|let|var|=>|import|export|require\()/i.test(trimmed)) {
      if (/(?:interface|type\s+\w+\s*=|as\s+\w+|:\s*\w+\[\])/i.test(trimmed)) {
        return 'typescript';
      }
      return 'javascript';
    }

    // Python patterns
    if (/(?:def\s+\w+|import\s+\w+|from\s+\w+\s+import|if\s+__name__\s*==|print\()/i.test(trimmed)) {
      return 'python';
    }

    // HTML patterns
    if (/^<[!?]?[a-z]/i.test(trimmed) || /<\/?\w+[^>]*>/i.test(trimmed)) {
      return 'html';
    }

    // CSS patterns
    if (/[.#]?\w+\s*\{[^}]*\}/i.test(trimmed) || /@media|@import|@keyframes/i.test(trimmed)) {
      return 'css';
    }

    // JSON patterns
    if (/^\s*[\[\{]/.test(trimmed) && /[\]\}]\s*$/.test(trimmed)) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {}
    }

    // Java patterns
    if (/(?:public\s+class|private\s+\w+|System\.out\.println)/i.test(trimmed)) {
      return 'java';
    }

    // C/C++ patterns
    if (/(?:#include|int\s+main|printf\(|std::)/i.test(trimmed)) {
      return trimmed.includes('std::') || trimmed.includes('iostream') ? 'cpp' : 'c';
    }

    // Rust patterns
    if (/(?:fn\s+\w+|let\s+mut|println!|use\s+std::)/i.test(trimmed)) {
      return 'rust';
    }

    // Go patterns
    if (/(?:package\s+\w+|func\s+\w+|fmt\.Print)/i.test(trimmed)) {
      return 'go';
    }

    // PHP patterns
    if (/^<\?php|echo\s+/i.test(trimmed)) {
      return 'php';
    }

    // Ruby patterns
    if (/(?:def\s+\w+|puts\s+|require\s+['"])/i.test(trimmed)) {
      return 'ruby';
    }

    // Shell/Bash patterns
    if (/^#!/.test(trimmed) || /(?:echo|ls|cd|mkdir|chmod)\s+/i.test(trimmed)) {
      return 'bash';
    }

    // YAML patterns
    if (/^\w+:\s*$|^\s*-\s+\w+:/m.test(trimmed)) {
      return 'yaml';
    }

    // XML patterns
    if (/^<\?xml|<!DOCTYPE/i.test(trimmed)) {
      return 'xml';
    }

    // Markdown patterns
    if (/^#{1,6}\s+|^\*{1,2}\w+\*{1,2}|^\[.+\]\(.+\)/m.test(trimmed)) {
      return 'markdown';
    }

    return 'javascript'; // default fallback
  }

  function handlePaste(event) {
    const pastedText = event.clipboardData?.getData('text');
    if (pastedText && pastedText.trim()) {
      const detectedLang = detectLanguage(pastedText);
      if (languages.includes(detectedLang)) {
        selectedLanguage = detectedLang;
      }
    }
  }

  function handleKeydown(event) {
    // Only handle keyboard navigation when textarea is not focused
    if (document.activeElement === textareaRef) return;
    
    if (event.key === 'j' || event.key === 'k') {
      event.preventDefault();
      
      const currentIndex = filteredThemes.indexOf(selectedTheme);
      let newIndex;
      
      if (event.key === 'j') {
        // Next theme (j = down)
        newIndex = currentIndex < filteredThemes.length - 1 ? currentIndex + 1 : 0;
      } else {
        // Previous theme (k = up)  
        newIndex = currentIndex > 0 ? currentIndex - 1 : filteredThemes.length - 1;
      }
      
      selectedTheme = filteredThemes[newIndex];
    }
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
    
    // Add global keyboard listener
    document.addEventListener('keydown', handleKeydown);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div class="flex h-screen overflow-hidden">
  <!-- Sidebar for theme selection -->
  <div class="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-semibold text-gray-900 mb-3">Themes</h2>
      
      <!-- Theme filter buttons -->
      <div class="flex rounded-lg bg-gray-200 p-1">
        <button
          class="flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors {themeFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
          onclick={() => themeFilter = 'all'}
        >
          All ({themes.length})
        </button>
        <button
          class="flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors {themeFilter === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
          onclick={() => themeFilter = 'light'}
        >
          Light ({lightThemes.length})
        </button>
        <button
          class="flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors {themeFilter === 'dark' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
          onclick={() => themeFilter = 'dark'}
        >
          Dark ({darkThemes.length})
        </button>
      </div>
      
      <p class="text-xs text-gray-500 mt-2">
        Use J/K keys to navigate themes
      </p>
    </div>

    <!-- Scrollable theme list -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="space-y-3">
        {#each filteredThemes as theme}
          <button
            class="w-full p-3 border rounded-lg hover:shadow-sm transition-all duration-200 text-left bg-white {selectedTheme === theme ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300 hover:border-gray-400'}"
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

  <!-- Main content area -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200 bg-white">
      <h1 class="text-3xl font-bold text-gray-900">Shiki Live Preview</h1>
      <p class="text-gray-600 mt-2">
        Type or paste code below to see it highlighted in real-time. Language is auto-detected on paste.
      </p>
    </div>

    <!-- Code editor -->
    <div class="flex-1 p-6 overflow-hidden">
      <div class="h-full flex flex-col">
        <!-- Controls above editor -->
        <div class="flex items-center gap-6 mb-4">
          <div>
            <label for="language" class="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select 
              id="language"
              bind:value={selectedLanguage}
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {#each languages as lang}
                <option value={lang}>{lang}</option>
              {/each}
            </select>
          </div>
          
          <div>
            <span class="block text-sm font-medium text-gray-700 mb-1">Current Theme</span>
            <span class="px-3 py-2 bg-gray-100 rounded-md text-sm capitalize text-gray-700">
              {selectedTheme.replace(/-/g, ' ')}
            </span>
          </div>
        </div>

        <label for="code-input" class="block text-sm font-medium text-gray-700 mb-2">
          Live Syntax Highlighted Editor
        </label>
        <div 
          class="flex-1 relative border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500"
          style="background-color: {themeBackgroundColors[selectedTheme] || '#ffffff'};"
        >
          <!-- Syntax highlighted background -->
          <div 
            bind:this={highlightRef}
            class="absolute inset-0 overflow-auto pointer-events-none syntax-highlight-overlay"
          >
            {#if highlightedHtml}
              {@html highlightedHtml}
            {/if}
          </div>
          
          <!-- Transparent textarea overlay -->
          <textarea
            id="code-input"
            bind:this={textareaRef}
            bind:value={code_sample}
            placeholder="Enter your code here..."
            class="absolute inset-0 w-full h-full px-4 py-3 bg-transparent text-transparent resize-none outline-none font-mono text-sm leading-relaxed"
            style="color: transparent; background: transparent; caret-color: {themeBackgroundColors[selectedTheme] === '#ffffff' || themeBackgroundColors[selectedTheme] === '#fdf6e3' ? 'black' : 'white'};"
            onscroll={syncScroll}
            onpaste={handlePaste}
            spellcheck="false"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Overlay syntax highlighting styles */
  :global(.syntax-highlight-overlay pre) {
    margin: 0;
    padding: 1rem;
    overflow: visible;
    background: transparent !important;
    border: none;
    border-radius: 0;
    font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
    font-size: 0.875rem;
    line-height: 1.625;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  
  :global(.syntax-highlight-overlay code) {
    font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
    font-size: 0.875rem;
    line-height: 1.625;
    background: transparent !important;
  }

  /* Sidebar theme preview styles */
  :global(.theme-preview pre) {
    margin: 0;
    padding: 0.5rem;
    overflow: hidden;
    border-radius: 0.25rem;
    max-height: 3rem;
    font-size: 0.7rem;
  }
  
  :global(.theme-preview code) {
    font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
    font-size: 0.7rem;
    line-height: 1.2;
  }

  /* Sidebar styling */
  .theme-preview {
    pointer-events: none;
  }

  /* Ensure proper text alignment and cursor */
  textarea {
    line-height: 1.625;
    font-family: 'Fira Code', 'JetBrains Mono', 'Monaco', 'Consolas', monospace;
  }

  /* Selection styling for transparency */
  textarea::selection {
    background: rgba(59, 130, 246, 0.3);
  }

  /* Placeholder styling for dark themes */
  textarea::placeholder {
    color: rgba(156, 163, 175, 0.7);
  }

  /* Ensure placeholder is visible on dark backgrounds */
  textarea[style*="caret-color: white"]::placeholder {
    color: rgba(156, 163, 175, 0.8);
  }

  /* Custom scrollbar for sidebar */
  .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }

  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.7);
  }
</style>