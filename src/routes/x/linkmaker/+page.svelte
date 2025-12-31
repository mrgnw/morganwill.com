<script>
	import { linkTemplates } from "$lib/links.js";
	import { generateQR } from "./generateQR.remote.js";
	import ColoredQr from "$components/ColoredQr.svelte";
	import Icon from "$lib/icons/Icon.svelte";
	import { iconData } from "$lib/icons/data.js";

	let links = $state([]);
	let selectedType = $state("");
	let inputValue = $state("");

	// All link types available
	const linkTypes = linkTemplates;

	/**
	 * Add a new link to the list
	 */
	async function addLink() {
		if (!selectedType || !inputValue) return;

		const template = linkTemplates.find((t) => t.title === selectedType);
		if (!template) return;

		// Build URL from template
		let url = "";
		if (template.urlTemplate) {
			url = template.urlTemplate.replace("{value}", inputValue);
			// WhatsApp special handling
			if (template.title === "whatsapp") {
				const cleanedValue = inputValue.replace(/[^0-9]/g, "");
				url = template.urlTemplate.replace("{value}", cleanedValue);
			}
		} else if (template.url) {
			url = template.url;
		}

		// Add link to list immediately without QR
		const newLink = {
			type: template.title,
			title: template.title,
			alias: template.alias,
			value: inputValue,
			url,
			qr: null, // Will be generated asynchronously
			colors: template.colors || ["#888"],
			blurb: template.blurb,
		};

		links.push(newLink);
		const linkIndex = links.length - 1;

		// Reset form
		inputValue = "";

		// Generate QR code asynchronously via remote function
		try {
			const qr = await generateQR({ url, title: template.title });
			// Force reactivity by reassigning the array
			links[linkIndex].qr = qr;
			links = links;
		} catch (err) {
			console.error("Failed to generate QR:", err);
			links[linkIndex].qr = "error";
			links = links;
		}
	}

	/**
	 * Remove a link from the list
	 */
	function removeLink(index) {
		links = links.filter((_, i) => i !== index);
	}

	/**
	 * Download QR code as SVG
	 */
	function downloadQR(link, index) {
		if (!link.qr) return;

		const blob = new Blob([link.qr], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${link.type}-qr.svg`;
		a.click();
		URL.revokeObjectURL(url);
	}

	/**
	 * Generate and download vCard v4.0
	 */
	function downloadVCard() {
		// Find contact info from links
		const phone = links.find((l) => l.type === "phone")?.value || "";
		const email = links.find((l) => l.type === "email")?.value || "";

		// vCard 4.0 supports social profiles with IMPP (Instant Messaging and Presence Protocol)
		const whatsapp = links.find((l) => l.type === "whatsapp");
		const telegram = links.find((l) => l.type === "telegram");
		const signal = links.find((l) => l.type === "signal");
		const line = links.find((l) => l.type === "line");

		// Web URLs (social profiles, websites)
		const webLinks = links.filter(
			(l) =>
				!["phone", "whatsapp", "telegram", "signal", "line"].includes(
					l.type,
				),
		);

		// Build vCard 4.0
		const vcardLines = ["BEGIN:VCARD", "VERSION:4.0", "FN:Contact"];

		if (phone) {
			vcardLines.push(`TEL;TYPE=CELL:${phone}`);
		}

		if (email) {
			vcardLines.push(`EMAIL:${email}`);
		}

		// Add instant messaging profiles using IMPP
		if (whatsapp) {
			// WhatsApp: use international format without +
			const cleanPhone = whatsapp.value.replace(/[^0-9]/g, "");
			vcardLines.push(
				`IMPP;X-SERVICE-TYPE=WhatsApp:whatsapp:${cleanPhone}`,
			);
			vcardLines.push(`X-SOCIALPROFILE;TYPE=WhatsApp:${whatsapp.url}`);
		}

		if (telegram) {
			vcardLines.push(
				`IMPP;X-SERVICE-TYPE=Telegram:tg://resolve?domain=${telegram.value}`,
			);
			vcardLines.push(`X-SOCIALPROFILE;TYPE=Telegram:${telegram.url}`);
		}

		if (signal) {
			vcardLines.push(`X-SOCIALPROFILE;TYPE=Signal:${signal.url}`);
		}

		if (line) {
			vcardLines.push(`X-SOCIALPROFILE;TYPE=LINE:${line.url}`);
		}

		// Add web URLs
		webLinks.forEach((link) => {
			if (link.type === "instagram") {
				vcardLines.push(`X-SOCIALPROFILE;TYPE=Instagram:${link.url}`);
			} else if (link.type === "linkedin") {
				vcardLines.push(`X-SOCIALPROFILE;TYPE=LinkedIn:${link.url}`);
			} else if (link.type === "github") {
				vcardLines.push(`X-SOCIALPROFILE;TYPE=GitHub:${link.url}`);
			} else if (link.type === "bluesky") {
				vcardLines.push(`X-SOCIALPROFILE;TYPE=Bluesky:${link.url}`);
			} else if (link.type === "discord") {
				vcardLines.push(`X-SOCIALPROFILE;TYPE=Discord:${link.url}`);
			} else {
				vcardLines.push(`URL:${link.url}`);
			}
		});

		vcardLines.push("END:VCARD");
		const vcard = vcardLines.join("\n");

		// Download as file
		const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "contact.vcf";
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Link Maker</title>
</svelte:head>

