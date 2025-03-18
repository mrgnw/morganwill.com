<script>
  import { fade } from "svelte/transition";
  let hourlyRate = $state(70);
  let selected_units = $state(['hour', 'day', 'week', 'month', 'year']); // Default selection

  // Define units in order from smallest to largest for range selection
  const orderedUnitKeys = ['second', 'minute', 'hour', 'day', 'week', 'biweekly', 'month', 'year'];
  
  const timeUnits = {
    second: 1 / 3600,
    minute: 1 / 60,
    hour: 1,
    day: 8,
    week: 8 * 5,
    biweekly: 8 * 5 * 2,
    month: 8 * 5 * (52 / 12),
    year: 8 * 5 * 52,
  };
  const thresholds = { week: 10, month: 20, year: 1000 };
  const onkeydown = (e) => e.key === "Enter" && e.target.blur();

  // Unit selection state
  let isDragging = $state(false);
  let dragStart = $state(null);
  let dragEnd = $state(null);
  let hasMoved = $state(false);  // Track if mouse has moved during drag
  let shiftClickAnchor = $state(null);

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

  function toggleRange(startIndex, endIndex) {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    const unitsInRange = orderedUnitKeys.slice(start, end + 1);
    
    // Check if all units in range are already selected
    const allSelected = unitsInRange.every(unit => selected_units.includes(unit));
    
    if (allSelected) {
      // If all selected, deselect them (but prevent removing all units)
      const remainingUnits = selected_units.filter(unit => !unitsInRange.includes(unit));
      if (remainingUnits.length > 0) {
        selected_units = remainingUnits;
      }
    } else {
      // If not all selected, select all in range
      const newSelected = [...new Set([...selected_units, ...unitsInRange])];
      selected_units = newSelected;
    }
  }

  function handleUnitClick(e, index) {
    // Only handle click if we weren't dragging
    if (!hasMoved) {
      if (e.shiftKey && shiftClickAnchor !== null) {
        // Shift+click functionality
        toggleRange(shiftClickAnchor, index);
        shiftClickAnchor = null;
      } else {
        // Normal click functionality
        toggleUnit(orderedUnitKeys[index]);
        shiftClickAnchor = index;
      }
    }
  }

  function handleMouseDown(e, index) {
    if (e.button === 0) { // Only for left clicks
      isDragging = true;
      hasMoved = false; // Reset movement tracking
      dragStart = index;
      dragEnd = index;
    }
  }

  function handleMouseMove(index) {
    if (isDragging && dragEnd !== index) {
      hasMoved = true;
      dragEnd = index;
    }
  }

  function handleMouseUp() {
    if (isDragging) {
      if (hasMoved) {
        toggleRange(dragStart, dragEnd);
      }
      isDragging = false;
      hasMoved = false;
    }
  }

  function handleTouchStart(e, index) {
    isDragging = true;
    hasMoved = false;
    dragStart = index;
    dragEnd = index;
  }

  function handleTouchMove(e) {
    if (isDragging) {
      const touch = e.touches[0];
      const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
      const unitItem = elements.find(el => el.classList.contains('unit-item'));
      if (unitItem) {
        const index = Array.from(unitItem.parentElement.children).indexOf(unitItem);
        if (index !== -1 && dragEnd !== index) {
          hasMoved = true;
          dragEnd = index;
        }
      }
    }
  }

  function handleTouchEnd() {
    if (isDragging) {
      if (hasMoved) {
        toggleRange(dragStart, dragEnd);
      }
      isDragging = false;
      hasMoved = false;
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

  <div class="content-layout">
    <!-- Vertical Unit Selector Sidebar -->
    <div class="sidebar">
      <h2>Select Units</h2>
      <div class="unit-selector-sidebar">
        {#each orderedUnitKeys as unit, i}
          <div 
            class="unit-item {selected_units.includes(unit) ? 'active' : ''} {isDragging && i >= Math.min(dragStart, dragEnd) && i <= Math.max(dragStart, dragEnd) ? 'dragging' : ''}"
            onmousedown={(e) => handleMouseDown(e, i)}
            onmousemove={() => handleMouseMove(i)}
            onmouseup={() => handleMouseUp()}
            onclick={(e) => handleUnitClick(e, i)}
            ontouchstart={(e) => handleTouchStart(e, i)}
            ontouchmove={(e) => handleTouchMove(e)}
            ontouchend={() => handleTouchEnd()}
          >
            {unit === "biweekly" ? "2 weeks" : unit}
          </div>
        {/each}
      </div>
      
      <div class="selection-help">
        <p>Click to toggle units, or:</p>
        <ul>
          <li>Click and drag to select multiple units</li>
          <li>Click one unit, then Shift+click another to select a range</li>
        </ul>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
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
  </div>
</div>

<style>
  .container {
    max-width: 650px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  .title {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .content-layout {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .sidebar {
    width: 180px;
    flex-shrink: 0;
  }

  .main-content {
    flex-grow: 1;
    min-width: 0;
  }

  .sidebar h2 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    text-align: center;
  }

  /* Vertical Unit Selector Sidebar */
  .unit-selector-sidebar {
    display: flex;
    flex-direction: column;
    background-color: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    margin-bottom: 0.5rem;
    overflow: hidden;
  }

  .unit-item {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
    font-size: 1rem;
  }

  .unit-item:last-child {
    border-bottom: none;
  }

  .unit-item.active {
    background-color: #2563eb;
    color: white;
  }

  .unit-item.dragging:not(.active) {
    background-color: #dbeafe;
  }

  .unit-item:hover:not(.active):not(.dragging) {
    background-color: #f3f4f6;
  }

  .selection-help {
    font-size: 0.875rem;
    color: #6b7280;
    text-align: left;
  }

  .selection-help p {
    margin-bottom: 0.25rem;
  }

  .selection-help ul {
    margin: 0;
    padding-left: 1.25rem;
  }

  .selection-help li {
    margin-bottom: 0.25rem;
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
    margin: 0 auto 0.5rem;
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
    margin-top: 1.5rem;
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

  .currency-button:disabled {
    opacity: 0;
    cursor: not-allowed;
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
    .content-layout {
      flex-direction: column;
    }
    
    .sidebar {
      width: 100%;
      margin-bottom: 1.5rem;
    }
    
    .unit-selector-sidebar {
      max-width: none;
    }
    
    .input-group {
      justify-content: flex-end;
    }

    .currency-converter {
      flex-direction: row;
      justify-content: center;
    }
  }
</style>
