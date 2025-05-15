<script>
  // Unix timestamp to date converter
  let unixTime = $state(Math.floor(Date.now() / 1000)); // Current Unix timestamp

  // Derived date from Unix timestamp
  let date = $derived(new Date(unixTime * 1000));

  // ISO date (YYYY-MM-DD)
  let isoDate = $derived(
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  );

  // 24-hour time (HH:mm:ss)
  let hour24 = $derived(String(date.getHours()).padStart(2, '0'));
  let minute = $derived(String(date.getMinutes()).padStart(2, '0'));
  let second = $derived(String(date.getSeconds()).padStart(2, '0'));

  // 12-hour time (h:mm AM/PM)
  let hour12 = $derived.by(() => {
    let h = date.getHours();
    return ((h % 12) || 12) + ':' + minute + ' ' + (h < 12 ? 'AM' : 'PM');
  });

  // Month name, day, weekday
  let monthDayWeek = $derived.by(() => {
    const month = date.toLocaleString('en-US', { month: 'long' });
    const day = date.getDate();
    const weekday = date.toLocaleString('en-US', { weekday: 'long' });
    return `${month} ${day} ${weekday}`;
  });

  // Add a more readable weekday, month, day, year string
  let fullDate = $derived.by(() =>
    date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  );

  // List of timestamps (each: { unixTime, ms, date })
  let times = $state([]);

  // Track which timestamp is selected for the big display
  let selectedIdx = $state(0);

  // Add a new timestamp to the list, dedup by ms
  function addTime(raw) {
    let num = Number(raw);
    if (!Number.isFinite(num)) return;
    // Accept ms or s: if > 1e12 treat as ms, else s
    let ms = num > 1e12 || (num > 1e10 && num < 1e13) ? num : num * 1000;
    // Only add if not already present
    if (!times.some(t => t.ms === ms)) {
      times = [{ unixTime: Math.floor(ms / 1000), ms, date: new Date(ms) }, ...times];
    }
    // Always update the main input to the latest
    unixTime = Math.floor(ms / 1000);
  }

  function setCurrentTime() {
    addTime(Math.floor(Date.now() / 1000));
  }

  // When a row is clicked, set selectedIdx and update unixTime
  function selectTime(idx) {
    selectedIdx = idx;
    unixTime = times[idx]?.unixTime ?? unixTime;
  }

  // When a new time is added, always select it
  $effect(() => {
    if (times.length && selectedIdx !== 0) {
      selectedIdx = 0;
    }
  });

  // Handle paste anywhere: extract all numbers and add each
  function handlePaste(e) {
    let text = (e.clipboardData || window.clipboardData).getData('text');
    let matches = text.match(/\d{6,}/g); // all 6+ digit numbers
    if (matches) {
      matches.forEach(addTime);
    }
    // Prevent default paste into input
    e.preventDefault();
  }

  // Handle paste on the input: extract all numbers and add each, set input to last match
  function handleInputPaste(e) {
    let text = (e.clipboardData || window.clipboardData).getData('text');
    let matches = text.match(/\d{6,}/g);
    if (matches && matches.length) {
      matches.forEach(addTime);
      // Use ms/s logic for last match
      let last = Number(matches[matches.length - 1]);
      let ms = last > 1e12 || (last > 1e10 && last < 1e13) ? last : last * 1000;
      unixTime = Math.floor(ms / 1000);
      e.preventDefault();
    }
  }

  // Handle paste anywhere: extract all numbers and add each, set input to last match
  function handleAnyPaste(e) {
    let text = (e.clipboardData || window.clipboardData).getData('text');
    let matches = text.match(/\d{6,}/g);
    if (matches && matches.length) {
      matches.forEach(addTime);
      let last = Number(matches[matches.length - 1]);
      let ms = last > 1e12 || (last > 1e10 && last < 1e13) ? last : last * 1000;
      unixTime = Math.floor(ms / 1000);
      e.preventDefault();
    }
  }

  // Add from input (on blur or enter)
  function handleInputAdd() {
    addTime(unixTime);
  }

  // Attach paste handler on mount
  $effect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  });

  // Attach global paste handler on mount
  $effect(() => {
    window.addEventListener('paste', handleAnyPaste);
    return () => window.removeEventListener('paste', handleAnyPaste);
  });

  // Remove formatRow, add helpers for each part of the date/time
  function getYear(d) { return d.getFullYear(); }
  function getMonth(d) { return String(d.getMonth() + 1).padStart(2, '0'); }
  function getDay(d) { return String(d.getDate()).padStart(2, '0'); }
  function getHour(d) { return String(d.getHours()).padStart(2, '0'); }
  function getMinute(d) { return String(d.getMinutes()).padStart(2, '0'); }
  function getSecond(d) { return String(d.getSeconds()).padStart(2, '0'); }
  function getWeekdayShort(d) { return d.toLocaleString('en-US', { weekday: 'short' }); }

  /**
   * Wrap trailing zeros in a <span class="grey0">...</span>
   * Only for numbers with at least one trailing zero.
   */
  function highlightTrailingZeros(str) {
    // Find trailing zeros (after a digit)
    // e.g. 1716500000 -> 17165<span class="grey0">00000</span>
    //      1716500000123 -> 1716500000123 (no highlight)
    //      1716500000 -> 17165<span class="grey0">00000</span>
    //      171650000 -> 17165<span class="grey0">0000</span>
    //      1716501234 -> 1716501234
    // Only highlight if at least 3 trailing zeros
    let match = str.match(/^(.*?)(0{3,})$/);
    if (match) {
      return (
        escapeHtml(match[1]) +
        `<span class="grey0">${escapeHtml(match[2])}</span>`
      );
    }
    return escapeHtml(str);
  }

  /**
   * Splits a string into [head, trailingZeros] where trailingZeros is a run of 3+ zeros at the end.
   * Returns [head, zeros] (zeros may be empty string).
   */
  function splitTrailingZeros(str) {
    let match = str.match(/^(.*?)(0{3,})$/);
    if (match) {
      return [match[1], match[2]];
    }
    return [str, ""];
  }

  // Escape HTML for safety
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }
</script>

