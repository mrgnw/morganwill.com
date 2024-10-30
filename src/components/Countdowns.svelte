<script>
	let { countdowns } = $props();
	
	let timeStates = $state(countdowns.map(() => ({ days: 0, hours: 0, minutes: 0, seconds: 0 })));

	let uniqueValues = $derived({
		hours: new Set(timeStates.map(s => s.hours)).size === 1 ? timeStates[0].hours : null,
		minutes: new Set(timeStates.map(s => s.minutes)).size === 1 ? timeStates[0].minutes : null,
		seconds: new Set(timeStates.map(s => s.seconds)).size === 1 ? timeStates[0].seconds : null
	});

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
</script>

<style>
	.text-primary {
		color: #FF3E00;
	}
</style>

<div class="bg-white p-8 rounded-2xl shadow-md border border-gray-200 max-w-2xl">
	<div class="grid grid-cols-[auto_repeat(4,1fr)] gap-x-8 gap-y-4">
		<!-- Days column -->
		<div class="grid grid-rows-2 gap-4">
			{#each countdowns as countdown, i}
				<div class="font-medium text-gray-700">
					{countdown.label}
				</div>
			{/each}
		</div>
		<div class="grid grid-rows-2 gap-4">
			{#each countdowns as countdown, i}
				<div class="text-center text-7xl {timeStates[i].days === 0 ? 'font-thin' : 'font-bold'} text-primary{timeStates[i].days === 0 ? '/40' : ''}">
					{timeStates[i].days === 0 ? '⋅' : timeStates[i].days}
				</div>
			{/each}
		</div>

		<!-- Hours -->
		<div class="grid items-center h-full">
			<div class="text-center text-6xl {uniqueValues.hours === 0 ? 'font-thin' : 'font-semibold'} text-primary{uniqueValues.hours === 0 ? '/40' : '/80'}">
				{uniqueValues.hours === 0 ? '⋅' : padNumber(uniqueValues.hours)}
			</div>
		</div>

		<!-- Minutes -->
		<div class="grid items-center h-full">
			<div class="text-center text-5xl {uniqueValues.minutes === 0 ? 'font-thin' : 'font-medium'} text-primary{uniqueValues.minutes === 0 ? '/40' : '/60'}">
				{uniqueValues.minutes === 0 ? '⋅' : padNumber(uniqueValues.minutes)}
			</div>
		</div>

		<!-- Seconds -->
		<div class="grid items-center h-full">
			<div class="text-center text-4xl font-thin text-primary/40">
				{uniqueValues.seconds === 0 ? '⋅' : padNumber(uniqueValues.seconds)}
			</div>
		</div>
	</div>
</div>