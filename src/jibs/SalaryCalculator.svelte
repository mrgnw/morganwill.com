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

  // Enhanced salary object with input handling built into the setters
  const salary = Object.fromEntries(
    Object.entries(timeUnits).map(([unit, multiplier]) => [
      unit,
      {
        get: () => hourlyRate * multiplier,
        set: (value) => {
          // Handle both direct value setting and event handling
          if (value && value.target) {
            // If it's an input event
            const parsedValue = parseFloat(value.target.value) || 0;
            hourlyRate = parsedValue / multiplier;
          } else {
            // If it's a direct value
            hourlyRate = value / multiplier;
          }
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
          onkeydown={onkeydown}
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
          onkeydown={onkeydown}
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
          onkeydown={onkeydown}
          step="1"
          class="input input-number"
        />
      </div>
      <label for="weekly" class="label"> / week</label>
    </div>

    <!-- Bi-Weekly Rate -->
    <div class="input-group">
      <div class="input-container">
        <input
          type="number"
          id="bi-weekly"
          value={Math.round(salary.biweekly.get())}
          oninput={salary.biweekly.set}
          onkeydown={onkeydown}
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
          onkeydown={onkeydown}
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
          onkeydown={onkeydown}
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
    width: 6em; /* Fixed width for the input container */
    display: flex;
    justify-content: flex-end;
  }

  .input {
    font-family: "JetBrains Mono", "Roboto Mono", "SF Mono", "Fira Code",
      "Fira Mono", "Menlo", monospace;
    font-size: 1.5rem;
    font-weight: 600;
    padding: 0.4rem 0;  /* Reduced from 0.75rem to 0.4rem */
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
    font-weight: 500;
    color: #4b5563;
    white-space: nowrap;
    margin-left: 4px;
    text-align: left;
    width: 80px; /* Fixed width for the label */
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Remove browser styling for number inputs */
  :global(input[type="number"]) {
    -moz-appearance: textfield;
  }

  :global(input[type="number"]::-webkit-outer-spin-button),
  :global(input[type="number"]::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Mobile responsive adjustments */
  @media (max-width: 640px) {
    .container {
      padding: 1rem;
    }

    .input-group {
      justify-content: flex-end;
    }

    .input {
      font-size: 1.25rem;
      padding: 0.3rem 0;  /* Reduced from 0.5rem to 0.3rem for mobile */
    }
  }
</style>
