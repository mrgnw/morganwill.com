<script>
	import * as Table from '$lib/components/ui/table';
	
	const transfers = [
		{ id: '1', name: 'Transfer A', speed: '1.90KiB/s' },
		{ id: '2', name: 'Transfer B', speed: '999KiB/s' },
		{ id: '3', name: 'Transfer C', speed: '1.50MiB/s' },
	];

	const convertToMbps = (speed) => {
		const regex = /([\d.]+)([KMGT]iB)\/s/;
		const match = speed.match(regex);
		if (!match) return '…';

		let [_, value, unit] = match;
		let num = parseFloat(value);

		switch(unit) {
			case 'KiB':
				num = num * 8 / 1024; // Convert KiB/s to Mbps
				break;
			case 'MiB':
				num = num * 8; // Convert MiB/s to Mbps
				break;
			default:
				return '…';
		}

		return num < 1 ? '…' : num.toFixed(1);
	};
</script>

<style>
	:global(.number) {
		font-family: monospace;
		text-align: right;
	}
</style>

<div class="container p-6">
	<h2 class="text-xl font-semibold mb-4">Transfer Speeds</h2>
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>#</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head class="text-right">Original Speed</Table.Head>
					<Table.Head class="text-right">Mbps</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each transfers as transfer}
					<Table.Row>
						<Table.Cell>{transfer.id}</Table.Cell>
						<Table.Cell>{transfer.name}</Table.Cell>
						<Table.Cell class="number">{transfer.speed}</Table.Cell>
						<Table.Cell class="number">{convertToMbps(transfer.speed)}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>