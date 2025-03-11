<script>
  let hourlyRate = $state(70);

  const timeUnits = {
    hourly: 1,
    daily: 8,
    weekly: 8 * 5,
    biweekly: 8 * 5 * 2,
    monthly: 8 * 5 * (52 / 12),
    annual: 8 * 5 * 52,
  };
  const onkeydown = (e) => e.key === "Enter" && e.target.blur();
  
  const createMultiplier = (unit, threshold) => (e) => {
    const value = parseFloat(e.target.value) || 0;
    if (value > 0 && value < threshold) {
      const adjustedValue = value * 1000;
      hourlyRate = adjustedValue / timeUnits[unit];
      e.target.value = Math.round(adjustedValue);
    }
  };
  
  const onAnnualBlur = createMultiplier('annual', 1000);
  const onMonthlyBlur = createMultiplier('monthly', 20);

  // Enhanced salary object with input handling built into the setters
  const salary = Object.fromEntries(
    Object.entries(timeUnits).map(([unit, multiplier]) => [
      unit,
      {
        get: () => hourlyRate * multiplier,
        set: (value) => {
          const inputValue = parseFloat(value?.target?.value ?? value) || 0;
          hourlyRate = inputValue / multiplier;
        },
      },
    ])
  );
</script>

<div class="container">
  <h1 class="title">Salary Calculator</h1>

  <div class="grid">
    <!-- Hourly Rate -->
    <div class="input-group">
      <div class="input-container">
        <input
          type="number"
          id="hourly"
          value={Math.round(salary.hourly.get())}
          oninput={salary.hourly.set}
          {onkeydown}
          step="1"
          class="input input-number"
        />
      </div>
      <label for="hourly" class="label">/ hr</label>
    </div>

    <!-- Daily Rate -->
    <div class="input-group">
      <div class="input-container">
        <input
          type="number"
          id="daily"
          value={Math.round(salary.daily.get())}
          oninput={salary.daily.set}
          {onkeydown}
          step="1"
          class="input input-number"
        />
      </div>
      <label for="daily" class="label">/ day</label>
    </div>

    <!-- Weekly Rate -->
    <div class="input-group">
      <div class="input-container">
        <input
          type="number"
          id="weekly"
          value={Math.round(salary.weekly.get())}
          oninput={salary.weekly.set}
          {onkeydown}
          step="1"
          class="input input-number"
        />
      </div>
      <label for="weekly" class="label">/ week</label>
    </div>

    <!-- Bi-Weekly Rate -->
    <div class="input-group">
      <div class="input-container">
        <input
          type="number"
          id="bi-weekly"
          value={Math.round(salary.biweekly.get())}
          oninput={salary.biweekly.set}
          {onkeydown}
          step="1"
          class="input input-number"
        />
      </div>
      <label for="bi-weekly" class="label">/ 2 weeks</label>
    </div>

    <!-- Monthly Rate -->
    <div class="input-group">
      <div class="input-container">
        <input
          type="number"
          id="monthly"
          value={Math.round(salary.monthly.get())}
          oninput={salary.monthly.set}
          onblur={onMonthlyBlur}
          {onkeydown}
          step="1"
          class="input input-number"
        />
      </div>
      <label for="monthly" class="label">/ month</label>
    </div>

    <!-- Annual Rate -->
    <div class="input-group">
      <div class="input-container">
        <input
          type="number"
          id="annual"
          value={Math.round(salary.annual.get())}
          oninput={salary.annual.set}
          onblur={onAnnualBlur}
          {onkeydown}
          step="1"
          class="input input-number"
        />
      </div>
      <label for="annual" class="label">/ year</label>
    </div>
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
