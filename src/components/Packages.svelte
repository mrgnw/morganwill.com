<script>
  // Define the packages and their installers
  const uv_tools = [
    'fpw',
    'harlequin',
    'llm',
    'marimo',
		'mopup',
		'posting',
    'ruff',
    'yt-dlp'
  ];

  const brews = [
    'aria2',
    'cursor',
    'duckdb',
    'jq',
    'syncthing',
    'telegram'
  ];

  const appstore_packages = [
    { name: 'PairVPN', id: '1347012179' },
    { name: 'Tailscale', id: '1475387142' },
    { name: 'HotKey', id: '975890633' },
    { name: 'Dark Reader', id: '1438243180' },
    { name: 'Daisy Disk', id: '411643860' },
    { name: 'Overlap', id: '1516950324' },
    { name: 'Velja', id: '1607635845' },
    { name: 'System Color Picker', id: '1545870783' },
    { name: 'VPN Unlimited', id: '694633015' },
    { name: 'Consent-O-Matic', id: '1606897889' }
  ];

  // Combine all packages into a single list
  const packages = [
    ...uv_tools.map(name => ({ name, installer: 'uv' })),
    ...brews.map(name => ({ name, installer: 'homebrew' })),
    ...appstore_packages.map(pkg => ({ name: pkg.name, id: pkg.id, installer: 'mas' }))
  ].sort((a, b) => a.name.localeCompare(b.name));

  // Reactive variables for selected packages and copied state
  let selectedPackages = $state(new Set());
  let copied = false;

  // Toggle package selection
  function togglePackage(pkg) {
    selectedPackages = new Set(selectedPackages); // Create new Set for reactivity
    const found = Array.from(selectedPackages).find(
      p => p.name === pkg.name && p.installer === pkg.installer
    );
    
    if (found) {
      selectedPackages.delete(found);
    } else {
      selectedPackages.add(pkg);
    }
  }

	// Group packages by installer
	const packagesByInstaller = $derived({
		homebrew: Array.from(selectedPackages).filter(pkg => pkg.installer === 'homebrew'),
		uv: Array.from(selectedPackages).filter(pkg => pkg.installer === 'uv'),
		mas: Array.from(selectedPackages).filter(pkg => pkg.installer === 'mas')
	});

	// Generate install commands for each installer
	const installerCommands = $derived({
		homebrew: packagesByInstaller.homebrew.length > 0 ? 
			`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` : 
			null,
		uv: packagesByInstaller.uv.length > 0 ? [
			'curl -LsSf https://astral.sh/uv/install.sh | sh',
			'uv python install'
		] : null,
		mas: packagesByInstaller.mas.length > 0 ? 
			'brew install mas' : 
			null
	});

	// Generate package install commands
	const packageCommands = $derived({
		homebrew: packagesByInstaller.homebrew.length > 0 ?
			`brew install ${packagesByInstaller.homebrew.map(pkg => pkg.name).join(' ')}` :
			null,
		uv: packagesByInstaller.uv.length > 0 ?
			`uv pip install ${packagesByInstaller.uv.map(pkg => pkg.name).join(' ')}` :
			null,
		mas: packagesByInstaller.mas.length > 0 ?
			`mas install ${packagesByInstaller.mas.map(pkg => pkg.id).join(' ')}` :
			null
	});

	// Combine all commands in the correct order
	const cmds = $derived([
			installerCommands.homebrew,
			installerCommands.uv,
			installerCommands.mas,
			packageCommands.homebrew,
			packageCommands.uv,
			packageCommands.mas
	].filter(Boolean)
		.flat()
		.join('\n'));

  // Copy the generated commands to clipboard
  function copyToClipboard() {
    navigator.clipboard.writeText(cmds);
    showCopiedMessage();
  }

  // Show the "Copied!" message
  function showCopiedMessage() {
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

<style>
  .package-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: calc(100vh - 40vh - 2rem);
    padding: 1rem;
  }

  .package-name {
    color: #333; /* unselected color */
    cursor: pointer;
    padding: 0.25rem;
    border: none;
    background: none;
    font: inherit;
    text-align: left;
  }

  .package-name.selected {
    color: #0d6efd; /* startup-blue */
  }

  .terminal-output {
    background-color: #161b22;
    color: #c9d1d9;
    padding: 1rem;
    border-radius: 0.5rem;
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    max-height: 40vh;
    overflow-y: auto;
    font-family: monospace;
    white-space: pre-wrap;
  }

  .copy-button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background-color: #0d6efd;
    color: #fff;
    border: none;
    padding: 0.5rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .copied-message {
    position: absolute;
    top: 0.5rem;
    right: 5rem;
    background-color: #198754;
    color: #fff;
    padding: 0.5rem;
    border-radius: 0.25rem;
  }
</style>

{cmds}

<div class="package-list">
  {#each packages as pkg}
    <button
      class="package-name {selectedPackages.has(pkg) ? 'selected' : ''}"
      on:click={() => togglePackage(pkg)}
    >
      {pkg.name}
    </button>
  {/each}
</div>

{#if selectedPackages.size > 0}
  <div class="terminal-output">
    <pre><code>{cmds}</code></pre>
    <button class="copy-button" on:click={copyToClipboard}>Copy</button>
    {#if copied}
      <div class="copied-message">
        Copied!
      </div>
    {/if}
  </div>
{/if}