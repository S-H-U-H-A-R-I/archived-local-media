<svelte:options runes />

<script lang="ts">
    import { Link } from "../ui/index.js";
</script>

<nav>
    <div class="logo-container">
        <Link href="/" aria-label="Smart Media Home" class="logo">
            SmartMedia
        </Link>
    </div>
    <div class="actions-container"></div>
</nav>

<style>
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
    }

    .logo-container {
        display: flex;
        align-items: center;

        :global(.logo) {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--primary-500);
            letter-spacing: -0.025em;
            padding: 0 0.5rem;
            text-transform: none;
            position: relative;
            transition: color 300ms;

            &:hover {
                color: var(--primary-400);
                text-decoration: none;

                &::after {
                    transform: scaleX(1);
                    opacity: 1;
                }
            }

            &:focus-visible {
                outline: 1px solid var(--primary-500);
                border-radius: 5px;
                outline-offset: 2px;
            }

            &::after {
                content: "";
                position: absolute;
                bottom: -2px;
                left: 0;
                width: 100%;
                height: 2px;
                background-color: var(--primary-400);
                transform: scaleX(0);
                opacity: 0;
                transition:
                    transform 0.2s ease,
                    opacity 0.2s ease;
                transform-origin: left center;
            }
        }
    }
</style>
