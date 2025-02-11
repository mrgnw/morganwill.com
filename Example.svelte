<script>
    import MultiColumn from '$jibs/MultiColumn.svelte';
    
    const content = [
        `<div class="content">
            <h2>Understanding CSS Grid</h2>
            <p>CSS Grid is a powerful layout system that allows for complex two-dimensional layouts. 
            It can handle both rows and columns simultaneously, making it perfect for modern web design.</p>
        </div>`,
        
        `<div class="content">
            <h2>Responsive Design</h2>
            <p>Modern websites need to work across all device sizes. Using minmax() with auto-fit 
            creates a responsive layout that automatically adjusts based on viewport width.</p>
        </div>`,
        
        `<div class="content">
            <h2>Performance Optimization</h2>
            <p>Grid layouts can significantly improve performance compared to older methods like 
            floating elements. They provide better control over spacing and alignment.</p>
        </div>`,
        
        `<div class="content">
            <h2>Browser Support</h2>
            <p>CSS Grid is now supported in all modern browsers, making it a reliable choice for 
            production websites. It gracefully degrades in older browsers when needed.</p>
        </div>`,
        
        `<div class="content">
            <h2>Best Practices</h2>
            <p>When using Grid, it's important to consider content flow and readability. 
            Breaking content into logical sections helps users scan and understand information quickly.</p>
        </div>`
    ];
</script>

<main>
    <h1>Grid Layout Demo</h1>
    <MultiColumn items={content} minColumnWidth="300px" />
</main>

<style>
    main {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    h1 {
        margin-bottom: 2rem;
        text-align: center;
    }

    :global(.content) {
        background: #f5f5f5;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    :global(.content h2) {
        margin-top: 0;
        color: #2c3e50;
        font-size: 1.5rem;
    }

    :global(.content p) {
        line-height: 1.6;
        color: #34495e;
        margin-bottom: 0;
    }
</style>
