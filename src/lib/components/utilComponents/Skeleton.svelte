<script lang="ts">
    let { style = '', class: className = '' }: { style?: string, class?: string } = $props();
</script>

<div class={`skeleton ${className}`} {style}></div>

<style>
    .skeleton {
        background: linear-gradient(
            90deg,
            var(--scribe-muted, #f7f7f7) 25%,
            var(--scribe-secondary, #f0f0f0) 50%,
            var(--scribe-muted, #f7f7f7) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite linear;
        border-radius: var(--scribe-radius-md, 0.375rem);
    }

    @keyframes skeleton-loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
</style>
