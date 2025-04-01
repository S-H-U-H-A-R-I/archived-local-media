<svelte:options runes />

<script lang="ts">
    import { goto } from "$app/navigation";
    import type { Snippet } from "svelte";
    import type { HTMLAnchorAttributes } from "svelte/elements";

    const {
        children,
        ...props
    }: {
        children: Snippet;
    } & HTMLAnchorAttributes = $props();

    function onclick(event: MouseEvent) {
        if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
            event.preventDefault();
            const href = (event.currentTarget as HTMLAnchorElement).href;
            goto(href);
        }
    }
</script>

<a {onclick} {...props}>
    {@render children()}
</a>
