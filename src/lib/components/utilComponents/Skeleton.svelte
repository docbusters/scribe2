<script lang="ts">
    let { style = '', class: className = '' }: { style?: string, class?: string } = $props();
</script>

<div class={`skeleton ${className}`} {style}></div>

<style>
    .skeleton {
        background: linear-gradient(
            90deg,
            var(--scribe-muted) 25%,
            var(--scribe-secondary) 50%,
            var(--scribe-muted) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite linear;
        border-radius: var(--scribe-radius-md);
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
