/**
 * ### A Svelte action that scales an element based on its position in the viewport.
 * The element scales to full size when centered in the viewport and reduces in size
 * as it moves toward the edges of the viewport.
 * 
 * @param node The HTML element to apply the scaling effect to
 * @param options Configuration options for the scaling effect
 * @returns A Svelte action object
 */
export function dynamicScale(node: HTMLElement, options: IDynamicScaleOptions = {}): {
    destroy(): void;
    update(newOptions?: IDynamicScaleOptions): void;
} {
    const {
        minScale = 0.9,
        maxScale = 1.0,
        transitionDuration = 0.1,
        transitionTiming = 'ease-out'
    } = options;

    const handleScroll = (): void => {
        const rect = node.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementHeight = rect.height;

        // Calculate element's center position relative to viewport
        const elementCenter = rect.top + elementHeight / 2;
        const viewportCenter = viewportHeight / 2;

        // Calculate how far the element is from the center (normalized 0-1)
        const distanceFromCenter = Math.abs(elementCenter - viewportCenter) / viewportHeight;

        // Calculate scale factor (closer to center = closer to maxScale)
        // Using 0.5 since that's the maximum distanceFromCenter when element is at top or bottom edge
        const scaleFactor = maxScale - distanceFromCenter * 2 * (maxScale - minScale);

        // Apply scale transformation, constrained between min and max
        const appliedScale = Math.max(minScale, Math.min(maxScale, scaleFactor));

        // Apply the scale to the element
        node.style.transform = `scale(${appliedScale})`;
    };

    // Set initial transform origin for smoother scaling
    node.style.transformOrigin = "center center";
    node.style.transition = `transform ${transitionDuration}s ${transitionTiming}`;

    handleScroll(); // Initial check

    document.addEventListener("scroll", handleScroll, {
        passive: true,
    });

    return {
        destroy(): void {
            document.removeEventListener("scroll", handleScroll);
            node.style.transform = "";
        },
        update(newOptions: IDynamicScaleOptions = {}): void {
            // Update options if they change
            Object.assign(options, newOptions);
            handleScroll();
        }
    };
}


/**
 * ### Interface defining options for dynamic scaling functionality.
 * @interface
 * @property {number} [minScale] - The minimum allowed scale value.
 * @property {number} [maxScale] - The maximum allowed scale value.
 * @property {number} [transitionDuration] - Duration of the scaling transition in milliseconds.
 * @property {string} [transitionTiming] - CSS timing function for the scaling transition (e.g., 'ease', 'linear').
 */
export interface IDynamicScaleOptions {
    minScale?: number;
    maxScale?: number;
    transitionDuration?: number;
    transitionTiming?: string;
}