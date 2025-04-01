<svelte:options runes />

<script lang="ts">
    import { page } from "$app/state";
    import { SeriesList } from "$lib/components/media/index.js";
    import type { PageData } from "./$types.js";

    let { series } = $state(page.data as PageData);
</script>

<SeriesList {series} />
