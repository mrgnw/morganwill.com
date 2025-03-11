<script>
  let hourlyRate = $state(70);

  const timeUnits = {
    hour: 1,
    day: 8,
    week: 8 * 5,
    biweekly: 8 * 5 * 2,
    month: 8 * 5 * (52 / 12),
    year: 8 * 5 * 52,
  };
  const thresholds = { week: 10, month: 20, year: 1000 };
  const onkeydown = (e) => e.key === "Enter" && e.target.blur();

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
  <h1 class="title">Salary Calculator</h1>

  <div class="grid">
    {#each Object.entries(salary) as [unit, handlers]}
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
  }
</style>
