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

  function setCurrentTime() {
    unixTime = Math.floor(Date.now() / 1000);
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
    />
    <button 
      onclick={setCurrentTime}
      class="set-btn"
    >
      Set Current Time
    </button>
  </div>
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
    font-size: 2.2rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin-bottom: 2.2rem;
    text-align: center;
  }

  .label {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    display: block;
    font-weight: 500;
    color: #444;
  }

  .timestamp-input {
    width: 100%;
    font-size: 2.2rem;
    padding: 0.7em 0.7em;
    border: 1.5px solid #e5e7eb;
    border-radius: 0.7em;
    outline: none;
    font-family: inherit;
    margin-bottom: 0.5em;
    background: #fafbfc;
    transition: border 0.15s;
  }
  .timestamp-input:focus {
    border-color: #007aff;
    background: #fff;
  }

  .set-btn {
    margin-top: 0.5em;
    background: #007aff;
    color: #fff;
    border: none;
    border-radius: 0.5em;
    padding: 0.55em 1.3em;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
    box-shadow: 0 1px 4px 0 rgba(0,0,0,0.03);
  }
  .set-btn:hover, .set-btn:focus {
    background: #005fcc;
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
    /* No card, no border, no background, just big text */
  }

  .iso {
    font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 4.2rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    color: #18181b;
    display: block;
    margin-bottom: 0.1em;
  }

  .time24 {
    font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 3.2rem;
    font-weight: 600;
    color: #007aff;
    letter-spacing: 0.01em;
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
  }

  .monthday {
    font-family: 'JetBrains Mono', 'Fira Mono', 'Menlo', 'Consolas', monospace;
    font-size: 2rem;
    color: #666;
    margin-top: 0.1em;
    display: block;
  }

  .fulldate {
    font-size: 1.2rem;
    color: #bdbdbd;
    margin-top: 0.2em;
    display: block;
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