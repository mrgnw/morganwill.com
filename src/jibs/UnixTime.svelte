<script>
    // Unix timestamp to date converter
    let unixTime = $state(Math.floor(Date.now() / 1000)); // Current Unix timestamp

    // Derived date from Unix timestamp
    let date = $derived(new Date(unixTime * 1000));

    // ISO date (YYYY-MM-DD)
    let isoDate = $derived(
        date.getFullYear() +
            "-" +
            String(date.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(date.getDate()).padStart(2, "0"),
    );

    // 24-hour time (HH:mm:ss)
    let hour24 = $derived(String(date.getHours()).padStart(2, "0"));
    let minute = $derived(String(date.getMinutes()).padStart(2, "0"));
    let second = $derived(String(date.getSeconds()).padStart(2, "0"));

    // 12-hour time (h:mm AM/PM)
    let hour12 = $derived.by(() => {
        let h = date.getHours();
        return (h % 12 || 12) + ":" + minute + " " + (h < 12 ? "AM" : "PM");
    });

    // Month name, day, weekday
    let monthDayWeek = $derived.by(() => {
        const month = date.toLocaleString("en-US", { month: "long" });
        const day = date.getDate();
        const weekday = date.toLocaleString("en-US", { weekday: "long" });
        return `${month} ${day} ${weekday}`;
    });

    // Add a more readable weekday, month, day, year string
    let fullDate = $derived.by(() =>
        date.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
    );

    // DateRow class encapsulates all formatting and logic for a timestamp row
    class DateRow {
        constructor(raw) {
            this.raw = raw;
            this.num = Number(raw);
            // Accept ms or s: if > 1e12 treat as ms, else s
            const initialMs =
                this.num > 1e12 || (this.num > 1e10 && this.num < 1e13)
                    ? this.num
                    : this.num * 1000;

            // Make timestamp properties reactive
            this._ms = $state(initialMs);
            this._unixTime = $state(Math.floor(initialMs / 1000));
            this._date = $state(new Date(initialMs));
            this.twelveHour = false;

            // Reactive editable state
            this._editableDate = $state(this.dateString);
            this._editableTime = $state(this.timeString);
        }

        get ms() {
            return this._ms;
        }

        set ms(value) {
            this._ms = value;
            this._unixTime = Math.floor(value / 1000);
            this._date = new Date(value);
        }

        get unixTime() {
            return this._unixTime;
        }

        get date() {
            return this._date;
        }

        get editableDate() {
            return this._editableDate;
        }

        set editableDate(value) {
            this._editableDate = value;
            this.updateFromEditable();
        }

        get editableTime() {
            return this._editableTime;
        }

        set editableTime(value) {
            this._editableTime = value;
            this.updateFromEditable();
        }

        get dateString() {
            return `${this.year}-${this.month}-${this.day}`;
        }

        get timeString() {
            return `${this.hour24}:${this.minute}:${this.second}`;
        }

        // Update the timestamp when editable values change
        updateFromEditable() {
            try {
                const dateParts = this._editableDate.split("-");
                const timeParts = this._editableTime.split(":");

                if (dateParts.length !== 3 || timeParts.length !== 3) return;

                const [year, month, day] = dateParts.map((n) => parseInt(n));
                const [hour, minute, second] = timeParts.map((n) =>
                    parseInt(n),
                );

                // Validate ranges
                if (
                    isNaN(year) ||
                    isNaN(month) ||
                    isNaN(day) ||
                    isNaN(hour) ||
                    isNaN(minute) ||
                    isNaN(second)
                )
                    return;
                if (month < 1 || month > 12 || day < 1 || day > 31) return;
                if (
                    hour < 0 ||
                    hour > 23 ||
                    minute < 0 ||
                    minute > 59 ||
                    second < 0 ||
                    second > 59
                )
                    return;

                const newDate = new Date(
                    year,
                    month - 1,
                    day,
                    hour,
                    minute,
                    second,
                );

                if (!isNaN(newDate.getTime())) {
                    const newMs = newDate.getTime();
                    if (newMs !== this._ms) {
                        // Use the setter to update all related values reactively
                        this.ms = newMs;
                    }
                }
            } catch (e) {
                // Silently handle invalid input
            }
        }

        // Sync editable fields when the underlying date changes (e.g., from external updates)
        syncEditableFields() {
            this._editableDate = this.dateString;
            this._editableTime = this.timeString;
        }

        get headAndZeros() {
            const str =
                this._ms > 1e12 ? String(this._ms) : String(this._unixTime);
            let match = str.match(/^(.*?)(0{3,})$/);
            if (match) return [match[1], match[2]];
            return [str, ""];
        }
        get year() {
            return this._date.getFullYear();
        }
        get month() {
            return String(this._date.getMonth() + 1).padStart(2, "0");
        }
        get day() {
            return String(this._date.getDate()).padStart(2, "0");
        }
        get hour24() {
            return String(this._date.getHours()).padStart(2, "0");
        }
        get minute() {
            return String(this._date.getMinutes()).padStart(2, "0");
        }
        get second() {
            return String(this._date.getSeconds()).padStart(2, "0");
        }
        get hour12() {
            let h = this._date.getHours();
            return String(h % 12 || 12).padStart(2, "0");
        }
        get ampm() {
            return this._date.getHours() < 12 ? "AM" : "PM";
        }
        get weekdayShort() {
            return this._date.toLocaleString("en-US", { weekday: "short" });
        }
    }

    // List of DateRow objects
    let times = $state([]);

    // Initialize with current time on load
    $effect(() => {
        if (times.length === 0) {
            addTime(unixTime);
        }
    });

    // Add a new timestamp to the list, dedup by ms
    function addTime(raw) {
        let row = new DateRow(raw);
        if (!Number.isFinite(row.num)) return;
        if (!times.some((t) => t.ms === row.ms)) {
            times = [row, ...times];
        }
        unixTime = row.unixTime;
    }

    // Try to parse a date string and return Unix timestamp if successful
    function tryParseDateString(str) {
        try {
            const date = new Date(str.trim());
            if (!isNaN(date.getTime())) {
                return Math.floor(date.getTime() / 1000);
            }
        } catch (e) {
            // Ignore parse errors
        }
        return null;
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

    // Copy date/time string to clipboard
    function copyDateTime(row) {
        const dateTimeString = `${row.editableDate} ${row.editableTime}`;
        navigator.clipboard.writeText(dateTimeString);
    }

    // Handle paste anywhere: extract all numbers and add each
    function handlePaste(e) {
        let text = (e.clipboardData || window.clipboardData).getData("text");
        let matches = text.match(/\d{6,}/g); // all 6+ digit numbers
        if (matches) {
            matches.forEach(addTime);
        } else {
            // Try parsing as date string if no Unix timestamps found
            const timestamp = tryParseDateString(text);
            if (timestamp) {
                addTime(timestamp);
            }
        }
        // Prevent default paste into input
        e.preventDefault();
    }

    // Handle paste on the input: extract all numbers and add each, set input to last match
    function handleInputPaste(e) {
        let text = (e.clipboardData || window.clipboardData).getData("text");
        let matches = text.match(/\d{6,}/g);
        if (matches && matches.length) {
            matches.forEach(addTime);
            // Use ms/s logic for last match
            let last = new DateRow(matches[matches.length - 1]);
            unixTime = last.unixTime;
            e.preventDefault();
        } else {
            // Try parsing as date string if no Unix timestamps found
            const timestamp = tryParseDateString(text);
            if (timestamp) {
                addTime(timestamp);
                unixTime = timestamp;
                e.preventDefault();
            }
        }
    }

    // Handle paste anywhere: extract all numbers and add each, set input to last match
    function handleAnyPaste(e) {
        let text = (e.clipboardData || window.clipboardData).getData("text");
        let matches = text.match(/\d{6,}/g);
        if (matches && matches.length) {
            matches.forEach(addTime);
            let last = new DateRow(matches[matches.length - 1]);
            unixTime = last.unixTime;
            e.preventDefault();
        } else {
            // Try parsing as date string if no Unix timestamps found
            const timestamp = tryParseDateString(text);
            if (timestamp) {
                addTime(timestamp);
                unixTime = timestamp;
                e.preventDefault();
            }
        }
    }

    // Add from input (on blur or enter)
    function handleInputAdd() {
        addTime(unixTime);
    }

    // Attach paste handler on mount
    $effect(() => {
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
    });

    // Attach global paste handler on mount
    $effect(() => {
        window.addEventListener("paste", handleAnyPaste);
        return () => window.removeEventListener("paste", handleAnyPaste);
    });

    // Remove formatRow, add helpers for each part of the date/time
    function getYear(d) {
        return d.getFullYear();
    }
    function getMonth(d) {
        return String(d.getMonth() + 1).padStart(2, "0");
    }
    function getDay(d) {
        return String(d.getDate()).padStart(2, "0");
    }
    function getHour(d) {
        return String(d.getHours()).padStart(2, "0");
    }
    function getMinute(d) {
        return String(d.getMinutes()).padStart(2, "0");
    }
    function getSecond(d) {
        return String(d.getSeconds()).padStart(2, "0");
    }
    function getWeekdayShort(d) {
        return d.toLocaleString("en-US", { weekday: "short" });
    }

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
        return str.replace(
            /[&<>"']/g,
            (c) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                })[c],
        );
    }

    // Track which timestamps are in 12h mode (by ms)
    let twelveHour = $state({});

    // --- Add derived values for each row ---
    function getHour24(date) {
        return String(date.getHours()).padStart(2, "0");
    }

    function getHour12(date) {
        let h = date.getHours();
        return String(h % 12 || 12).padStart(2, "0");
    }
    function getAmPm(date) {
        return date.getHours() < 12 ? "AM" : "PM";
    }
