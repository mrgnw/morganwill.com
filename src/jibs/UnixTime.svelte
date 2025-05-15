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

  // Add a new timestamp to the list, dedup by ms
  function addTime(raw) {
    let num = Number(raw);
    if (!Number.isFinite(num)) return;
    // Accept ms or s: if > 1e12 treat as ms, else s
    let ms = num > 1e12 ? num : num * 1000;
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

  // Handle paste anywhere: extract all numbers and add each
  function handlePaste(e) {
    let text = (e.clipboardData || window.clipboardData).getData('text');
    let matches = text.match(/\d{9,}/g); // all 9+ digit numbers
    if (matches) {
      matches.forEach(addTime);
    }
    // Prevent default paste into input
    e.preventDefault();
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

  // Format for list row: "2025-05-15 15:36:36 (Thursday)"
  function formatRow(d) {
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0') +
      ' ' +
      String(d.getHours()).padStart(2, '0') +
      ':' +
      String(d.getMinutes()).padStart(2, '0') +
      ':' +
      String(d.getSeconds()).padStart(2, '0') +
      ' (' +
      d.toLocaleString('en-US', { weekday: 'short' }) +
      ')'
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
        <span class="list-col list-ts">Timestamp</span>
        <span class="list-col list-date">Date</span>
      </div>
      {#each times as t, i}
        <div class="list-row {i === 0 ? 'latest' : ''}">
          <span class="list-col list-ts">{t.ms > 1e12 ? t.ms : t.unixTime}</span>
          <span class="list-col list-date">{formatRow(t.date)}</span>
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
  .list-col {
    padding: 0.2em 0.7em 0.2em 0;
    white-space: nowrap;
    overflow-x: auto;
    text-overflow: ellipsis;
    display: inline-block;
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