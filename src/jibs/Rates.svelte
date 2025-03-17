<script>
  import { fade } from "svelte/transition";
  let hourlyRate = $state(70);
  let selected_units = $state(['hour', 'day', 'week', 'month', 'year']); // Default selection

  const timeUnits = {
    second: 1 / 3600, // 1/3600 of an hour
    minute: 1 / 60,   // 1/60 of an hour
    hour: 1,
    day: 8,
    week: 8 * 5,
    biweekly: 8 * 5 * 2,
    month: 8 * 5 * (52 / 12),
    year: 8 * 5 * 52,
  };
  const thresholds = { week: 10, month: 20, year: 1000 };
  const onkeydown = (e) => e.key === "Enter" && e.target.blur();

  function toggleUnit(unit) {
    if (selected_units.includes(unit)) {
      // Remove the unit if it's already selected, but prevent removing all units
      if (selected_units.length > 1) {
        selected_units = selected_units.filter(u => u !== unit);
      }
    } else {
      // Add the unit if it's not selected
      selected_units = [...selected_units, unit];
    }
  }

  let exchangeRate = $state(1.08);
  let eur_to_usd = $state(1.08);
  let usd_to_eur = $state(1 / 1.08);

  // Fetch exchange rate
  const fetchExchangeRates = async () => {
    try {
      const response = await fetch(
        "https://api.frankfurter.app/latest?from=EUR&to=USD"
      );
      const data = await response.json();
      eur_to_usd = data.rates.USD;
      usd_to_eur = 1 / data.rates.USD;
      exchangeRate = data.rates.USD;
    } catch (error) {
      console.error("Failed to fetch exchange rate", error);
      // Handle error appropriately, e.g., display a message to the user
      return null; // Indicate failure
    }
  };

  let exchangeRatesPromise = fetchExchangeRates();

  function convertToEUR() { hourlyRate = hourlyRate * usd_to_eur; }
  function convertToUSD() { hourlyRate = hourlyRate * eur_to_usd; }

  // Enhanced salary object with input handling and auto-scaling built in
  const salary = Object.fromEntries(
    Object.entries(timeUnits).map(([unit, multiplier]) => [
      unit,
      {
        get: () => hourlyRate * multiplier,
        set: (value) => {
          const inputValue = parseFloat(value?.target?.value ?? value) || 0;
          hourlyRate = inputValue / multiplier;
        },
        onblur: (e) => {
          if (!thresholds[unit]) return;

          const value = parseFloat(e.target.value) || 0;
          if (value > 0 && value < thresholds[unit]) {
            hourlyRate = (value * 1000) / multiplier;
            e.target.value = Math.round(value * 1000);
          }
        },
      },
    ])
  );
</script>

<div class="container">
  <h1 class="title">Rate Converter</h1>

  <div class="unit-selector">
    <h2>Select Units</h2>
    <div class="unit-buttons">
      {#each Object.keys(timeUnits) as unit}
        <button 
          class="unit-button" 
          class:active={selected_units.includes(unit)} 
          onclick={() => toggleUnit(unit)}
        >
          {unit === "biweekly" ? "2 weeks" : unit}
        </button>
      {/each}
    </div>
  </div>

  <div class="grid">
    {#each Object.entries(salary).filter(([unit, _]) => selected_units.includes(unit)) as [unit, handlers]}
      <div class="input-group">
        <div class="input-container">
          <input
            type="number"
            id={unit}
            value={Math.round(handlers.get())}
            oninput={handlers.set}
            onblur={handlers.onblur}
            {onkeydown}
            step="1"
            class="input input-number"
          />
        </div>
        <label for={unit} class="label">
          / {unit === "biweekly" ? "2 weeks" : unit}
        </label>
      </div>
    {/each}
  </div>

  {#await exchangeRatesPromise}
    <div class="currency-converter">
      <button class="currency-button" disabled>&times; $</button>
      <button class="currency-button" disabled>&times; €</button>
    </div>
  {:then _}
    <div class="currency-converter" transition:fade>
      <button class="currency-button" onclick={convertToUSD}
        >&times; {eur_to_usd.toFixed(2)} to $</button
      >
      <button class="currency-button" onclick={convertToEUR}
        >&times; {usd_to_eur.toFixed(2)} to €</button
      >
    </div>
  {/await}
</div>

<style>
  .container {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
  }

  .title {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
  }

  .unit-selector {
    margin: 1rem 0 2rem;
  }

  .unit-selector h2 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  .unit-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .unit-button {
    padding: 0.4rem 0.75rem;
    border-radius: 4px;
    background-color: #f3f4f6;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s ease;
  }

  .unit-button.active {
    background-color: #2563eb;
    color: white;
    border-color: #2563eb;
  }

  .unit-button:hover {
    background-color: #e5e7eb;
    border-color: #d1d5db;
  }

  .unit-button.active:hover {
    background-color: #1d4ed8;
    border-color: #1d4ed8;
  }

  .grid {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .input-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    max-width: 220px;
    margin: 0 auto;
  }

  .currency-symbol {
    font-size: 1.25rem;
    margin-right: 0.25rem;
    width: 1em;
    text-align: center;
  }

  .input-container {
    width: 6em;
    display: flex;
    justify-content: flex-end;
  }

  .input {
    font-family: "Roboto Mono", "SF Mono", "Fira Code", "Fira Mono", "Menlo",
      monospace;
    font-size: 1.5rem;
    font-weight: 300;
    padding: 0.4rem 0;
    text-align: right;
    background: transparent;
    border: none;
    border-bottom: 2px solid #e5e7eb;
    transition: all 0.2s ease;
    width: 100%;
    border-radius: 0;
  }

  .input-number {
    text-align: right;
  }

  .input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: none;
    background: transparent;
  }

  .label {
    font-size: 1.125rem;
    font-weight: 300;
    color: #4b5563;
    white-space: nowrap;
    margin-left: 4px;
    text-align: left;
    width: 80px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .currency-converter {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
    gap: 0.75rem;
  }

  .currency-button {
    flex: 0 0 auto;
    padding: 0.6rem 1.25rem;
    background-color: #f0fdfa; /* Use a very light green */
    color: #333; /* Use a dark gray */
    border: 1px solid #b2f2bb; /* Use a light green border */
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 80px;
    position: relative;
    overflow: hidden; /* Ensure content stays within the button */
  }

  .currency-button:hover {
    background-color: #d1fae5; /* Slightly darker green on hover */
    border-color: #6ee7b7;
    transform: translateY(-1px);
  }

  .currency-button:active {
    transform: translateY(0);
    background-color: #a7f3d0; /* Even darker green on active */
  }

  .currency-button .currency-symbol {
    display: none;
  }

  .currency-button .rate {
    position: static;
    transform: none;
    font-size: 1.1rem;
    font-weight: 500;
    color: inherit;
    opacity: 1;
    margin-left: 0.4rem;
  }

  .currency-button:disabled {
    opacity: 0;
    cursor: not-allowed;
  }

  .exchange-rates {
    font-size: 0.75rem;
    color: #777;
    text-align: center;
    margin-top: 0.5rem;
  }

  :global(input[type="number"]) {
    -moz-appearance: textfield;
    -webkit-appearance: textfield;
    appearance: textfield;
  }

  :global(input[type="number"]::-webkit-outer-spin-button),
  :global(input[type="number"]::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Mobile responsive adjustments */
  @media (max-width: 640px) {
    .input-group {
      justify-content: flex-end;
    }

    .currency-converter {
      flex-direction: row;
      justify-content: center;
    }
  }
</style>
