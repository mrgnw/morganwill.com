<script>
  // Constants for rate calculations
  const hoursPerDay = 8;
  const daysPerWeek = 5;
  const weeksPerMonth = 4 + (1/3); // Approximation
  const weeksPerYear = 52;
  const biWeeklyWeeks = 2;

  // The hourly rate is our source of truth
  let hourlyRate = $state(20);
  
  // Derived values for display
  let dailyRate = $derived(hourlyRate * hoursPerDay);
  let weeklyRate = $derived(dailyRate * daysPerWeek);
  let biWeeklyRate = $derived(weeklyRate * biWeeklyWeeks);
  let monthlyRate = $derived(weeklyRate * weeksPerMonth);
  let annualRate = $derived(weeklyRate * weeksPerYear);

  // Update functions for each rate type
  function updateFromHourly(value) {
    if (!isNaN(value)) hourlyRate = value;
  }
  
  function updateFromDaily(value) {
    if (!isNaN(value)) hourlyRate = value / hoursPerDay;
  }
  
  function updateFromWeekly(value) {
    if (!isNaN(value)) hourlyRate = value / (hoursPerDay * daysPerWeek);
  }
  
  function updateFromBiWeekly(value) {
    if (!isNaN(value)) hourlyRate = value / (hoursPerDay * daysPerWeek * biWeeklyWeeks);
  }
  
  function updateFromMonthly(value) {
    if (!isNaN(value)) hourlyRate = value / (hoursPerDay * daysPerWeek * weeksPerMonth);
  }
  
  function updateFromAnnual(value) {
    if (!isNaN(value)) hourlyRate = value / (hoursPerDay * daysPerWeek * weeksPerYear);
  }
</script>

<div class="salary-calculator">
  <h2>Salary Calculator</h2>

  <div class="input-group">
    <label for="hourly">Hourly Rate:</label>
    <input type="number" id="hourly" value={hourlyRate.toFixed(2)} oninput={(e) => updateFromHourly(parseFloat(e.target.value))} step="0.01">
  </div>

  <div class="input-group">
    <label for="daily">Daily Rate:</label>
    <input type="number" id="daily" value={dailyRate.toFixed(2)} oninput={(e) => updateFromDaily(parseFloat(e.target.value))} step="0.01">
  </div>

  <div class="input-group">
    <label for="weekly">Weekly Rate:</label>
    <input type="number" id="weekly" value={weeklyRate.toFixed(2)} oninput={(e) => updateFromWeekly(parseFloat(e.target.value))} step="0.01">
  </div>
  
  <div class="input-group">
    <label for="bi-weekly">Bi-Weekly Rate:</label>
    <input type="number" id="bi-weekly" value={biWeeklyRate.toFixed(2)} oninput={(e) => updateFromBiWeekly(parseFloat(e.target.value))} step="0.01">
  </div>

  <div class="input-group">
    <label for="monthly">Monthly Rate:</label>
    <input type="number" id="monthly" value={monthlyRate.toFixed(2)} oninput={(e) => updateFromMonthly(parseFloat(e.target.value))} step="0.01">
  </div>

  <div class="input-group">
    <label for="annual">Annual Rate:</label>
    <input type="number" id="annual" value={annualRate.toFixed(2)} oninput={(e) => updateFromAnnual(parseFloat(e.target.value))} step="0.01">
  </div>
</div>

<style>
  .salary-calculator {
    padding: 20px;
    font-family: sans-serif;
    max-width: 500px;
    margin: 0 auto;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h2 {
    margin-top: 0;
    color: #333;
    margin-bottom: 1rem;
    text-align: center;
  }

  .input-group {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
  }

  label {
    display: inline-block;
    width: 150px;
    text-align: right;
    margin-right: 10px;
  }

  input[type="number"] {
    width: 150px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  input:focus {
    border-color: #4a6dff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(74, 109, 255, 0.2);
  }
</style>
