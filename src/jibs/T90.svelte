<script>
	import Countdowns from '$components/Countdowns.svelte';
	
	let finalDate = new Date('2025-04-07T23:59:59');
	let buffer_days = 90;
	let ms_per_day = 24 * 60 * 60 * 1000;
	let targetDate = finalDate;

	let date2 = new Date('2025-02-24T23:59:59');
    let date3 = new Date(finalDate.getTime() + 90 * ms_per_day);

    let dates = [
        { date: date2, label: '' },
        { date: finalDate, label: '' },
        { date: date3, label: '' },
    ];
</script>

<Countdowns dates={dates}/>