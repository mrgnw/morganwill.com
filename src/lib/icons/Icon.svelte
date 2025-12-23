<script>
  /**
   * Generic icon component that renders SVG from data props
   * Supports any icon by passing viewBox and content
   */
  let {
    size = '1em',
    viewBox = '0 0 24 24',
    content = '',
    class: className = ''
  } = $props();
</script>

<svg
  class={className}
  style="width: {size}; height: {size};"
  {viewBox}
  xmlns="http://www.w3.org/2000/svg"
  fill="currentColor"
  aria-hidden="true"
>
  {@html content}
</svg>

<style>
  svg {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    pointer-events: none;
  }
</style>
