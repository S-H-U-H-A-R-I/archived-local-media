<svelte:options runes />

<script lang="ts">
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import type { PageData } from "./$types.js";
    import { Modal } from "$lib/components/ui/index.js";

    let { series, seriesId, episodesToConvert } = $state(page.data as PageData);

    let showModal = $state(false);

    onMount(() => {
        if (episodesToConvert.length > 0) {
            showModal = true;
        }
    });

    function handleConvert() {
        // TODO: Implement API call to convert episodes
        // For now, just log the episodes to convert
        console.log("Converting episodes:", episodesToConvert);
        showModal = false;
    }
</script>

{#if showModal}
    <Modal
        title="Conversions Available!"
        onModalClose={() => (showModal = false)}
        accentColor="var(--accent-blue)"
        animation="fly"
        animationDuration={200}
        >{#snippet body()}
            <p>
                There are {episodesToConvert.length} episodes available for conversion!😄
            </p>
            <ul class="episodes-list">
                {#each episodesToConvert as episode}
                    <li>{episode.filePath.split("\\").pop()}</li>
                {/each}
            </ul>
        {/snippet}
        {#snippet footer()}
            <button class="convert-btn" onclick={handleConvert}>Convert</button>
        {/snippet}
    </Modal>
{:else}
    <p>No episodes to convert.</p>
{/if}

<style>
    p {
        margin: 0;
        font-size: 1rem;
        color: var(--neutral-200);
        letter-spacing: 0.3px;
    }

    .episodes-list {
        max-height: 250px;
        overflow-y: auto;
        padding: 0;
        margin: 0;
        list-style-type: none;
        background-color: rgba(10, 12, 16, 0.7);
        border-left: 2px solid var(--accent-blue);
    }

    .episodes-list::-webkit-scrollbar {
        width: 6px;
    }

    .episodes-list::-webkit-scrollbar-thumb {
        background-color: var(--accent-blue);
        border-radius: 9999px;
    }

    .episodes-list::-webkit-scrollbar-track {
        background-color: rgba(10, 12, 16, 0.5);
    }

    .episodes-list li {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid rgba(59, 130, 246, 0.2);
        font-family: "JetBrains Mono", monospace;
        font-size: 0.85rem;
        color: var(--neutral-300);
        transition: background-color 150ms;

        &:hover {
            background-color: rgba(59, 130, 246, 0.1);
        }

        &:last-child {
            border-bottom: none;
        }
    }

    .convert-btn {
        color: white;
        background-color: transparent;
        width: fit-content;
        padding: 0.5rem 2rem;
        border: 1px solid var(--accent-blue);
        border-radius: 2px;
        font-weight: 500;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.9em;
        position: relative;
        overflow: hidden;
        transition: all 300ms;
        box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);

        &:hover {
            background-color: var(--accent-blue);
            color: white;
            box-shadow:
                0 0 15px rgba(59, 130, 246, 0.5),
                0 0 30px rgba(59, 130, 246, 0.3);
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
        }

        &:focus {
            box-shadow: none;
        }

        &:focus-visible {
            outline: none;
            box-shadow:
                0 0 0 2px var(--bg-dark),
                0 0 0 4px var(--accent-blue);
        }
    }

    .convert-btn::before {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent,
            rgba(59, 130, 246, 0.5),
            transparent
        );
        transition: left 0.7s;
    }

    .convert-btn:hover::before {
        left: 100%;
    }
</style>
