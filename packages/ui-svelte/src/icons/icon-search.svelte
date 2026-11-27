<script lang="ts">
  import Icon from "./icon.svelte";
  import type { IconProps } from "./index.js";
  let props: IconProps = $props();
</script>

<Icon {...props} name="IconSearch" />
