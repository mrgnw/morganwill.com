<script>
  import Countdown from '$components/Countdown.svelte';
	import Countdowns from '$components/Countdowns.svelte';
	
	let finalDate = new Date('2025-04-07T23:59:59');
	let buffer_days = 90;
	let ms_per_day = 24 * 60 * 60 * 1000;
	let targetDate = finalDate.getTime() - (buffer_days * ms_per_day);
</script>

<div class="flex h-screen items-center justify-center">
	<Countdowns countdowns={[
		{ date: targetDate },
		{ date: finalDate }
	]} />
</div>