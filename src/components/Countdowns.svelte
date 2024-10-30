<script>
	let { countdowns } = $props();
	
	let timeStates = $state(countdowns.map(() => ({ days: 0, hours: 0, minutes: 0, seconds: 0 })));

	function updateCountdown() {
		const now = new Date().getTime();
		timeStates = countdowns.map(({ date }) => {
			const distance = date - now;
			
			if (distance < 0) {
				return { days: 0, hours: 0, minutes: 0, seconds: 0 };
			}

			return {
				days: Math.floor(distance / (1000 * 60 * 60 * 24)),
				hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
				minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
				seconds: Math.floor((distance % (1000 * 60)) / 1000)
			};
		});
	}

	let intervalId;

	$effect(() => {
		updateCountdown();
		intervalId = setInterval(updateCountdown, 1000);
		return () => clearInterval(intervalId);
	});

	function padNumber(num) {
		return num.toString().padStart(2, '0');
	}

	const headers = ['Days', 'Hours', 'Minutes', 'Seconds'];
	const opacities = ['', '80', '60', '40'];
</script>

<style>
	.text-primary {
		color: #FF3E00;
	}
</style>

<div class="bg-white p-8 rounded-2xl shadow-md border border-gray-200 max-w-2xl">
	<div class="grid grid-cols-[auto_repeat(4,1fr)] gap-x-4 gap-y-4">
		<!-- Headers -->
		<div class=""></div>
		{#each headers as header, i}
			<div class="text-center text-gray-600/80 font-medium">
				{header}
			</div>
		{/each}

		<!-- Countdown rows -->
		{#each countdowns as countdown, rowIndex}
			<div class="font-medium text-gray-700">
				{countdown.label}
			</div>
			<div class="text-center text-7xl font-bold text-primary">
				{timeStates[rowIndex].days}
			</div>
			<div class="text-center text-6xl font-semibold text-primary/80">
				{padNumber(timeStates[rowIndex].hours)}
			</div>
			<div class="text-center text-5xl font-medium text-primary/60">
				{padNumber(timeStates[rowIndex].minutes)}
			</div>
			<div class="text-center text-4xl font-normal text-primary/40">
				{padNumber(timeStates[rowIndex].seconds)}
			</div>
		{/each}
	</div>
</div>