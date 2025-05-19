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

  // DateRow class encapsulates all formatting and logic for a timestamp row
  class DateRow {
    constructor(raw) {
      this.raw = raw;
      this.num = Number(raw);
      // Accept ms or s: if > 1e12 treat as ms, else s
      this.ms = this.num > 1e12 || (this.num > 1e10 && this.num < 1e13) ? this.num : this.num * 1000;
      this.unixTime = Math.floor(this.ms / 1000);
      this.date = new Date(this.ms);
      this.twelveHour = false;
    }
    get headAndZeros() {
      const str = this.ms > 1e12 ? String(this.ms) : String(this.unixTime);
      let match = str.match(/^(.*?)(0{3,})$/);
      if (match) return [match[1], match[2]];
      return [str, ""];
    }
    get year() { return this.date.getFullYear(); }
    get month() { return String(this.date.getMonth() + 1).padStart(2, '0'); }
    get day() { return String(this.date.getDate()).padStart(2, '0'); }
    get hour24() { return String(this.date.getHours()).padStart(2, '0'); }
    get minute() { return String(this.date.getMinutes()).padStart(2, '0'); }
    get second() { return String(this.date.getSeconds()).padStart(2, '0'); }
    get hour12() {
      let h = this.date.getHours();
      return String((h % 12) || 12).padStart(2, '0');
    }
    get ampm() { return this.date.getHours() < 12 ? "AM" : "PM"; }
    get weekdayShort() { return this.date.toLocaleString('en-US', { weekday: 'short' }); }
  }

  // List of DateRow objects
  let times = $state([]);

  // Add a new timestamp to the list, dedup by ms
  function addTime(raw) {
    let row = new DateRow(raw);
    if (!Number.isFinite(row.num)) return;
    if (!times.some(t => t.ms === row.ms)) {
      times = [row, ...times];
    }
    unixTime = row.unixTime;
  }

  function setCurrentTime() {
    addTime(Math.floor(Date.now() / 1000));
  }

  // Toggle 12h/24h for a row (class-based)
  function toggleHourMode(row) {
    row.twelveHour = !row.twelveHour;
    // force reactivity
    times = [...times];
  }

  // Copy timestamp to clipboard
  function copyTimestamp(ts) {
    navigator.clipboard.writeText(ts + "");
  }

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
      let last = new DateRow(matches[matches.length - 1]);
      unixTime = last.unixTime;
      e.preventDefault();
    }
  }

  // Handle paste anywhere: extract all numbers and add each, set input to last match
  function handleAnyPaste(e) {
    let text = (e.clipboardData || window.clipboardData).getData('text');
    let matches = text.match(/\d{6,}/g);
    if (matches && matches.length) {
      matches.forEach(addTime);
      let last = new DateRow(matches[matches.length - 1]);
      unixTime = last.unixTime;
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

  // Track which timestamps are in 12h mode (by ms)
  let twelveHour = $state({});

  

  // --- Add derived values for each row ---
  function getHour24(date) {
    return String(date.getHours()).padStart(2, '0');
  }
  
  function getHour12(date) {
    let h = date.getHours();
    return String((h % 12) || 12).padStart(2, '0');
  }
  function getAmPm(date) {
    return date.getHours() < 12 ? "AM" : "PM";
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
        <span class="list-col list-ts">Timestamp</span>
        <span class="list-col list-date">Date</span>
      </div>
      {#each times as row}
        <div class="list-row">
          <span class="list-col list-ts ts-cell" onclick={() => toggleHourMode(row)}>
            {#key row.ms}
              {#if row.headAndZeros[1]}
                <span style="letter-spacing:0">
                  {row.headAndZeros[0]}<span class="grey0 thin0">{row.headAndZeros[1]}</span>
                </span>
              {:else}
                {row.headAndZeros[0]}
              {/if}
            {/key}
            <span class="copy-icon" onclick={e => { e.stopPropagation(); copyTimestamp(row.ms > 1e12 ? row.ms : row.unixTime); }} title="Copy timestamp">
              <svg width="1.1em" height="1.1em" viewBox="0 0 20 20" fill="none" style="vertical-align:middle;">
                <rect x="6" y="6" width="9" height="9" rx="2" fill="#bdbdbd"/>
                <rect x="3" y="3" width="9" height="9" rx="2" stroke="#bdbdbd" stroke-width="2" fill="none"/>
              </svg>
            </span>
          </span>
          <span class="list-col list-date-sep"></span>
          <span class="list-col list-date">
            <span class="date-part">{row.year}<span class="grey0 thin0">-</span></span>
            <span class="date-part">{row.month}<span class="grey0 thin0">-</span></span>
            <span class="date-part">{row.day}</span>
            <span class="date-part">&nbsp;</span>
            {#if row.twelveHour}
              <span class="time-part compact-time">
                {row.hour12}
                <span class="compact-space"></span>
                {row.minute}
                <span class="compact-space"></span>
                <span class="grey0 thin0">{row.second}</span>
                <span class="compact-space"></span>
                <span class="ampm">{row.ampm}</span>
              </span>
            {:else}
              <span class="time-part compact-time">
                {row.hour24}
                <span class="compact-space"></span>
                {row.minute}
                <span class="compact-space"></span>
                <span class="grey0 thin0">{row.second}</span>
              </span>
            {/if}
            <span class="date-part">&nbsp;</span>
            <span class="weekday-part">{row.weekdayShort}</span>
          </span>
        </div>
      {/each}
    </div>
  {/if}
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
  .list-col.list-ts {
    position: relative;
    cursor: pointer;
    user-select: text;
    transition: background 0.12s;
  }
  .list-col.list-ts:hover {
    background: #f6faff;
  }
  .ts-cell {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    position: relative;
  }
  .copy-icon {
    display: none;
    margin-left: 0.2em;
    cursor: pointer;
    vertical-align: middle;
    opacity: 0.7;
    transition: opacity 0.12s;
  }
  .list-col.list-ts:hover .copy-icon {
    display: inline-block;
    opacity: 1;
  }
  .copy-icon:active {
    opacity: 0.5;
  }
  .list-col.list-date-sep {
    width: 2.2em;
    min-width: 2.2em;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: 1.5px solid #eee;
    height: 1.5em;
    margin: 0 0.2em;
    content: "";
  }
  .ampm {
    font-size: 0.93em;
    color: #888;
    font-family: inherit;
    margin-left: 0.1em;
    letter-spacing: 0.01em;
    font-weight: 400;
  }
  .list-row {
    display: flex;
    border-bottom: 1px solid #f2f2f2;
    padding: 0.2em 0;
    align-items: center;
    transition: background 0.15s;
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
  }
</style>