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

<div class="salary-calculator">
  <h2>Salary Calculator</h2>

  <div class="input-group">
    <label for="hourly">Hourly Rate:</label>
    <input 
      type="number" 
      id="hourly" 
      value={hourlyInput}
      onfocus={() => startEditing('hourly')}
      onblur={(e) => finishEditing('hourly', e.target.value)}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
    >
  </div>

  <div class="input-group">
    <label for="daily">Daily Rate:</label>
    <input 
      type="number" 
      id="daily" 
      value={dailyInput}
      onfocus={() => startEditing('daily')}
      onblur={(e) => finishEditing('daily', e.target.value)}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
    >
  </div>

  <div class="input-group">
    <label for="weekly">Weekly Rate:</label>
    <input 
      type="number" 
      id="weekly" 
      value={weeklyInput}
      onfocus={() => startEditing('weekly')}
      onblur={(e) => finishEditing('weekly', e.target.value)}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
    >
  </div>
  
  <div class="input-group">
    <label for="bi-weekly">Bi-Weekly Rate:</label>
    <input 
      type="number" 
      id="bi-weekly" 
      value={biWeeklyInput}
      onfocus={() => startEditing('biWeekly')}
      onblur={(e) => finishEditing('biWeekly', e.target.value)}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
    >
  </div>

  <div class="input-group">
    <label for="monthly">Monthly Rate:</label>
    <input 
      type="number" 
      id="monthly" 
      value={monthlyInput}
      onfocus={() => startEditing('monthly')}
      onblur={(e) => finishEditing('monthly', e.target.value)}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
    >
  </div>

  <div class="input-group">
    <label for="annual">Annual Rate:</label>
    <input 
      type="number" 
      id="annual" 
      value={annualInput}
      onfocus={() => startEditing('annual')}
      onblur={(e) => finishEditing('annual', e.target.value)}
      onkeydown={(e) => e.key === 'Enter' && e.target.blur()}
      step="1"
    >
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
