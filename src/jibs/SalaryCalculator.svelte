<script>
  const HOURS_PER_DAY = 8;
  const DAYS_PER_WEEK = 5;
  const WEEKS_PER_MONTH = 4 + (1/3); // Approximation
  const WEEKS_PER_YEAR = 52;
  const BI_WEEKLY_WEEKS = 2;
  
  let hourlyRate = $state(20);
  
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
    set annual(value) { hourlyRate = value / (HOURS_PER_DAY * DAYS_PER_WEEK * WEEKS_PER_YEAR); }
  };
  
  // Optionally add formatting helper
  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  }
</script>

<div class="calculator-container">
  <h1 class="calculator-title">Salary Calculator</h1>

  <div class="calculator-grid">
    <!-- Hourly Rate -->
    <input
      type="number"
      id="hourly"
      value={Math.round(salary.hourly)}
      oninput={(e) => salary.hourly = parseFloat(e.target.value) || 0}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
      class="calculator-input calculator-input-number"
    />
    <label for="hourly" class="calculator-label">Hourly</label>

    <!-- Daily Rate -->
    <input
      type="number"
      id="daily"
      value={Math.round(salary.daily)}
      oninput={(e) => salary.daily = parseFloat(e.target.value) || 0}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
      class="calculator-input calculator-input-number"
    />
    <label for="daily" class="calculator-label">Daily</label>

    <!-- Weekly Rate -->
    <input
      type="number"
      id="weekly"
      value={Math.round(salary.weekly)}
      oninput={(e) => salary.weekly = parseFloat(e.target.value) || 0}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
      class="calculator-input calculator-input-number"
    />
    <label for="weekly" class="calculator-label">Weekly</label>
    
    <!-- Bi-Weekly Rate -->
    <input
      type="number"
      id="bi-weekly"
      value={Math.round(salary.biWeekly)}
      oninput={(e) => salary.biWeekly = parseFloat(e.target.value) || 0}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
      class="calculator-input calculator-input-number"
    />
    <label for="bi-weekly" class="calculator-label">Bi-Weekly</label>

    <!-- Monthly Rate -->
    <input
      type="number"
      id="monthly"
      value={Math.round(salary.monthly)}
      oninput={(e) => salary.monthly = parseFloat(e.target.value) || 0}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
      class="calculator-input calculator-input-number"
    />
    <label for="monthly" class="calculator-label">Monthly</label>

    <!-- Annual Rate -->
    <input
      type="number"
      id="annual"
      value={Math.round(salary.annual)}
      oninput={(e) => salary.annual = parseFloat(e.target.value) || 0}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
      class="calculator-input calculator-input-number"
    />
    <label for="annual" class="calculator-label">Annual</label>
  </div>
</div>

<style>
  .calculator-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  .calculator-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    text-align: center;
  }

  .calculator-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem; /* Reduced gap */
    align-items: center;
  }

  .calculator-input {
    font-family: 'JetBrains Mono', 'Roboto Mono', 'SF Mono', 'Fira Code', 'Fira Mono', 'Menlo', monospace;
    font-size: 1.5rem;
    font-weight: 600;
    padding: 0.75rem 0; /* Reduced padding */
    text-align: right;
    background: transparent; /* Transparent background */
    border: none; /* Remove border */
    border-bottom: 2px solid #e5e7eb; /* Add underline */
    transition: all 0.2s ease;
    width: 100%;
    border-radius: 0; /* Remove border radius */
  }

  .calculator-input-number {
    text-align: right;
  }

  .calculator-input:focus {
    outline: none; /* Remove outline */
    border-color: #2563eb; /* Focused underline color */
    box-shadow: none; /* Remove box shadow */
    background: transparent; /* Keep background transparent */
  }

  .calculator-label {
    font-size: 1.125rem;
    font-weight: 500;
    color: #4b5563;
    padding-left: 1rem;
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

  /* Mobile responsive */
  @media (max-width: 640px) {
    .calculator-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .calculator-input {
      font-size: 1.25rem;
      padding: 0.5rem 0; /* Reduced padding */
    }
    
    .calculator-label {
      padding-left: 0;
      text-align: center;
    }
  }
</style>