<div class="container">
	<h1>Link Maker</h1>

	<div class="link-form">
		<div class="form-row">
			<div class="icon-grid">
				{#each linkTypes as type}
					{#if iconData[type.title]}
						<button
							type="button"
							class="icon-button"
							class:selected={selectedType === type.title}
							style="--icon-color: {type.colors[0]}"
							onclick={() => (selectedType = type.title)}
							title={type.title}
						>
							<Icon
								viewBox={iconData[type.title].viewBox}
								content={iconData[type.title].content}
								size="32px"
							/>
						</button>
					{/if}
				{/each}
			</div>

			<input
				bind:value={inputValue}
				placeholder={selectedType
					? `Enter ${selectedType} value`
					: "Select an icon and enter value"}
				class="value-input"
			/>

			<button onclick={addLink} class="add-button">Add Link</button>
		</div>
	</div>

	<div class="links-grid">
		{#each links as link, i}
			<div class="link-card">
				<button
					onclick={() => removeLink(i)}
					class="card-remove"
					title="Remove">×</button
				>
				<div class="card-header">
					<div class="card-icon" style="color: {link.colors[0]}">
						{#if iconData[link.type]}
							<Icon
								viewBox={iconData[link.type].viewBox}
								content={iconData[link.type].content}
								size="20px"
							/>
						{/if}
					</div>
					<a
						href={link.url}
						target="_blank"
						rel="noopener noreferrer"
						class="card-value"
						style="color: {link.colors[0]}"
					>
						{link.value || link.url}
					</a>
				</div>
				<div class="card-qr">
					{#if link.qr}
						<ColoredQr
							qr={link.qr}
							colors={link.colors}
							id="qr-{i}"
							animate={false}
						/>
					{:else}
						<div class="qr-loading">Loading...</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	{#if links.length > 0}
		<button onclick={downloadVCard} class="download-vcard"
			>Download vCard</button
		>
	{/if}
</div>

<style>
	.container {
		max-width: 700px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	h1 {
		font-size: 1.75rem;
		margin-bottom: 1.5rem;
		color: var(--primary, #000);
		font-weight: 600;
		text-align: center;
	}

	.link-form {
		margin-bottom: 2rem;
		background: #f9fafb;
		padding: 1.5rem;
		border-radius: 12px;
		border: 1px solid #e5e7eb;
	}

	.form-row {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.icon-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		width: 100%;
	}

	.icon-button {
		padding: 0.5rem;
		border: none;
		background: transparent;
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
	}

	.icon-button :global(svg) {
		transition: transform 0.2s;
	}

	.icon-button:hover {
		color: var(--icon-color);
	}

	.icon-button:hover :global(svg) {
		transform: scale(1.1);
	}

	.icon-button.selected {
		color: var(--icon-color);
	}

	.icon-button.selected :global(svg) {
		transform: scale(1.15);
	}

	.value-input {
		width: 100%;
		padding: 0.75rem 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.95rem;
		transition: all 0.2s;
		background: white;
	}

	.type-selector:hover,
	.value-input:hover {
		border-color: #9ca3af;
	}

	.value-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.icon-button:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
	}

	.add-button {
		width: 100%;
		padding: 0.75rem 1.5rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.add-button:hover {
		background: #2563eb;
		box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
		transform: translateY(-1px);
	}

	.add-button:active {
		transform: translateY(0);
	}

	.add-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.link-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.card-remove {
		position: absolute;
		top: -0.5rem;
		right: -0.5rem;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		border: none;
		border-radius: 50%;
		font-size: 0.875rem;
		line-height: 1;
		cursor: pointer;
		opacity: 0;
		transition: all 0.2s;
		z-index: 10;
	}

	.link-card:hover .card-remove {
		opacity: 1;
	}

	.card-remove:hover {
		background: #ef4444;
		transform: scale(1.15);
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding-bottom: 0.25rem;
	}

	.card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.card-value {
		font-size: 0.8rem;
		text-decoration: none;
		font-weight: 600;
		word-break: break-all;
		transition: opacity 0.2s;
		flex: 1;
		min-width: 0;
	}

	.card-value:hover {
		opacity: 0.7;
		text-decoration: underline;
	}

	.card-qr {
		width: 100%;
		aspect-ratio: 1;
		background: white;
		border-radius: 0;
		padding: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.card-qr :global(svg) {
		width: 100%;
		height: 100%;
	}

	.qr-loading {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
		font-size: 0.7rem;
		background: #f9fafb;
	}

	.download-vcard {
		width: 100%;
		padding: 0.875rem;
		background: #10b981;
		color: white;
		border: none;
		border-radius: 10px;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.download-vcard:hover {
		background: #059669;
		box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
		transform: translateY(-1px);
	}

	.download-vcard:active {
		transform: translateY(0);
	}

	@media (prefers-color-scheme: dark) {
		h1 {
			color: #f9fafb;
		}

		.link-form {
			background: #1f2937;
			border-color: #374151;
		}

		.icon-button {
			color: #6b7280;
		}

		.value-input {
			background: #111827;
			border-color: #374151;
			color: #f9fafb;
		}

		.value-input:hover {
			border-color: #4b5563;
		}

		.qr-loading {
			background: #111827;
		}

		.card-qr {
			background: white;
		}
	}
</style>
