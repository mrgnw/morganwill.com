<script>
	import * as Table from '$lib/components/ui/table';
	import { Progress } from '$lib/components/ui/progress';
	import { onMount, onDestroy } from 'svelte';
	import { writable } from 'svelte/store';

	let megabits = 1024 * 1024 * 8;
	// Define transfer data structure
	let transfers = writable([
		{ id: '1', name: 'ubuntu-22.04.3-desktop-amd64.iso', size: 4.5 * 1024 * megabits, downloaded: 0, speed: 1.2 * 1024 },
		{ id: '2', name: 'family-vacation-2023.zip', size: 2.3 * 1024 * megabits, downloaded: 0, speed: 99.5 * 1024 * 1024 },
		{ id: '3', name: 'project-presentation.pptx', size: 35 * megabits, downloaded: 0, speed: 2.8 * 1024 },
		{ id: '4', name: 'game-update-v2.1.patch', size: 8.2 * 1024 * megabits, downloaded: 0, speed: 15.7 * 1024 },
		{ id: '5', name: 'cat-video-4k.mp4', size: 1.8 * 1024 * megabits, downloaded: 0, speed: 128 * 1024 },
		{ id: '6', name: 'backup-2024-03.tar.gz', size: 15 * 1024 * megabits, downloaded: 0, speed: 1.5 * 1024 * 1024 },
		{ id: '7', name: 'spotify-podcast-episode.mp3', size: 85 * megabits, downloaded: 0, speed: 3.2 * 1024 * 1024 },
		{ id: '8', name: 'vscode-1.87.0.deb', size: 120 * megabits, downloaded: 0, speed: 5.5 * 1024 * 1024 },
		{ id: '9', name: 'react-project-node-modules.zip', size: 250 * megabits, downloaded: 0, speed: 7.8 * 1024 * 1024 },
		{ id: '10', name: 'company-database-backup.sql', size: 1.2 * 1024 * megabits, downloaded: 0, speed: 9.8 * 1024 * 1024 },
		{ id: '11', name: 'wedding-photos-hq.rar', size: 5.8 * 1024 * megabits, downloaded: 0, speed: 11.2 * 1024 * 1024 },
		{ id: '12', name: 'android-studio-2024.exe', size: 2.1 * 1024 * megabits, downloaded: 0, speed: 13.5 * 1024 * 1024 },
		{ id: '13', name: 'quarterly-report-graphs.xlsx', size: 28 * megabits, downloaded: 0, speed: 15.9 * 1024 * 1024 },
		{ id: '14', name: 'unreal-engine-assets.pak', size: 22 * 1024 * megabits, downloaded: 0, speed: 18.3 * 1024 * 1024 },
		{ id: '15', name: 'client-meeting-recording.webm', size: 450 * megabits, downloaded: 0, speed: 20.7 * 1024 * 1024 },
		{ id: '16', name: 'docker-images-export.tar', size: 3.2 * 1024 * megabits, downloaded: 0, speed: 22.1 * 1024 * 1024 },
		{ id: '17', name: 'design-assets-march.sketch', size: 890 * megabits, downloaded: 0, speed: 24.5 * 1024 * 1024 },
		{ id: '18', name: 'security-camera-footage.mkv', size: 12 * 1024 * megabits, downloaded: 0, speed: 26.9 * 1024 * 1024 },
		{ id: '19', name: 'kubernetes-logs.txt', size: 75 * megabits, downloaded: 0, speed: 29.3 * 1024 * 1024 },
		{ id: '20', name: 'blender-3d-model.blend', size: 1.5 * 1024 * megabits, downloaded: 0, speed: 31.7 * 1024 * 1024 },
		// { id: '21', name: 'archived-emails-2023.pst', size: 4.2 * 1024 * megabits, downloaded: 0, speed: 34.1 * 1024 * 1024 },
		// { id: '22', name: 'game-textures-ultra-hd.pak', size: 18 * 1024 * megabits, downloaded: 0, speed: 36.5 * 1024 * 1024 },
		// { id: '23', name: 'ml-training-dataset.csv', size: 920 * megabits, downloaded: 0, speed: 38.9 * 1024 * 1024 },
		// { id: '24', name: 'ios-app-build.ipa', size: 180 * megabits, downloaded: 0, speed: 41.3 * 1024 * 1024 },
		// { id: '25', name: 'website-backup-full.wpress', size: 2.8 * 1024 * megabits, downloaded: 0, speed: 43.7 * 1024 * 1024 },
		// { id: '26', name: 'premiere-project-raw.prproj', size: 45 * 1024 * megabits, downloaded: 0, speed: 46.1 * 1024 * 1024 },
		// { id: '27', name: 'jenkins-build-artifacts.zip', size: 750 * megabits, downloaded: 0, speed: 48.5 * 1024 * 1024 },
		// { id: '28', name: 'virtual-machine-snapshot.vmdk', size: 25 * 1024 * megabits, downloaded: 0, speed: 50.9 * 1024 * 1024 },
		// { id: '29', name: 'confluence-attachments.zip', size: 1.1 * 1024 * megabits, downloaded: 0, speed: 53.3 * 1024 * 1024 },
		// { id: '30', name: 'steam-game-download.depot', size: 85 * 1024 * megabits, downloaded: 0, speed: 55.7 * 1024 * 1024 },
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
			return Math.round(mb).toString();
		} else {
			// Mixed units
			if (bytes >= 1024 * 1024 * 1024) {
				return Math.round(bytes / (1024 * 1024 * 1024)) + ' GiB';
			} else if (bytes >= 1024 * 1024) {
				return Math.round(bytes / (1024 * 1024)) + ' MiB';
			} else if (bytes >= 1024) {
				return Math.round(bytes / 1024) + ' KiB';
			} else {
				return Math.round(bytes) + ' B';
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