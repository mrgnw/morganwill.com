<script>
  import { useNow } from "@ariefsn/svelte-use";

  let { targetDate, label = "" } = $props();

  const now = useNow();

  let countingUp = $derived(now() > targetDate);
  let distance = $derived(Math.abs(targetDate - now()));

  let days = $derived(Math.floor(distance / (1000 * 60 * 60 * 24)));
  let hours = $derived(
    Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
  );
  let minutes = $derived(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
  let seconds = $derived(Math.floor((distance % (1000 * 60)) / 1000));

  function padNumber(num) {
    return num.toString().padStart(2, "0");
  }

  let timeUnits = $derived([
    {
      value: days,
      label: "Day",
      size: "text-7xl",
      weight: "font-bold",
      opacity: "",
    },
    {
      value: hours,
      label: "Hour",
      size: "text-6xl",
      weight: "font-semibold",
      opacity: "80",
    },
    {
      value: minutes,
      label: "Minute",
      size: "text-5xl",
      weight: "font-medium",
      opacity: "60",
    },
    {
      value: seconds,
      label: "Second",
      size: "text-4xl",
      weight: "font-normal",
      opacity: "40",
    },
  ]);
</script>

<div class="flex flex-col items-center justify-center">
  <div
    class="bg-white p-8 rounded-2xl shadow-md flex flex-col items-center gap-2 max-w-3xl border border-gray-200"
  >
    {#if label}
      <h2 class="text-2xl font-bold mb-2">{label}</h2>
    {/if}
    <div class="flex flex-wrap justify-center items-center gap-6">
      {#each timeUnits as unit}
        <div class="flex flex-col items-center">
          <span
            class="{unit.size} {unit.weight} {countingUp ? 'text-up' : 'text-primary'}{unit.opacity
              ? '/' + unit.opacity
              : ''} leading-none"
          >
            {unit.value === days ? unit.value : padNumber(unit.value)}
          </span>
          <span class="text-gray-600{unit.opacity ? '/' + unit.opacity : ''}">
            {unit.value === 1 ? unit.label : unit.label + "s"}
          </span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  :global(body) {
    font-family: "Arial", sans-serif;
  }

  .text-primary {
    color: #ff3e00;
  }
  .text-up {
    color: #007aff;
  }
</style>
