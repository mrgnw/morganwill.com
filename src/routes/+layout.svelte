<script>
    import "../app.pcss";
    import { page } from "$app/state";

    let { children } = $props();
</script>

{#key page.url.pathname}
    <div class="page-transition">
        {@render children?.()}
    </div>
{/key}
