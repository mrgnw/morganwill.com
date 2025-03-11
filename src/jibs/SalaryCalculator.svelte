<script>
  const HOURS_PER_DAY = 8;
  const DAYS_PER_WEEK = 5;
  const WEEKS_PER_MONTH = 4 + 1 / 3; // Approximation
  const WEEKS_PER_YEAR = 52;
  const BI_WEEKLY_WEEKS = 2;

  let hourlyRate = $state(70);

  let salary = {
    get hourly() { return hourlyRate; },
    set hourly(value) { hourlyRate = value; },

    get daily() { return hourlyRate * HOURS_PER_DAY; },
    set daily(value) { hourlyRate = value / HOURS_PER_DAY; },

    get weekly() { return hourlyRate * HOURS_PER_DAY * DAYS_PER_WEEK; },
    set weekly(value) { hourlyRate = value / (HOURS_PER_DAY * DAYS_PER_WEEK); },
    
    get biWeekly() { return hourlyRate * HOURS_PER_DAY * DAYS_PER_WEEK * BI_WEEKLY_WEEKS; },
    set biWeekly(value) { hourlyRate = value / (HOURS_PER_DAY * DAYS_PER_WEEK * BI_WEEKLY_WEEKS); },

    get monthly() { return hourlyRate * HOURS_PER_DAY * DAYS_PER_WEEK * WEEKS_PER_MONTH; },
    set monthly(value) { hourlyRate = value / (HOURS_PER_DAY * DAYS_PER_WEEK * WEEKS_PER_MONTH); },

    get annual() { return hourlyRate * HOURS_PER_DAY * DAYS_PER_WEEK * WEEKS_PER_YEAR; },
    set annual(value) { hourlyRate = value / (HOURS_PER_DAY * DAYS_PER_WEEK * WEEKS_PER_YEAR); },
  };
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
          value={Math.round(salary.hourly)}
          oninput={(e) => (salary.hourly = parseFloat(e.target.value) || 0)}
          onkeydown={(e) => e.key === "Enter" && e.target.blur()}
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
          value={Math.round(salary.daily)}
          oninput={(e) => (salary.daily = parseFloat(e.target.value) || 0)}
          onkeydown={(e) => e.key === "Enter" && e.target.blur()}
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
          value={Math.round(salary.weekly)}
          oninput={(e) => (salary.weekly = parseFloat(e.target.value) || 0)}
          onkeydown={(e) => e.key === "Enter" && e.target.blur()}
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
          value={Math.round(salary.biWeekly)}
          oninput={(e) => (salary.biWeekly = parseFloat(e.target.value) || 0)}
          onkeydown={(e) => e.key === "Enter" && e.target.blur()}
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
          value={Math.round(salary.monthly)}
          oninput={(e) => (salary.monthly = parseFloat(e.target.value) || 0)}
          onkeydown={(e) => e.key === "Enter" && e.target.blur()}
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
          value={Math.round(salary.annual)}
          oninput={(e) => (salary.annual = parseFloat(e.target.value) || 0)}
          onkeydown={(e) => e.key === "Enter" && e.target.blur()}
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
    margin-bottom: 2rem;
    text-align: center;
  }

  .grid {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
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
    width: 140px; /* Fixed width for the input container */
    display: flex;
    justify-content: flex-end;
  }

  .input {
    font-family: "JetBrains Mono", "Roboto Mono", "SF Mono", "Fira Code",
      "Fira Mono", "Menlo", monospace;
    font-size: 1.5rem;
    font-weight: 600;
    padding: 0.75rem 0;
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
      padding: 0.5rem 0;
    }
  }
</style>
