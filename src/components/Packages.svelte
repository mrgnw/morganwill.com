<script>
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { toast, Toaster } from 'svelte-sonner';

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
	];

	// Combine all packages into a single list
	const packages = [
		...uv_tools.map((name) => ({ name, installer: "uv" })),
		...brews.map((name) => ({ name, installer: "homebrew" })),
		...appstore_packages.map((pkg) => ({
			name: pkg.name,
			id: pkg.id,
			installer: "mas",
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
		homebrew: Array.from(selectedPackages).filter(
			(pkg) => pkg.installer === "homebrew"
		),
		uv: Array.from(selectedPackages).filter((pkg) => pkg.installer === "uv"),
		mas: Array.from(selectedPackages).filter((pkg) => pkg.installer === "mas"),
	});

	// Generate install commands for each installer
	const installerCommands = $derived({
		homebrew:
			packagesByInstaller.homebrew.length > 0 ||
			packagesByInstaller.mas.length > 0
				? `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
				: null,
		uv:
			packagesByInstaller.uv.length > 0
				? [
						"curl -LsSf https://astral.sh/uv/install.sh | sh",
						"uv python install",
					]
				: null,
		mas: packagesByInstaller.mas.length > 0 ? "brew install mas" : null,
	});

	// Generate package install commands
	const packageCommands = $derived({
		homebrew:
			packagesByInstaller.homebrew.length > 0
				? `(brew install ${packagesByInstaller.homebrew.map((pkg) => pkg.name).join(" ")} &)`
				: null,
		uv:
			packagesByInstaller.uv.length > 0
				? `for tool (${packagesByInstaller.uv.map(pkg => `"${pkg.name}"`).join(' ')}) (uv tool install "$tool" &)`
				: null,
		mas:
			packagesByInstaller.mas.length > 0
				? `(mas install ${packagesByInstaller.mas.map((pkg) => pkg.id).join(" ")} &)`
				: null,
	});

	// Combine all commands in the correct order, adding wait at the end
	const cmds = $derived(
		[
			installerCommands.homebrew,
			installerCommands.uv,
			installerCommands.mas,
			packageCommands.homebrew,
			packageCommands.uv,
			packageCommands.mas,
			"wait" // Add wait command to ensure all background processes complete
		]
			.filter(Boolean)
			.flat()
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
			installerCommands.homebrew,
			installerCommands.uv,
			installerCommands.mas,
		]
			.filter(Boolean)
			.flat(),
		packages: [
			packageCommands.homebrew,
			packageCommands.uv,
			packageCommands.mas,
		].filter(Boolean),
	});

	// Add new copy functions for each section
	function copyInstallers() {
		navigator.clipboard.writeText(groupedCommands.installers.join("\n"));
		toast.success("Copied installer commands to clipboard");
	}

	function copyPackages() {
		navigator.clipboard.writeText(groupedCommands.packages.join("\n"));
		toast.success("Copied package commands to clipboard");
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
				<Button variant="outline" size="sm" on:click={toggleSelectAll}>
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
						on:click={() => togglePackage(pkg)}
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
					<Button class="copy-all-button" on:click={copyToClipboard}>
						Copy All Commands
					</Button>

					{#if groupedCommands.installers.length > 0}
						<div class="command-section">
							<div class="section-header">
								<Button variant="outline" size="sm" on:click={copyInstallers}>
									Copy
								</Button>
							</div>
							<pre><code>{groupedCommands.installers.join("\n")}</code></pre>
						</div>
					{/if}

					{#if groupedCommands.packages.length > 0}
						<div class="command-section">
							<div class="section-header">
								<Button variant="outline" size="sm" on:click={copyPackages}>
									Copy
								</Button>
							</div>
							<pre><code>{groupedCommands.packages.join("\n")}</code></pre>
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
	}

	.package-name:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.package-name.selected {
		color: #0d6efd;
		background-color: rgba(13, 110, 253, 0.1);
	}

	.terminal-output {
		background-color: #161b22;
		color: #c9d1d9;
		padding: 1rem;
		border-radius: 0.5rem;
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

	.terminal-output h4 {
		color: #8b949e;
		margin: 0.5rem 0;
		font-size: 0.9rem;
		font-weight: normal;
	}

	.terminal-output pre {
		margin: 0.5rem 0 1rem 0;
	}

	.command-section {
		margin-bottom: 1rem;
		border: 1px solid #30363d;
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.section-header h4 {
		margin: 0;
	}

	.copy-all-button {
		display: block;
		width: 100%;
		margin-bottom: 1rem;
		background-color: #0d6efd;
		color: #fff;
		border: none;
		padding: 0.5rem;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.copy-section-button {
		background-color: #21262d;
		color: #c9d1d9;
		border: 1px solid #30363d;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.8rem;
	}

	.copy-section-button:hover {
		background-color: #30363d;
	}

	/* Remove the old copy-button style if it exists */
	.copy-button {
		display: none;
	}
</style>
