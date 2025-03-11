<script>

  // Constants for rate calculations
  const hoursPerDay = 8;
  const daysPerWeek = 5;
  const weeksPerMonth = 4 + (1/3); // Approximation
  const weeksPerYear = 52;
  const biWeeklyWeeks = 2;

  // Track which field is currently being edited
  let editingField = $state(null);
  
  // Input values (separate from calculation values)
  let hourlyInput = $state("20");
  let dailyInput = $state("160");
  let weeklyInput = $state("800");
  let biWeeklyInput = $state("1600");
  let monthlyInput = $state("3467");
  let annualInput = $state("41600");

  // The hourly rate is our source of truth for calculations
  let hourlyRate = $state(20);
  
  // Derived values for calculations
  let dailyRate = $derived(hourlyRate * hoursPerDay);
  let weeklyRate = $derived(dailyRate * daysPerWeek);
  let biWeeklyRate = $derived(weeklyRate * biWeeklyWeeks);
  let monthlyRate = $derived(weeklyRate * weeksPerMonth);
  let annualRate = $derived(weeklyRate * weeksPerYear);

  // Update displayed input values when not being edited
  $effect(() => {
    if (editingField !== 'hourly') hourlyInput = Math.round(hourlyRate).toString();
    if (editingField !== 'daily') dailyInput = Math.round(dailyRate).toString();
    if (editingField !== 'weekly') weeklyInput = Math.round(weeklyRate).toString();
    if (editingField !== 'biWeekly') biWeeklyInput = Math.round(biWeeklyRate).toString();
    if (editingField !== 'monthly') monthlyInput = Math.round(monthlyRate).toString();
    if (editingField !== 'annual') annualInput = Math.round(annualRate).toString();
  });

  // Handle input events
  function startEditing(field) {
    editingField = field;
  }
  
  function finishEditing(field, value) {
    const parsedValue = parseInt(value, 10);
    if (!isNaN(parsedValue)) {
      switch (field) {
        case 'hourly':
          hourlyRate = parsedValue;
          break;
        case 'daily':
          hourlyRate = parsedValue / hoursPerDay;
          break;
        case 'weekly':
          hourlyRate = parsedValue / (hoursPerDay * daysPerWeek);
          break;
        case 'biWeekly':
          hourlyRate = parsedValue / (hoursPerDay * daysPerWeek * biWeeklyWeeks);
          break;
        case 'monthly':
          hourlyRate = parsedValue / (hoursPerDay * daysPerWeek * weeksPerMonth);
          break;
        case 'annual':
          hourlyRate = parsedValue / (hoursPerDay * daysPerWeek * weeksPerYear);
          break;
      }
    }
    editingField = null;
  }
</script>

<div class="calculator-container">
  <h1 class="calculator-title">Salary Calculator</h1>

  <div class="calculator-grid">
    <!-- Hourly Rate -->
    <input
      type="number"
      id="hourly"
      value={hourlyInput}
      onfocus={() => startEditing('hourly')}
      onblur={(e) => finishEditing('hourly', e.target.value)}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
      class="calculator-input calculator-input-number"
    />
    <label for="hourly" class="calculator-label">Hourly</label>

    <!-- Daily Rate -->
    <input
      type="number"
      id="daily"
      value={dailyInput}
      onfocus={() => startEditing('daily')}
      onblur={(e) => finishEditing('daily', e.target.value)}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
      class="calculator-input calculator-input-number"
    />
    <label for="daily" class="calculator-label">Daily</label>

    <!-- Weekly Rate -->
    <input
      type="number"
      id="weekly"
      value={weeklyInput}
      onfocus={() => startEditing('weekly')}
      onblur={(e) => finishEditing('weekly', e.target.value)}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
      class="calculator-input calculator-input-number"
    />
    <label for="weekly" class="calculator-label">Weekly</label>
    
    <!-- Bi-Weekly Rate -->
    <input
      type="number"
      id="bi-weekly"
      value={biWeeklyInput}
      onfocus={() => startEditing('biWeekly')}
      onblur={(e) => finishEditing('biWeekly', e.target.value)}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
      class="calculator-input calculator-input-number"
    />
    <label for="bi-weekly" class="calculator-label">Bi-Weekly</label>

    <!-- Monthly Rate -->
    <input
      type="number"
      id="monthly"
      value={monthlyInput}
      onfocus={() => startEditing('monthly')}
      onblur={(e) => finishEditing('monthly', e.target.value)}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
      class="calculator-input calculator-input-number"
    />
    <label for="monthly" class="calculator-label">Monthly</label>

    <!-- Annual Rate -->
    <input
      type="number"
      id="annual"
      value={annualInput}
      onfocus={() => startEditing('annual')}
      onblur={(e) => finishEditing('annual', e.target.value)}
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
    gap: 1.5rem;
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
