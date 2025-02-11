<script>
    let text = '';
    let showTextarea = true;

    function reset() {
        text = '';
        showTextarea = true;
    }

    function showInput() {
        showTextarea = true;
    }

    function handlePaste() {
        showTextarea = false;
    }
</script>

{#if showTextarea}
    <textarea
        bind:value={text}
        placeholder="Paste here"
        rows="8"
        cols="40"
        on:paste={handlePaste}
    ></textarea>
{:else}
    <div class="columns">
        <div class="button-container">
            <button on:click={showInput} class="action-button" aria-label="Show input">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </button>
            <button on:click={reset} class="action-button" aria-label="Clear and show input">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
        </div>
        {text}
    </div>
{/if}

<style>
    .columns {
        column-width: 200px;
        column-gap: 2rem;
        white-space: pre-line;
    }

    .button-container {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        break-after: column;
    }

    .action-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        background: white;
        color: #666;
        cursor: pointer;
        transition: all 0.2s;
    }

    .action-button:hover {
        background: #f5f5f5;
        transform: translateY(-1px);
        box-shadow: 0 3px 6px rgba(0,0,0,0.15);
    }
</style>
