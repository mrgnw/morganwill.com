<script>
    import "../app.pcss";
    import { ModeWatcher } from "mode-watcher";
    import { page } from "$app/state";

    let { children } = $props();
</script>

<ModeWatcher />

{#key page.url.pathname}
    <div class="page-transition">
        {@render children?.()}
    </div>
{/key}

<style>
    .page-transition {
        width: 100%;
        height: 100%;
    }
</style>
