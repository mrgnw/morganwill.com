<script>
	let { dates = [] } = $props();

	// Normalize input to [{ date: Date, label?: string }]
	function normalizeDate(item) {
		if (typeof item === "string" || item instanceof Date) {
			return { date: new Date(item) };
		}
		if (item && item.date) {
			return { date: new Date(item.date), label: item.label };
		}
		return null;
	}

	let normalized = $derived.by(() => Array.isArray(dates) ? dates.map(normalizeDate).filter(Boolean) : []);

	function getTimeParts(targetDate) {
		const now = new Date().getTime();
		const countingUp = now > targetDate.getTime();
		const distance = Math.abs(targetDate.getTime() - now);

		const days = Math.floor(distance / (1000 * 60 * 60 * 24));
		const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((distance % (1000 * 60)) / 1000);

		// Add formatted date string for tooltip
		const dateString = targetDate.toLocaleDateString(undefined, {
			month: "long",
			day: "numeric",
			year: "numeric"
		});

		return { days, hours, minutes, seconds, countingUp, dateString };
	}

	let timers = $state([]);

	function updateTimers() {
		timers = normalized.map(({ date, label }) => {
			const t = getTimeParts(date);
			return { ...t, label };
		});
	}

	let intervalId;
	$effect(() => {
		updateTimers();
		intervalId = setInterval(updateTimers, 1000);
		return () => clearInterval(intervalId);
	});

	function pad(num) {
		return num.toString().padStart(2, "0");
	}
</script>

<div class="countdowns-list">
	{#each timers as timer}
		<div class="countdown-row" title={timer.dateString}>
			<span class="label">{timer.label ?? ""}</span>
			<span class="days {timer.countingUp ? 'up' : 'down'}">{timer.days}</span>
			<span class="time">{pad(timer.hours)}</span>
			<span class="time-sm">{pad(timer.minutes)}</span>
			<span class="time-sm">{pad(timer.seconds)}</span>
		</div>
	{/each}
</div>

<style>
	.countdowns-list {
		display: flex;
		flex-direction: column;
		gap: 0.1em; /* reduced vertical gap */
		font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
		font-size: 1.25em; /* bigger font */
	}

	.countdown-header {
		display: flex;
		align-items: baseline;
		gap: 0.7em;
		padding: 0.3em 0.5em;
		font-size: 1em;
		font-weight: 600;
		color: #aaa;
		letter-spacing: 0.04em;
	}

	.label-header {
		min-width: 6em;
		text-align: right;
		margin-right: 0.5em;
	}

	.days-header, .time-header {
		min-width: 3.2em;
		text-align: right;
	}

	.countdown-row {
		display: flex;
		align-items: baseline;
		gap: 0.05em; /* much smaller horizontal gap */
		padding: 0.15em 0.5em; /* reduced vertical padding */
		border-radius: 0.5em;
		transition: background 0.2s;
	}

	.label {
		min-width: 6em;
		color: #888;
		font-size: 1em;
		font-weight: 500;
		letter-spacing: 0.02em;
		margin-right: 0.05em; /* minimal margin */
		text-align: right;
	}

	.days {
		font-size: 2.7em; /* bigger font */
		font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace; /* ensure monospace */
		font-weight: bold;
		letter-spacing: 0.03em;
		width: 3.2em; /* fixed width for alignment */
		min-width: 3.2em;
		max-width: 3.2em;
		text-align: right;
		transition: color 0.2s;
		box-sizing: border-box;
	}
	.days.down {
		color: #ff3e00;
	}
	.days.up {
		color: #007aff;
	}
	.time {
		font-size: 1.4em;
		font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
		font-weight: 500;
		min-width: 2.1em;
		text-align: right;
	}
	.time-sm {
		font-size: 1em;
		color: #bbb;
		font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
		font-weight: 400;
		min-width: 2.1em;
		text-align: right;
	}
</style>