</script>

<div class="container">
    <h1 class="title">Unix Timestamp Converter</h1>
    <div class="mb-6">
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
            onkeydown={(e) => {
                if (e.key === "Enter") handleInputAdd();
            }}
        />
        <div class="btn-row">
            <button onclick={setCurrentTime} class="set-btn" type="button">
                Set Current Time
            </button>
        </div>
    </div>

    {#if times.length > 0}
        <div class="list-table">
            <div class="list-header">
                <span class="list-col list-col-ts">Timestamp</span>
                <span class="list-col list-col-date">Date</span>
            </div>
            {#each times as row}
                <div class="list-row">
                    <button
                        class="list-col list-col-ts ts-cell"
                        type="button"
                        onclick={() => toggleHourMode(row)}
                    >
                        {#key row.ms}
                            {#if row.headAndZeros[1]}
                                <span style="letter-spacing:0">
                                    {row.headAndZeros[0]}<span
                                        class="grey0 thin0"
                                        >{row.headAndZeros[1]}</span
                                    >
                                </span>
                            {:else}
                                {row.headAndZeros[0]}
                            {/if}
                        {/key}
                    </button>
                    <button
                        class="copy-icon"
                        type="button"
                        onclick={(e) => {
                            e.stopPropagation();
                            copyTimestamp(
                                row.ms > 1e12 ? row.ms : row.unixTime,
                            );
                        }}
                        title="Copy timestamp"
                        aria-label="Copy timestamp"
                    >
                        <svg
                            width="1.1em"
                            height="1.1em"
                            viewBox="0 0 20 20"
                            fill="none"
                            style="vertical-align:middle;"
                        >
                            <rect
                                x="6"
                                y="6"
                                width="9"
                                height="9"
                                rx="2"
                                fill="#bdbdbd"
                            />
                            <rect
                                x="3"
                                y="3"
                                width="9"
                                height="9"
                                rx="2"
                                stroke="#bdbdbd"
                                stroke-width="2"
                                fill="none"
                            />
                        </svg>
                    </button>
                    <span class="list-col list-col-date date-cell">
                        <input
                            class="editable-field date-field"
                            bind:value={row.editableDate}
                            placeholder="YYYY-MM-DD"
                        />
                        <input
                            class="editable-field time-field"
                            bind:value={row.editableTime}
                            placeholder="HH:mm:ss"
                        />
                        <span class="weekday-part">{row.weekdayShort}</span>
                        <button
                            class="copy-icon date-copy-icon"
                            type="button"
                            onclick={(e) => {
                                e.stopPropagation();
                                copyDateTime(row);
                            }}
                            title="Copy date/time"
                            aria-label="Copy date and time"
                        >
                            <svg
                                width="1.1em"
                                height="1.1em"
                                viewBox="0 0 20 20"
                                fill="none"
                                style="vertical-align:middle;"
                            >
                                <rect
                                    x="6"
                                    y="6"
                                    width="9"
                                    height="9"
                                    rx="2"
                                    fill="#bdbdbd"
                                />
                                <rect
                                    x="3"
                                    y="3"
                                    width="9"
                                    height="9"
                                    rx="2"
                                    stroke="#bdbdbd"
                                    stroke-width="2"
                                    fill="none"
                                />
                            </svg>
                        </button>
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
        font-family:
            "Inter", "JetBrains Mono", "Fira Mono", "Menlo", "Consolas",
            monospace;
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
        transition:
            background 0.15s,
            box-shadow 0.15s;
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.03);
        outline: none;
        margin: 0 auto;
        display: block;
    }
    .set-btn:hover,
    .set-btn:focus {
        background: #005fcc;
        box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.07);
    }

    .list-table {
        width: 100%;
        max-width: 600px;
        margin: 2rem auto 1.5rem auto;
        font-family:
            "JetBrains Mono", "Fira Mono", "Menlo", "Consolas", monospace;
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

    .list-col {
        display: flex;
        align-items: center;
    }

    .list-col-ts {
        width: 10em;
        max-width: 10em;
        min-width: 10em;
        position: relative;
        cursor: pointer;
        user-select: text;
        transition: background 0.12s;
        /* Reduce space for copy icon */
        padding-right: 1.5em;
        overflow: hidden;
        text-overflow: ellipsis;
        background: transparent;
        border: none;
        padding: 0;
        font-family: inherit;
        font-size: inherit;
        color: inherit;
    }

    .list-col-ts:hover {
        background: #f6faff;
    }

    .list-col-date {
        flex: 1;
        color: #222;
        font-size: 1.08em;
        font-family: inherit;
        gap: 0.05em;
        white-space: nowrap;
        position: relative;
        /* Reserve space for copy icon */
        padding-right: 1.5em;
        display: flex;
        align-items: center;
    }

    .date-cell:hover {
        background: #f6faff;
    }

    .copy-icon {
        position: absolute;
        right: 0.2em;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0;
        cursor: pointer;
        transition: opacity 0.12s;
        /* Prevent the icon from affecting layout */
        pointer-events: none;
        background: transparent;
        border: none;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .copy-icon:hover {
        opacity: 1;
        pointer-events: auto;
    }

    .copy-icon:active {
        opacity: 0.5;
    }

    .date-copy-icon {
        position: absolute;
        right: 0.2em;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0;
        cursor: pointer;
        transition: opacity 0.12s;
        pointer-events: none;
    }

    .list-col-date:hover .date-copy-icon {
        opacity: 1;
        pointer-events: auto;
    }

    .date-copy-icon:active {
        opacity: 0.5;
    }

    .list-row {
        display: flex;
        border-bottom: 1px solid #f2f2f2;
        padding: 0.2em 0;
        align-items: center;
        transition: background 0.15s;
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

    .weekday-part {
        color: #888;
        font-family: inherit;
        font-size: 0.98em;
        margin-left: 0.05em;
    }

    .editable-field {
        background: transparent;
        border: none;
        outline: none;
        font-family: inherit;
        font-size: inherit;
        font-weight: inherit;
        color: inherit;
        padding: 0.05em 0.2em;
        margin: 0;
        text-align: center;
        transition:
            background 0.15s,
            border-radius 0.15s;
        border-radius: 3px;
    }

    .editable-field:hover {
        background: rgba(0, 122, 255, 0.08);
    }

    .editable-field:focus {
        background: rgba(0, 122, 255, 0.15);
        outline: 1px solid rgba(0, 122, 255, 0.3);
    }

    .date-field {
        width: 8em;
        color: #444;
    }

    .time-field {
        width: 6.5em;
        color: #007aff;
        font-weight: 600;
    }

    @media (max-width: 640px) {
        .container {
            padding: 1.2rem 0.5rem 1rem 0.5rem;
        }
    }
</style>
