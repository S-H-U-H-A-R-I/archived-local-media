<svelte:options runes />

<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    fade,
    fly,
    scale,
    slide,
    type FadeParams,
    type FlyParams,
    type ScaleParams,
    type SlideParams,
    type TransitionConfig,
  } from "svelte/transition";
  import { CloseIcon } from "../icons/index.js";

  type Animation = "fade" | "fly" | "scale" | "slide" | "none";
  type AnimationParams =
    | FadeParams
    | FlyParams
    | ScaleParams
    | SlideParams
    | Record<string, never>;

  let {
    body,
    footer,
    title,
    onModalClose,
    accentColor = "var(--accent-blue)",
    width = "90%",
    maxWidth = "700px",
    overlayOpacity = "0.85",
    animation = "fade",
    animationDuration = 200,
    overlayDuration = 150,
    animationParams = {},
  }: {
    body: Snippet;
    footer?: Snippet;
    title: string;
    onModalClose: () => void;
    accentColor?: string;
    width?: string;
    maxWidth?: string;
    overlayOpacity?: string;
    animation?: Animation;
    animationDuration?: number;
    overlayDuration?: number;
    animationParams?: AnimationParams;
  } = $props();

  function getTransition(
    node: Element,
    { phase }: { phase: "intro" | "outro" }
  ): TransitionConfig {
    switch (animation) {
      case "fade":
        return fade(node, { duration: animationDuration, ...animationParams });
      case "fly":
        return fly(node, {
          duration: animationDuration,
          x: phase === "intro" ? -100 : 100,
          opacity: 0,
          ...animationParams,
        });
      case "scale":
        return scale(node, {
          duration: animationDuration,
          start: phase === "intro" ? 0.95 : 1.05,
          ...animationParams,
        });
      case "slide":
        return slide(node, { duration: animationDuration, ...animationParams });
      case "none":
        return {
          duration: 0,
          css: () => "",
          tick: () => {},
        };
      default:
        return fade(node, { duration: animationDuration, ...animationParams });
    }
  }
</script>

<div
  class="modal"
  style:--overlay-opacity={overlayOpacity}
  in:fade={{ duration: overlayDuration }}
  out:fade={{ duration: overlayDuration / 2 }}
>
  <div
    class="modal-content"
    style:--accent-color={accentColor}
    style:--modal-width={width}
    style:--modal-max-width={maxWidth}
    in:getTransition={{ phase: "intro" }}
    out:getTransition={{ phase: "outro" }}
  >
    <div class="modal-header">
      <h2>{title}</h2>
      <button class="close-btn" onclick={onModalClose}>
        <CloseIcon scale={1} strokeWidth="1.5" />
      </button>
    </div>
    <div class="modal-body">
      {@render body()}
    </div>
    {#if footer}
      <div class="modal-footer">
        {@render footer()}
      </div>
    {/if}
  </div>
</div>

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(var(--neutral-950-rgb), var(--overlay-opacity));
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0;
    border-radius: 4px;
    width: var(--modal-width);
    max-width: var(--modal-max-width);
    background-color: rgba(var(--bg-dark-rgb), 0.8);
    box-shadow:
      0 0 20px rgba(0, 0, 0, 0.3),
      0 0 60px rgba(0, 0, 0, 0.1);
    color: var(--text-light);
    overflow: hidden;
    border: 1px solid var(--accent-color);
    position: relative;
    margin: 0 1rem;
  }

  .modal-content::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--accent-color),
      transparent
    );
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(var(--bg-darker-rgb), 0.9);
    padding: 1rem 1.5rem;
    position: relative;
  }

  .modal-header h2 {
    margin: 0;
    color: white;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-size: 1.2rem;
    text-shadow: 0 0 8px rgba(var(--text-light-rgb), 0.4);
  }

  .close-btn {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 0.25rem;
    background-color: transparent;
    color: var(--neutral-300);
    border: none;
    cursor: pointer;
    transition: all 150ms;

    &:hover {
      color: white;
      text-shadow: 0 0 8px var(--accent-color);
    }

    &:active {
      transform: scale(0.9);
    }

    &:focus {
      box-shadow: none;
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px var(--accent-color);
      border-radius: 0.125rem;
    }
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem 1rem;
    background: linear-gradient(
      rgba(var(--bg-dark-rgb), 0.9),
      rgba(var(--bg-darker-rgb), 0.85)
    );
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 1rem 1.5rem;
    background-color: rgba(var(--neutral-950-rgb), 0.7);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  @media screen and (min-width: 640px) {
    .modal-body {
      padding: 1.5rem 1.25rem;
    }
  }

  @media screen and (min-width: 768px) {
    .modal-body {
      padding: 2rem 1.5rem;
    }
  }
</style>
