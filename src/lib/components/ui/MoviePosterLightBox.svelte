<svelte:options runes />

<script lang="ts">
    let { image = "", title = "", description = "" } = $props();

    $effect(() => {
        description =
            description.length > 100
                ? description.slice(0, 100) + "..."
                : description;
    });
</script>

<article>
    <div class="poster-container">
        {#if image}
            <img class="poster" src={image} alt={title} />
        {:else}
            <div class="poster placeholder">
                <span>No Image</span>
            </div>
        {/if}
    </div>
    <h2 class="title">{title}</h2>
    <p class="description">{description}</p>
</article>

<style>
    article {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        height: 20rem;
        width: 100%;
        max-height: 20rem;
        border: 1px solid var(--neutral-300);
        border-radius: 0.375rem;
        padding: 1rem;
        transition:
            color 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
    }

    .poster-container {
        width: 100%;
    }

    .poster {
        width: 100%;
        aspect-ratio: 16/9;
        object-fit: cover;
        border-radius: 0.375rem;
    }

    .placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--neutral-200);
        border: 1px dashed var(--neutral-200);
        height: 100%;
        min-height: 150px;
    }

    .title {
        font-size: 1.125em;
        font-weight: bold;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        max-width: 100%;
    }

    .description {
        font-size: 0.875em;
        font-weight: normal;
        margin: 0;
        max-width: 100%;
    }

    article:hover {
        box-shadow: 0 0 8px 0 var(--accent-blue);
        border-color: var(--accent-blue);
        cursor: pointer;
    }

    article:active {
        scale: 0.99;
    }
</style>
