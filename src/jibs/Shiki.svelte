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

  // Complete Shiki v3 theme list with names and IDs
  const allThemes = [
    { name: 'Andromeeda', id: 'andromeeda' },
    { name: 'Aurora X', id: 'aurora-x' },
    { name: 'Ayu Dark', id: 'ayu-dark' },
    { name: 'Catppuccin Frappé', id: 'catppuccin-frappe' },
    { name: 'Catppuccin Latte', id: 'catppuccin-latte' },
    { name: 'Catppuccin Macchiato', id: 'catppuccin-macchiato' },
    { name: 'Catppuccin Mocha', id: 'catppuccin-mocha' },
    { name: 'Dark Plus', id: 'dark-plus' },
    { name: 'Dracula Theme', id: 'dracula' },
    { name: 'Dracula Theme Soft', id: 'dracula-soft' },
    { name: 'Everforest Dark', id: 'everforest-dark' },
    { name: 'Everforest Light', id: 'everforest-light' },
    { name: 'GitHub Dark', id: 'github-dark' },
    { name: 'GitHub Dark Default', id: 'github-dark-default' },
    { name: 'GitHub Dark Dimmed', id: 'github-dark-dimmed' },
    { name: 'GitHub Dark High Contrast', id: 'github-dark-high-contrast' },
    { name: 'GitHub Light', id: 'github-light' },
    { name: 'GitHub Light Default', id: 'github-light-default' },
    { name: 'GitHub Light High Contrast', id: 'github-light-high-contrast' },
    { name: 'Gruvbox Dark Hard', id: 'gruvbox-dark-hard' },
    { name: 'Gruvbox Dark Medium', id: 'gruvbox-dark-medium' },
    { name: 'Gruvbox Dark Soft', id: 'gruvbox-dark-soft' },
    { name: 'Gruvbox Light Hard', id: 'gruvbox-light-hard' },
    { name: 'Gruvbox Light Medium', id: 'gruvbox-light-medium' },
    { name: 'Gruvbox Light Soft', id: 'gruvbox-light-soft' },
    { name: 'Houston', id: 'houston' },
    { name: 'Kanagawa Dragon', id: 'kanagawa-dragon' },
    { name: 'Kanagawa Lotus', id: 'kanagawa-lotus' },
    { name: 'Kanagawa Wave', id: 'kanagawa-wave' },
    { name: 'LaserWave', id: 'laserwave' },
    { name: 'Light Plus', id: 'light-plus' },
    { name: 'Material Theme', id: 'material-theme' },
    { name: 'Material Theme Darker', id: 'material-theme-darker' },
    { name: 'Material Theme Lighter', id: 'material-theme-lighter' },
    { name: 'Material Theme Ocean', id: 'material-theme-ocean' },
    { name: 'Material Theme Palenight', id: 'material-theme-palenight' },
    { name: 'Min Dark', id: 'min-dark' },
    { name: 'Min Light', id: 'min-light' },
    { name: 'Monokai', id: 'monokai' },
    { name: 'Night Owl', id: 'night-owl' },
    { name: 'Nord', id: 'nord' },
    { name: 'One Dark Pro', id: 'one-dark-pro' },
    { name: 'One Light', id: 'one-light' },
    { name: 'Plastic', id: 'plastic' },
    { name: 'Poimandres', id: 'poimandres' },
    { name: 'Red', id: 'red' },
    { name: 'Rosé Pine', id: 'rose-pine' },
    { name: 'Rosé Pine Dawn', id: 'rose-pine-dawn' },
    { name: 'Rosé Pine Moon', id: 'rose-pine-moon' },
    { name: 'Slack Dark', id: 'slack-dark' },
    { name: 'Slack Ochin', id: 'slack-ochin' },
    { name: 'Snazzy Light', id: 'snazzy-light' },
    { name: 'Solarized Dark', id: 'solarized-dark' },
    { name: 'Solarized Light', id: 'solarized-light' },
    { name: 'Synthwave \'84', id: 'synthwave-84' },
    { name: 'Tokyo Night', id: 'tokyo-night' },
    { name: 'Vesper', id: 'vesper' },
    { name: 'Vitesse Black', id: 'vitesse-black' },
    { name: 'Vitesse Dark', id: 'vitesse-dark' },
    { name: 'Vitesse Light', id: 'vitesse-light' }
  ];

  const themes = allThemes.map(t => t.id);

  // Categorize themes (light vs dark based on naming patterns)
  const lightThemeIds = [
    'catppuccin-latte', 'everforest-light', 'github-light', 'github-light-default', 
    'github-light-high-contrast', 'gruvbox-light-hard', 'gruvbox-light-medium', 
    'gruvbox-light-soft', 'kanagawa-lotus', 'light-plus', 'material-theme-lighter', 
    'min-light', 'one-light', 'rose-pine-dawn', 'snazzy-light', 'solarized-light', 
    'vitesse-light'
  ];

  const darkThemeIds = allThemes.map(t => t.id).filter(id => !lightThemeIds.includes(id));

  // Function to get theme background color
  function getThemeBackground(themeId) {
    // Known specific colors
    const knownColors = {
      'github-dark': '#0d1117',
      'github-light': '#ffffff',
      'dracula': '#282a36',
      'nord': '#2e3440',
      'monokai': '#272822',
      'one-dark-pro': '#282c34',
      'material-theme-palenight': '#292d3e',
      'solarized-dark': '#002b36',
      'solarized-light': '#fdf6e3',
      'tokyo-night': '#1a1b26',
      'vitesse-dark': '#121212',
      'vitesse-light': '#ffffff',
      'material-theme': '#263238',
      'material-theme-darker': '#212121',
      'houston': '#0c0c0c',
      'min-dark': '#1f2937',
      'min-light': '#ffffff',
      'catppuccin-mocha': '#1e1e2e',
      'catppuccin-macchiato': '#24273a',
      'catppuccin-frappe': '#303446',
      'catppuccin-latte': '#eff1f5',
      'rose-pine': '#191724',
      'rose-pine-moon': '#232136',
      'rose-pine-dawn': '#faf4ed',
      'gruvbox-dark-hard': '#1d2021',
      'gruvbox-light-hard': '#f9f5d7',
      'synthwave-84': '#2a2139'
    };

    if (knownColors[themeId]) {
      return knownColors[themeId];
    }

    // Fallback based on theme name patterns
    if (lightThemeIds.includes(themeId)) {
      return '#ffffff'; // Default light background
    } else {
      return '#1a1a1a'; // Default dark background
    }
  }

  const previewCode = `const msg = "Hello";
console.log(msg);`;

  const filteredThemes = $derived.by(() => {
    switch (themeFilter) {
      case 'light':
        return lightThemeIds;
      case 'dark':
        return darkThemeIds;
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

  function autoResizeTextarea() {
    if (textareaRef) {
      // Reset height to auto to get the scroll height
      textareaRef.style.height = 'auto';
      // Set height to scroll height with some minimum
      const newHeight = Math.max(200, textareaRef.scrollHeight);
      textareaRef.style.height = newHeight + 'px';
      
      // Also update the highlight layer to match
      if (highlightRef) {
        highlightRef.style.height = newHeight + 'px';
      }
      
      // Update the container height to match
      const container = textareaRef.parentElement;
      if (container) {
        container.style.height = newHeight + 'px';
      }
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
    
    // Theme navigation (j/k)
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
    
    // Theme filter shortcuts (l/d/a)
    if (event.key === 'l' || event.key === 'd' || event.key === 'a') {
      event.preventDefault();
      
      if (event.key === 'l') {
        themeFilter = 'light';
      } else if (event.key === 'd') {
        themeFilter = 'dark';
      } else if (event.key === 'a') {
        themeFilter = 'all';
      }
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
    autoResizeTextarea();
  });

  onMount(async () => {
    await generateThemePreviews();
    updateHighlight();
    autoResizeTextarea();
    
    // Add global keyboard listener
    document.addEventListener('keydown', handleKeydown);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div class="flex min-h-screen">
  <!-- Sidebar for theme selection -->
  <div class="w-80 bg-gray-50 border-r border-gray-200 flex flex-col sticky top-0 h-screen">
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
          Light ({lightThemeIds.length})
        </button>
        <button
          class="flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors {themeFilter === 'dark' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}"
          onclick={() => themeFilter = 'dark'}
        >
          Dark ({darkThemeIds.length})
        </button>
      </div>
      
      <p class="text-xs text-gray-500 mt-2">
        Keys: J/K (navigate) • L/D/A (light/dark/all)
      </p>
    </div>

    <!-- Scrollable theme list -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="space-y-3">
        {#each filteredThemes as themeId}
          {@const themeData = allThemes.find(t => t.id === themeId)}
          <button
            class="w-full p-3 border rounded-lg hover:shadow-sm transition-all duration-200 text-left bg-white {selectedTheme === themeId ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-300 hover:border-gray-400'}"
            onclick={() => selectedTheme = themeId}
          >
            <div class="text-sm font-medium text-gray-700 mb-1">
              {themeData?.name || themeId}
            </div>
            <div class="text-xs text-gray-500 mb-2 font-mono">
              {themeId}
            </div>
            <div class="theme-preview text-xs overflow-hidden">
              {#if themePreviews[themeId]}
                {@html themePreviews[themeId]}
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
  <div class="flex-1 flex flex-col">
    <!-- Compact header with controls -->
    <div class="p-6 border-b border-gray-200 bg-white">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Shiki Live Preview</h1>
          <p class="text-gray-600 text-sm mt-1">
            Live syntax highlighting with auto language detection
          </p>
        </div>
        
        <!-- Controls on the right -->
        <div class="flex items-center gap-6">
          <div>
            <label for="language" class="block text-xs font-medium text-gray-700 mb-1">
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
            <span class="block text-xs font-medium text-gray-700 mb-1">Current Theme</span>
            <div class="px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700 min-w-0">
              <div class="font-medium truncate">
                {allThemes.find(t => t.id === selectedTheme)?.name || selectedTheme}
              </div>
              <div class="text-xs text-gray-500 font-mono truncate">
                {selectedTheme}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Code editor -->
    <div class="flex-1 p-6">
      <div class="flex flex-col">
        <div 
          class="relative border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500"
          style="background-color: {getThemeBackground(selectedTheme)}; min-height: 200px;"
        >
          <!-- Syntax highlighted background -->
          <div 
            bind:this={highlightRef}
            class="absolute top-0 left-0 w-full pointer-events-none syntax-highlight-overlay"
            style="min-height: 200px;"
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
            class="relative w-full px-4 py-3 bg-transparent text-transparent resize-none outline-none font-mono text-sm leading-relaxed border-none"
            style="color: transparent; background: transparent; caret-color: {lightThemeIds.includes(selectedTheme) ? 'black' : 'white'}; min-height: 200px;"
            onscroll={syncScroll}
            onpaste={handlePaste}
            oninput={autoResizeTextarea}
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