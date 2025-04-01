<svelte:options runes />

<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";

    let pathSegments = $state<string[]>([]);
    let maxSegmentLength = $state(20); // Maximum length before truncating

    function truncateSegment(segment: string): string {
        if (segment.length <= maxSegmentLength) return segment;
        return segment.substring(0, maxSegmentLength - 3) + "...";
    }

    async function navigateToSegment(index: number) {
        if (typeof window !== "undefined") {
            const path = "/" + pathSegments.slice(0, index + 1).join("/");
            // Use SvelteKit's goto for client-side navigation
            await goto(path, { replaceState: false });
        }
    }

    function updatePathSegments() {
        const newPath = window.location.pathname;
        const newSegments = newPath.split("/").filter((segment) => segment);
        pathSegments = newSegments.slice(-3);
    }

    $effect(() => {
        if (page.url.pathname) updatePathSegments();
    });
</script>

<div class="breadcrums-container">
    <ul>
        {#each pathSegments as segment, index}
            <li>
                <button
                    onclick={() => navigateToSegment(index)}
                    class="segment-button"
                    title={segment.length > maxSegmentLength ? segment : ""}
                    >{truncateSegment(segment)}
                </button>
            </li>
        {/each}
    </ul>
</div>

<style>
    .breadcrums-container {
        padding: 1rem;
    }

    .breadcrums-container ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .breadcrums-container li {
        display: inline;
    }

    .breadcrums-container li:not(:last-child)::after {
        content: "/";
        margin: 0 0.5rem;
    }

    .breadcrums-container li:last-child {
        color: var(--primary-500);
    }

    .segment-button {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        color: inherit;
        cursor: pointer;

        &:focus {
            box-shadow: none;
        }

        &:hover {
            color: var(--primary-700);
        }
    }
</style>
