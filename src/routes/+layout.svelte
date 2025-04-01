<svelte:options runes />

<script lang="ts">
    import type { Snippet } from "svelte";

    import "$lib/styles/global.css";
    import PageHeading from "$lib/components/headings/PageHeading.svelte";
    import { Breadcrumb } from "$lib/components/ui/index.js";

    const {
        children,
    }: {
        children: Snippet;
    } = $props();
</script>

<main>
    <PageHeading />
    <Breadcrumb />
    {@render children()}
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        height: 100vh;
        width: 100%;
    }
</style>
