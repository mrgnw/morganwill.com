<script>
    import { Copy } from 'lucide-svelte';
    let inputText = $state('');
    let links = $state([]);

    function parseUrbanSportsText(text) {
        console.log('Input text (with char codes):', Array.from(text).map(c => `${c} (${c.charCodeAt(0)})`));
        
        const pattern = /.*?(.+?) wants you to check out (.+?) at (.+?)! Here['']s the link for more info: (.+)/;
        const match = text.trim().match(pattern);
        console.log('Pattern match result:', match);

        if (match) {
            const [_, name, activity, gym, url] = match;
            console.log('Parsed values:', { name, activity, gym, url });
            const htmlLink = `<a href="${url}">${activity} at ${gym}</a>`;
            const plainTextLink = `${activity} at ${gym}\n${url}`;
            console.log('Generated HTML:', htmlLink);
            links = [...links, { html: htmlLink, text: plainTextLink }];
            inputText = '';
        } else {
            console.log('No match found - text does not match expected pattern');
        }
    }

    function handlePaste(event) {
        const text = event.clipboardData.getData('text');
        parseUrbanSportsText(text);
    }
    function handleCopy(link) {
        console.log(link)
        navigator.clipboard.writeText(link.text);
    }

</script>

<div class="container">
    <textarea
        bind:value={inputText}
        onpaste={handlePaste}
        placeholder="Paste Urban Sports Club share text here..."
        rows="3"
    />

    {#if links.length > 0}
        <div class="links">
            <h3>Generated Links:</h3>
            {#each links as link}
                <div class="link-item">
                    <div class="link-preview">
                        {@html link.html}
                    </div>
                    <div class="copy-section">
                        <button onclick={() => handleCopy(link)}>
                            <Copy size={16} />
                        </button>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 600px;
        margin: 0 auto;
    }

    textarea {
        width: 100%;
        margin-bottom: 1rem;
    }

    .links {
        margin-top: 1rem;
    }

    .link-item {
        margin-bottom: 1rem;
        padding: 0.5rem;
        background: #f5f5f5;
        border-radius: 4px;
    }

    .copy-section {
        margin-top: 0.5rem;
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    pre {
        margin: 0;
        padding: 0.5rem;
        background: #eee;
        border-radius: 4px;
        flex: 1;
    }

    button {
        padding: 0.5rem;
        border-radius: 4px;
        border: none;
        background: #007bff;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: 1;
    }

    button:hover {
        background: #0056b3;
    }
</style>