<div class="container">
  <h1 class="title">Unix Timestamp Converter</h1>
  <div class="mb-6">
    <label for="unix-time" class="label">Unix Timestamp:</label>
    <input
      id="unix-time"
      type="number"
      bind:value={unixTime}
      class="timestamp-input"
      autocomplete="off"
      inputmode="numeric"
      spellcheck="false"
      placeholder="Enter unix timestamp"
      onblur={handleInputAdd}
      onkeydown={e => { if (e.key === 'Enter') handleInputAdd(); }}
    />
    <div class="btn-row">
      <button 
        onclick={setCurrentTime}
        class="set-btn"
        type="button"
      >
        Set Current Time
      </button>
    </div>
  </div>

  {#if times.length > 0}
    <div class="list-table">
      <div class="list-header">
        <span class="list-col list-circle"></span>
        <span class="list-col list-ts">Timestamp</span>
        <span class="list-col list-date">Date</span>
      </div>
      {#each times as t, i}
        <div class="list-row {i === selectedIdx ? 'latest' : ''}">
          <span class="list-col list-circle">
            <span
              class="circle {i === selectedIdx ? 'selected' : ''}"
              onclick={() => selectTime(i)}
              tabindex="0"
              aria-label="Select timestamp"
              role="button"
            ></span>
          </span>
          <span class="list-col list-ts">
            {#key t.ms}
              {#if splitTrailingZeros(t.ms > 1e12 ? String(t.ms) : String(t.unixTime))[1]}
                <span style="letter-spacing:0">
                  {splitTrailingZeros(t.ms > 1e12 ? String(t.ms) : String(t.unixTime))[0]}<span class="grey0 thin0">{splitTrailingZeros(t.ms > 1e12 ? String(t.ms) : String(t.unixTime))[1]}</span>
                </span>
              {:else}
                {splitTrailingZeros(t.ms > 1e12 ? String(t.ms) : String(t.unixTime))[0]}
              {/if}
            {/key}
          </span>
          <span class="list-col list-date-sep"></span>
          <span class="list-col list-date">
            <span class="date-part">{getYear(t.date)}<span class="grey0 thin0">-</span></span>
            <span class="date-part">{getMonth(t.date)}<span class="grey0 thin0">-</span></span>
            <span class="date-part">{getDay(t.date)}</span>
            <span class="date-part">&nbsp;</span>
            <span class="time-part compact-time">
              {getHour(t.date)}
              <span class="compact-space"></span>
              {getMinute(t.date)}
              <span class="compact-space"></span>
              <span class="grey0 thin0">{getSecond(t.date)}</span>
            </span>
            <span class="date-part">&nbsp;</span>
            <span class="weekday-part">{getWeekdayShort(t.date)}</span>
          </span>
        </div>
      {/each}
    </div>
  {/if}

  <div class="main-display">
    <div>
      <span class="iso">{isoDate}</span>
    </div>
    <div>
      <span class="time24">{hour24}:{minute}</span>
      <span class="sec">:{second}</span>
    </div>
    <div>
      <span class="time12">{hour12}</span>
    </div>
    <div>
      <span class="monthday">{monthDayWeek}</span>
    </div>
    <div>
      <span class="fulldate">{fullDate}</span>
    </div>
  </div>
</div>

<style>
  :global(body) {
    background: #fff;
    color: #18181b;
    font-family: 'Inter', 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
    margin: 0;
    padding: 0;
  }

  .container {
    max-width: 100vw;
    margin: 0 auto;
    padding: 2.5rem 1.2rem 1.5rem 1.2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .title {
    font-size: 2.3rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    margin-bottom: 2.2rem;
    text-align: center;
    color: #222;
  }

  .label {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    display: block;
    font-weight: 500;
    color: #444;
    text-align: center;
  }

  .timestamp-input {
    width: 100%;
    max-width: 420px;
    font-size: 2.2rem;
    padding: 0.7em 0.7em;
    border: 1.5px solid #e5e7eb;
    border-radius: 0.7em;
    outline: none;
    font-family: inherit;
    margin-bottom: 0.5em;
    background: #fafbfc;
    transition: border 0.15s;
    text-align: center;
    box-sizing: border-box;
  }
  .timestamp-input:focus {
    border-color: #007aff;
    background: #fff;
  }

  .btn-row {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 0.7em;
  }

  .set-btn {
    background: #007aff;
    color: #fff;
    border: none;
    border-radius: 0.5em;
    padding: 0.55em 1.3em;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, box-shadow 0.15s;
    box-shadow: 0 1px 4px 0 rgba(0,0,0,0.03);
    outline: none;
    margin: 0 auto;
    display: block;
  }
  .set-btn:hover, .set-btn:focus {
    background: #005fcc;
    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.07);
  }

  .main-display {
    width: 100vw;
    max-width: 100vw;
    min-height: 40vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 0.5em;
    margin-top: 2.5rem;
  }

  .iso {
    font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 4.2rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    color: #18181b;
    display: block;
    margin-bottom: 0.1em;
    text-align: center;
  }

  .time24 {
    font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 3.2rem;
    font-weight: 600;
    color: #007aff;
    letter-spacing: 0.01em;
    text-align: center;
  }
  .sec {
    font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 2rem;
    color: #bdbdbd;
    vertical-align: super;
    margin-left: 0.1em;
  }

  .time12 {
    font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 2rem;
    color: #444;
    margin-top: 0.1em;
    display: block;
    text-align: center;
  }

  .monthday {
    font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 2rem;
    color: #666;
    margin-top: 0.1em;
    display: block;
    text-align: center;
  }

  .fulldate {
    font-size: 1.2rem;
    color: #bdbdbd;
    margin-top: 0.2em;
    display: block;
    font-family: inherit;
    text-align: center;
  }

  .list-table {
    width: 100%;
    max-width: 600px;
    margin: 2rem auto 1.5rem auto;
    font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 1.1rem;
    border-collapse: collapse;
  }
  .list-header {
    display: flex;
    font-weight: 700;
    color: #888;
    border-bottom: 1.5px solid #eee;
    margin-bottom: 0.2em;
    font-size: 1.05em;
    letter-spacing: 0.01em;
  }
  .list-col.list-circle {
    width: 2.2em;
    min-width: 2.2em;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-right: 0.1em;
  }
  .list-row {
    display: flex;
    border-bottom: 1px solid #f2f2f2;
    padding: 0.2em 0;
    align-items: center;
    transition: background 0.15s;
  }
  .list-row.latest {
    background: #f0f8ff;
    font-weight: 700;
  }
  .circle {
    display: inline-block;
    width: 1.2em;
    height: 1.2em;
    border-radius: 50%;
    border: 2px solid #bbb;
    background: #fff;
    margin-right: 0.2em;
    cursor: pointer;
    transition: border 0.15s, box-shadow 0.15s, background 0.15s;
    box-sizing: border-box;
    vertical-align: middle;
  }
  .circle.selected {
    border: 2.5px solid #007aff;
    background: #007aff;
    box-shadow: 0 0 0 2px #e6f0ff;
  }
  .circle:focus {
    outline: 2px solid #007aff;
    outline-offset: 1px;
  }
  .list-ts {
    min-width: 120px;
    color: #007aff;
    font-weight: 600;
    font-size: 1.08em;
  }
  .list-date {
    flex: 1;
    color: #222;
    font-size: 1.08em;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 0.1em;
    white-space: nowrap;
  }
  .list-col.list-ts span[style] {
    letter-spacing: 0;
    word-spacing: 0;
  }
  .grey0 {
    color: #bdbdbd;
    letter-spacing: 0;
    word-spacing: 0;
  }
  .thin0 {
    font-variation-settings: "wght" 300;
    font-weight: 300;
    font-stretch: 90%;
    font-size: 0.95em;
  }
  .time-part .grey0.thin0 {
    font-size: 0.97em;
    font-weight: 350;
    vertical-align: baseline;
  }
  .list-col.list-date-sep {
    width: 2.2em;
    min-width: 2.2em;
    display: flex;
    align-items: center;
    justify-content: center;
    /* vertical separator */
    border-left: 1.5px solid #eee;
    height: 1.5em;
    margin: 0 0.2em;
    content: "";
  }
  .date-part {
    font-family: inherit;
    color: #444;
  }
  .time-part {
    font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
    color: #007aff;
    font-weight: 600;
    font-size: 1em;
  }
  .time-part.compact-time {
    display: inline-flex;
    align-items: center;
    gap: 0.18em;
  }
  .compact-space {
    display: inline-block;
    width: 0.18em;
  }
  .weekday-part {
    color: #888;
    font-family: inherit;
    font-size: 0.98em;
    margin-left: 0.2em;
  }

  @media (max-width: 640px) {
    .container {
      padding: 1.2rem 0.5rem 1rem 0.5rem;
    }
    .iso {
      font-size: 2.1rem;
    }
    .main-display {
      margin-top: 1.2rem;
    }
    .time24 {
      font-size: 1.5rem;
    }
    .monthday, .time12 {
      font-size: 1.1rem;
    }
  }
</style>