<script>
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { toast, Toaster } from 'svelte-sonner';

	let data = $props();

	const direct_from_curl = [
		{
			name: "bun",
			homepage: "bun.sh",
			install: "curl -fsSL https://bun.sh/install | bash",
		},
		{
			name: "uv",
			homepage: "docs.astral.sh/uv",
			install: "curl -LsSf https://astral.sh/uv/install.sh | sh",
		},
		{
			name: "brew",
			homepage: "brew.sh",
			install: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`,
		},
	];
	// Define the packages and their installers
	const uv_tools = [
		"fpw",
		"harlequin",
		"llm",
		"marimo",
		"mopup",
		"posting",
		"ruff",
		"yt-dlp",
	];

	const brews = [
		// Base utilities
		"aria2",
		"cursor",
		"duckdb",
		"jq",
		"zoxide",
		"choose-rust",
		"ripgrep",
		"mprocs",
		"mask",
		"zellij",
		"fd",
		

		// System utilities
		"bartender",
		"istat-menus",
		"macmediakeyforwarder",
		"lingon-x",
		"lunar",
		"onyx",
		"pastebot",

		// Development tools
		"beekeeper-studio",
		"cloudflared",
		"docker",
		"docker-completion",
		"docker-compose",
		"github",
		"orbstack",
		"postico",
		"postman",
		"sublime-text",
		"git-delta",

		// File management
		"cyberduck",
		"mountain-duck",
		"diskonaut",
		"dust",
		"duf",
		"the-unarchiver",

		// Media tools
		"iina",
		"homebrew/cask/handbrake",
		"losslesscut",
		"plex-media-server",
		"qlvideo",
		"subler",

		// Internet & Communication
		"firefox",
		"notion",
		"qbittorrent",
		"homebrew/cask/syncthing",
		"homebrew/cask/transmission",
		"telegram",

		// Text & Documentation
		"typora",
		"espanso",
	];

	const appstore_packages = [
		{ name: "PairVPN", id: "1347012179" },
		{ name: "Tailscale", id: "1475387142" },
		{ name: "HotKey", id: "975890633" },
		{ name: "Dark Reader", id: "1438243180" },
		{ name: "Daisy Disk", id: "411643860" },
		{ name: "Overlap", id: "1516950324" },
		{ name: "Velja", id: "1607635845" },
		{ name: "System Color Picker", id: "1545870783" },
		{ name: "VPN Unlimited", id: "694633015" },
		{ name: "Consent-O-Matic", id: "1606897889" },
		{ name: "LanScan", id: "472226235" },
		{ name: "Slack", id: "803453959" },
	];

	// Add this new array for Bun packages
	const bun_packages = [
		"@343dev/optimizt",
		"wrangler",
	];

	// Combine all packages into a single list
	const packages = [
		...direct_from_curl.map((pkg) => ({
			name: pkg.name,
			homepage: pkg.homepage,
			install: pkg.install,
			installer: pkg.name,
		})),
		...bun_packages.map((name) => ({
			name,
			installer: "bun",
			install: "curl -fsSL https://bun.sh/install | bash"
		})),
		...uv_tools.map((name) => ({
			name,
			installer: "uv",
			install: "curl -LsSf https://astral.sh/uv/install.sh | sh"
		})),
		...brews.map((name) => ({
			name,
			installer: "homebrew",
			install: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
		})),
		...appstore_packages.map((pkg) => ({
			name: pkg.name,
			id: pkg.id,
			installer: "mas",
			install: "brew install mas"
		})),
	].sort((a, b) => a.name.localeCompare(b.name));

	// Reactive variables for selected packages and copied state
	let selectedPackages = $state(new Set(packages));

	// Toggle package selection
	function togglePackage(pkg) {
		selectedPackages = new Set(selectedPackages); // Create new Set for reactivity
		const found = Array.from(selectedPackages).find(
			(p) => p.name === pkg.name && p.installer === pkg.installer
		);

		if (found) {
			selectedPackages.delete(found);
		} else {
			selectedPackages.add(pkg);
		}
	}

	// Group packages by installer
	const packagesByInstaller = $derived({
		homebrew: Array.from(selectedPackages).filter(pkg => pkg.installer === "homebrew"),
		uv: Array.from(selectedPackages).filter(pkg => pkg.installer === "uv"),
		mas: Array.from(selectedPackages).filter(pkg => pkg.installer === "mas"),
		bun: Array.from(selectedPackages).filter(pkg => pkg.installer === "bun"),
		direct: Array.from(selectedPackages).filter(pkg => direct_from_curl.some(d => d.name === pkg.installer))
	});

	// Generate package install commands
	const packageCommands = $derived({
		prerequisites: Array.from(selectedPackages)
			.map(pkg => pkg.install)
			.filter((cmd, index, self) => self.indexOf(cmd) === index), // Remove duplicates
		homebrew: packagesByInstaller.homebrew.length > 0
			? `(brew install ${packagesByInstaller.homebrew.map(pkg => pkg.name).join(" ")} &)`
			: null,
		uv: packagesByInstaller.uv.length > 0
			? `for tool (${packagesByInstaller.uv.map(pkg => `"${pkg.name}"`).join(' ')}) (uv tool install "$tool" &)`
			: null,
		mas: packagesByInstaller.mas.length > 0
			? `(mas install ${packagesByInstaller.mas.map(pkg => pkg.id).join(" ")} &)`
			: null,
		bun: packagesByInstaller.bun.length > 0
			? `(bun install -g ${packagesByInstaller.bun.map(pkg => pkg.name).join(" ")} &)`
			: null,
		direct: packagesByInstaller.direct.map(pkg => pkg.install)
	});

	// Combine all commands in the correct order
	const cmds = $derived(
		[
			...packageCommands.direct,
			...packageCommands.prerequisites,
			packageCommands.homebrew,
			packageCommands.uv,
			packageCommands.mas,
			packageCommands.bun,
			"wait"
		]
			.filter(Boolean)
			.join("\n")
	);

	// Copy the generated commands to clipboard
	function copyToClipboard() {
		navigator.clipboard.writeText(cmds);
		toast.success("Copied all commands to clipboard");
	}

	// Add new derived store to group commands by type
	const groupedCommands = $derived({
		installers: [
			...new Set([
				...packageCommands.direct,
				...packageCommands.prerequisites
			])
		],
		packages: [
			packageCommands.homebrew,
			packageCommands.uv,
			packageCommands.mas,
			packageCommands.bun,
		].filter(Boolean),
	});

	// Add new copy functions for each section
	function copyInstallers() {
		navigator.clipboard.writeText(groupedCommands.installers.join("\n"));
		toast.success("Copied prerequisite commands");
	}

	function copyPackages() {
		navigator.clipboard.writeText(groupedCommands.packages.join("\n"));
		toast.success("Copied package installation");
	}

	// Add select/deselect all function
	function toggleSelectAll() {
		if (selectedPackages.size === packages.length) {
			selectedPackages = new Set();
		} else {
			selectedPackages = new Set(packages);
		}
	}

	// Add a display name mapping function
	function display(pkg) {
		// Remove 'homebrew/cask/' prefix for display purposes
		return pkg.name.replace('homebrew/cask/', '');
	}
</script>

<div class="container mx-auto p-4">
	<Toaster />
	<Card.Root>
		<Card.Header>
			<Card.Title>Package Selection</Card.Title>
			<Card.Description
				>Select packages to install on your system</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<div class="flex justify-between items-center mb-4">
				<Button variant="outline" size="sm" onclick={toggleSelectAll}>
					{selectedPackages.size === packages.length
						? "Deselect All"
						: "Select All"}
				</Button>
				<span class="text-sm text-muted-foreground">
					{selectedPackages.size} of {packages.length} selected
				</span>
			</div>

			<div class="package-list">
				{#each [...packages].sort((a, b) => display(a).localeCompare(display(b))) as pkg}
					<button
						class="package-name {selectedPackages.has(pkg) ? 'selected' : ''}"
						onpointerdown={(e) => {
							if (e.button !== 0) return; // only handle left click/touch
							togglePackage(pkg);
						}}
						onpointerenter={(e) => {
							if (e.buttons > 0) { // check if button is pressed during hover
								togglePackage(pkg);
							}
						}}
					>
						{display(pkg)}
					</button>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	{#if selectedPackages.size > 0}
		<Card.Root class="mt-4 mb-4">
			<Card.Header>
				<Card.Title>Installation Commands</Card.Title>
				<Card.Description
					>Copy and run these commands to install selected packages</Card.Description
				>
			</Card.Header>
			<Card.Content>
				<div class="terminal-output">
					<div class="copy-all-section">
						<Button class="copy-all-button" onclick={copyToClipboard}>
							Copy All Commands
						</Button>
					</div>

					{#if groupedCommands.installers.length > 0}
						<div class="command-section">
							<div class="code-container">
								<Button
									variant="outline"
									size="sm"
									class="section-copy-button"
									onclick={copyInstallers}
								>
									Copy
								</Button>
								<pre><code>{groupedCommands.installers.join("\n")}</code></pre>
							</div>
						</div>
					{/if}

					{#if groupedCommands.packages.length > 0}
						<div class="command-section">
							<div class="code-container">
								<Button
									variant="outline"
									size="sm"
									class="section-copy-button"
									onclick={copyPackages}
								>
									Copy
								</Button>
								<pre><code>{groupedCommands.packages.join("\n")}</code></pre>
							</div>
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<style>
	.package-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 0.5rem;
		max-height: 60vh;
		overflow-y: auto;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}

	.package-name {
		color: #666;
		cursor: pointer;
		padding: 0.5rem;
		border: none;
		background: none;
		font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo,
			Consolas, "DejaVu Sans Mono", monospace;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: color 0.2s ease;
		width: 100%;
		border-radius: 0.25rem;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}

	.package-name:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.package-name.selected {
		color: #0d6efd;
		background-color: rgba(13, 110, 253, 0.1);
	}

	.terminal-output {
		background-color: transparent;
		padding: 0;
		border-radius: 0.5rem;
		font-family: monospace;
		position: relative;
	}

	.copy-all-section {
		position: relative;
		margin-bottom: 1rem;
	}

	.copy-all-button {
		width: 100%;
	}

	.command-section {
		margin-bottom: 1rem;
		position: relative;
	}

	.code-container {
		position: relative;
		background-color: #161b22;
		padding: 1rem;
		border-radius: 0.5rem;
	}

	.code-container pre {
		margin: 0;
		white-space: pre-wrap;
		word-wrap: break-word;
		overflow-wrap: break-word;
		color: #c9d1d9;
	}

	.section-copy-button {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 10;
		opacity: 0;
		transition: opacity 0.2s ease;
		pointer-events: none;
		margin: 0.5rem;
	}

	.code-container:hover .section-copy-button {
		opacity: 1;
		pointer-events: all;
	}

	/* Remove unused styles */
	.section-header,
	.copy-section-button,
	.copy-button {
		display: none;
	}
</style>
