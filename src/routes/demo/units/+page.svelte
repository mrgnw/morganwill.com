<script>
	import * as Table from '$lib/components/ui/table';
	import { Progress } from '$lib/components/ui/progress';
	import { onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';

	let megabits = 1024 * 1024 * 8;
	// Define transfer data structure
	let transfers = writable([
		{ id: '1', name: 'Transfer A', size: 10 * megabits, downloaded: 0, speed: 1.90 * megabits }, // Size in Bytes, Speed in Bytes/s
		{ id: '2', name: 'Transfer B', size: 5000 * megabits, downloaded: 0, speed: 999 * megabits },
		{ id: '3', name: 'Transfer C', size: 100 * megabits, downloaded: 0, speed: 1.50 * megabits },
	]);

	// Toggle between easy units and mixed units
	const displayEasyUnits = writable(true);

	// Function to toggle units
	const toggleUnits = () => {
		displayEasyUnits.update(n => !n);
	};

	// Helper functions to convert bytes to desired units
	const formatSpeed = (bytesPerSec, easy) => {
		if (easy) {
			// Convert to Mbps
			const mbps = (bytesPerSec * 8) / (1024 * 1024);
			return mbps < 1 ? '…' : mbps.toFixed(1);
		} else {
			// Mixed units
			if (bytesPerSec >= 1024 * 1024) {
				return (bytesPerSec / (1024 * 1024)).toFixed(2) + ' MiB/s';
			} else if (bytesPerSec >= 1024) {
				return (bytesPerSec / 1024).toFixed(2) + ' KiB/s';
			} else {
				return bytesPerSec.toFixed(2) + ' B/s';
			}
		}
	};

	const formatSize = (bytes, easy) => {
		if (easy) {
			// Convert to MB
			const mb = bytes / (1024 * 1024);
			return mb.toFixed(2);
		} else {
			// Mixed units
			if (bytes >= 1024 * 1024 * 1024) {
				return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GiB';
			} else if (bytes >= 1024 * 1024) {
				return (bytes / (1024 * 1024)).toFixed(2) + ' MiB';
			} else if (bytes >= 1024) {
				return (bytes / 1024).toFixed(2) + ' KiB';
			} else {
				return bytes.toFixed(2) + ' B';
			}
		}
	};

	// Simulate download progress
	let interval;

	onMount(() => {
		interval = setInterval(() => {
			transfers.update(current => current.map(transfer => {
				if (transfer.downloaded >= transfer.size) return transfer;

				// Vary speed by ±10%
				const variedSpeed = transfer.speed * (0.9 + Math.random() * 0.2);

				// Calculate new downloaded amount
				let newDownloaded = transfer.downloaded + variedSpeed;
				if (newDownloaded > transfer.size) newDownloaded = transfer.size;

				return { ...transfer, downloaded: newDownloaded, speed: variedSpeed };
			}));
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<style>
	:global(.number) {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
		text-align: right;
	}
	.button {
		margin-bottom: 1rem;
	}
	.progress-bar {
		height: 8px;
		border-radius: 4px;
		background-color: #e5e7eb; /* Tailwind gray-200 */
		margin-top: 4px;
		overflow: hidden;
	}
	.progress {
		height: 100%;
		background-color: #3b82f6; /* Tailwind blue-500 */
	}
</style>

<div class="container p-6">
	<h2 class="text-2xl font-semibold">Transfer Speeds</h2>
	
	<button class="button px-4 py-2 bg-blue-500 text-white rounded" on:click={toggleUnits}>
		Toggle Units
	</button>
	
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Progress</Table.Head>
					<Table.Head>#</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head class="number">Size</Table.Head>
					<Table.Head class="number">Downloaded</Table.Head>
					<Table.Head class="number">Remaining</Table.Head>
					<Table.Head class="number">Speed</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each $transfers as transfer}
					<Table.Row>
						<Table.Cell>
							<div class="progress-bar">
								<div 
									class="progress" 
									style="width: {(transfer.downloaded / transfer.size) * 100}%"
								></div>
							</div>
						</Table.Cell>
						<Table.Cell>{transfer.id}</Table.Cell>
						<Table.Cell>{transfer.name}</Table.Cell>
						<Table.Cell class="number">
							{#if $displayEasyUnits}
								{formatSize(transfer.size, true)}
							{:else}
								{formatSize(transfer.size, false)}
							{/if}
						</Table.Cell>
						<Table.Cell class="number">
							{#if $displayEasyUnits}
								{formatSize(transfer.downloaded, true)}
							{:else}
								{formatSize(transfer.downloaded, false)}
							{/if}
						</Table.Cell>
						<Table.Cell class="number">
							{#if $displayEasyUnits}
								{formatSize(transfer.size - transfer.downloaded, true)}
							{:else}
								{formatSize(transfer.size - transfer.downloaded, false)}
							{/if}
						</Table.Cell>
						<Table.Cell class="number">
							{#if $displayEasyUnits}
								{formatSpeed(transfer.speed, true)}
							{:else}
								{formatSpeed(transfer.speed, false)}
							{/if}
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>