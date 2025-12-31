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
			<div class="type-selector-wrapper">
				{#if selectedType && iconData[selectedType]}
					<div
						class="selected-icon"
						style="color: {linkTemplates.find(
							(t) => t.title === selectedType,
						)?.colors[0]}"
					>
						<Icon id={selectedType} size="24px" />
					</div>
				{/if}
				<select bind:value={selectedType} class="type-selector">
					<option value="">Select type</option>
					{#each linkTypes as type}
						<option value={type.title}>
							{type.title}
						</option>
					{/each}
				</select>
			</div>

			<input
				bind:value={inputValue}
				placeholder={selectedType
					? `Enter ${selectedType} value`
					: "Enter value"}
				class="value-input"
			/>

			<button onclick={addLink} class="add-button">Add</button>
		</div>
	</div>

	<div class="links-list">
		{#each links as link, i}
			<div class="link-item">
				<div class="link-icon" style="color: {link.colors[0]}">
					{#if iconData[link.type]}
						<Icon id={link.type} size="40px" />
					{/if}
				</div>
				<a
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					class="link-value"
				>
					{link.value || link.url}
				</a>
				<div class="link-qr">
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
				<button onclick={() => removeLink(i)} class="remove-button"
					>×</button
				>
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
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	h1 {
		font-size: 1.75rem;
		margin-bottom: 1.5rem;
		color: var(--primary, #000);
		font-weight: 600;
	}

	.link-form {
		margin-bottom: 1.5rem;
		background: #f9fafb;
		padding: 1.25rem;
		border-radius: 12px;
		border: 1px solid #e5e7eb;
	}

	.form-row {
		display: grid;
		grid-template-columns: 220px 320px auto;
		gap: 0.75rem;
		align-items: center;
	}

	.type-selector-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.selected-icon {
		position: absolute;
		left: 0.75rem;
		pointer-events: none;
		display: flex;
		align-items: center;
		z-index: 1;
	}

	.type-selector {
		width: 100%;
		padding: 0.65rem 0.75rem;
		padding-left: 3rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.95rem;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.value-input {
		padding: 0.65rem 0.75rem;
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

	.type-selector:focus,
	.value-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.add-button {
		padding: 0.65rem 1.5rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.95rem;
		font-weight: 500;
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

	.links-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.link-item {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		gap: 1.25rem;
		padding: 1rem 1.25rem;
		border: 1px solid #e5e7eb;
		border-radius: 10px;
		align-items: center;
		background: white;
		transition:
			box-shadow 0.2s,
			border-color 0.2s;
	}

	.link-item:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		border-color: #d1d5db;
	}

	.link-icon {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.link-value {
		font-size: 1rem;
		color: var(--primary, #000);
		text-decoration: none;
		font-weight: 500;
		word-break: break-all;
		transition: color 0.2s;
	}

	.link-value:hover {
		color: #3b82f6;
		text-decoration: underline;
	}

	.link-qr {
		width: 70px;
		height: 70px;
	}

	.link-qr :global(svg) {
		width: 100%;
		height: 100%;
	}

	.qr-loading {
		width: 70px;
		height: 70px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #9ca3af;
		font-size: 0.7rem;
		background: #f3f4f6;
		border-radius: 6px;
	}

	.remove-button {
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 50%;
		font-size: 1.25rem;
		line-height: 1;
		cursor: pointer;
		transition: all 0.2s;
		opacity: 0.8;
	}

	.remove-button:hover {
		background: #dc2626;
		opacity: 1;
		transform: scale(1.1);
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

		.type-selector,
		.value-input {
			background: #111827;
			border-color: #374151;
			color: #f9fafb;
		}

		.type-selector:hover,
		.value-input:hover {
			border-color: #4b5563;
		}

		.link-item {
			background: #1f2937;
			border-color: #374151;
		}

		.link-item:hover {
			border-color: #4b5563;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		}

		.link-value {
			color: #f9fafb;
		}

		.qr-loading {
			background: #111827;
			color: #6b7280;
		}
	}
</style>
