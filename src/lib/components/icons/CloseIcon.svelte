<script lang="ts">
    let {
        stroke = "currentColor",
        strokeWidth = "1.5",
        scale = 1,
        className = "",
        lineOneStroke = "",
        lineTwoStroke = "",
        lineOneStrokeWidth = "",
        lineTwoStrokeWidth = "",
    } = $props();
</script>

<svg
    viewBox="-0.5 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    width={24 * scale}
    height={24 * scale}
    class={className}
    ><g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
        <path
            d="M3 21.32L21 3.32001"
            stroke={lineOneStroke || stroke}
            stroke-width={lineOneStrokeWidth || strokeWidth}
            stroke-linecap="round"
            stroke-linejoin="round"
        ></path>
        <path
            d="M3 3.32001L21 21.32"
            stroke={lineTwoStroke || stroke}
            stroke-width={lineTwoStrokeWidth || strokeWidth}
            stroke-linecap="round"
            stroke-linejoin="round"
        ></path>
    </g>
</svg>
