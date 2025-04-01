<svelte:options runes />

<script lang="ts">
    import type { IApiErrorResponse } from "$lib/server/utils/index.js";
    import type { TSeries } from "$lib/server/utils/media/index.js";
    import ErrorCircleIcon from "../icons/ErrorCircleIcon.svelte";
    import { RefreshIcon } from "../icons/index.js";
    import Link from "../ui/Link.svelte";
    import MoviePosterLightBox from "../ui/MoviePosterLightBox.svelte";

    let {
        series = [],
        title = "Series",
        showRefreshButton = true,
        compact = false,
    }: {
        series: TSeries[];
        title?: string;
        showRefreshButton?: boolean;
        compact?: boolean;
    } = $props();

    let error = $state("");
    let isRefreshing = $state(false);

    async function refreshSeriesList() {
        error = "";
        isRefreshing = true;
        try {
            const response = await fetch("/api/series/refresh", {
                method: "GET",
            });
            if (response.ok) {
                series = (await response.json()) as TSeries[];
            } else {
                const errorData: IApiErrorResponse = await response.json();
                throw new Error(errorData.error.message);
            }
        } catch (error) {
            error =
                error instanceof Error
                    ? error.message
                    : "An unknown error occurred";
            console.error("Error refreshing series list:", error);
        } finally {
            isRefreshing = false;
        }
    }
</script>

<div class="series-container {compact ? 'compact' : ''}">
    <div class="header">
        <h2>{title}</h2>
        {#if showRefreshButton}
            <button class="refresh-button" onclick={refreshSeriesList}>
                <RefreshIcon
                    className={`refresh-icon ${isRefreshing ? "rotate" : ""}`}
                />
                <span>Refresh {title}</span>
            </button>
        {/if}
    </div>

    <div class="content">
        {#if error}
            <div class="error-message">
                <ErrorCircleIcon scale={1.3} className="error-icon" />
                <p>{error}</p>
            </div>
        {:else if series.length === 0}
            <div class="empty-series">No {title}</div>
        {:else}
            <div class="series-list">
                {#each series as s (s.id)}
                    <Link
                        class="series-item"
                        href={`/series/${s.id}`}
                        aria-label={`Go to series ${s.name}`}
                        ><MoviePosterLightBox title={s.name} />
                    </Link>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .series-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        gap: 1rem;
    }

    .series-container:not(.compact) {
        padding: 1rem;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header h2 {
        @media screen and (max-width: 768px) {
            font-size: 1.5em;
        }
    }

    .header .refresh-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background-color: transparent;
        border: 1px solid transparent;
        color: var(--accent-blue);
        cursor: pointer;

        &:hover {
            border-color: var(--accent-blue);

            :global(.refresh-icon) {
                transform: rotate(180deg);
            }
        }

        &:focus {
            box-shadow: none;
        }

        &:focus-visible {
            outline: none;
            box-shadow: 0 0 0 2px var(--accent-blue);
        }

        :global(.refresh-icon) {
            transition: transform 0.3s ease;
        }

        :global(.refresh-icon.rotate) {
            animation: spinWithDelay 1.5s linear infinite;
        }

        @media screen and (max-width: 768px) {
            span {
                display: none;
            }
        }
    }

    .content {
        display: flex;
        flex-direction: column;
        flex: 1;
        height: 100%;
        align-items: center;
        gap: 0.5rem;
    }

    .content .error-message {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 2em;
        font-weight: bold;
        color: var(--primary-600);

        :global(.error-icon) {
            transform: translateY(2px);
        }

        p {
            margin: 0;
        }
    }

    .content .series-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        width: 100%;

        :global(.series-item) {
            all: unset;
        }
    }
</style>
