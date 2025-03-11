<script>
  class SalaryCalculator {
    // Constants for rate calculations
    static hoursPerDay = 8;
    static daysPerWeek = 5;
    static weeksPerMonth = 4 + (1/3); // Approximation
    static weeksPerYear = 52;
    static biWeeklyWeeks = 2;
    
    // Base rate (our source of truth)
    hourlyRate = $state(20);
    
    // Derived rates using $derived
    dailyRate = $derived(this.hourlyRate * SalaryCalculator.hoursPerDay);
    weeklyRate = $derived(this.dailyRate * SalaryCalculator.daysPerWeek);
    biWeeklyRate = $derived(this.weeklyRate * SalaryCalculator.biWeeklyWeeks);
    monthlyRate = $derived(this.weeklyRate * SalaryCalculator.weeksPerMonth);
    annualRate = $derived(this.weeklyRate * SalaryCalculator.weeksPerYear);
    
    // Formatted values for display
    hourlyFormatted = $derived(Math.round(this.hourlyRate).toString());
    dailyFormatted = $derived(Math.round(this.dailyRate).toString());
    weeklyFormatted = $derived(Math.round(this.weeklyRate).toString());
    biWeeklyFormatted = $derived(Math.round(this.biWeeklyRate).toString());
    monthlyFormatted = $derived(Math.round(this.monthlyRate).toString());
    annualFormatted = $derived(Math.round(this.annualRate).toString());
    
    constructor(initialHourlyRate = 20) {
      this.hourlyRate = initialHourlyRate;
    }
    
    updateFromField(field, value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return;
      
      switch(field) {
        case 'hourly':
          this.hourlyRate = numValue;
          break;
        case 'daily':
          this.hourlyRate = numValue / SalaryCalculator.hoursPerDay;
          break;
        case 'weekly':
          this.hourlyRate = numValue / (SalaryCalculator.hoursPerDay * SalaryCalculator.daysPerWeek);
          break;
        case 'biWeekly':
          this.hourlyRate = numValue / (SalaryCalculator.hoursPerDay * SalaryCalculator.daysPerWeek * SalaryCalculator.biWeeklyWeeks);
          break;
        case 'monthly':
          this.hourlyRate = numValue / (SalaryCalculator.hoursPerDay * SalaryCalculator.daysPerWeek * SalaryCalculator.weeksPerMonth);
          break;
        case 'annual':
          this.hourlyRate = numValue / (SalaryCalculator.hoursPerDay * SalaryCalculator.daysPerWeek * SalaryCalculator.weeksPerYear);
          break;
      }
    }
  }
  
  // Create a calculator instance
  const calculator = new SalaryCalculator();
  
  // Track which field is currently being edited
  let editingField = $state(null);
  
  // Handle input events
  function startEditing(field) {
    editingField = field;
  }
  
  function finishEditing(field, value) {
    calculator.updateFromField(field, value);
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
      value={calculator.hourlyFormatted}
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
      value={calculator.dailyFormatted}
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
      value={calculator.weeklyFormatted}
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
      value={calculator.biWeeklyFormatted}
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
      value={calculator.monthlyFormatted}
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
      value={calculator.annualFormatted}
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
