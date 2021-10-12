<script>
	import { onMount } from 'svelte';
	export let tree;
	let treeContainer;
	onMount(() => treeContainer.append(tree.canvas));
</script>

<div id="tree-preview-container">
	<div bind:this={treeContainer} />
</div>

<style>
	#tree-preview-container {
		border-bottom: var(--clr-main) solid var(--stroke-size);
	}

	#tree-preview-container > div {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		position: relative;
		height: 100%;
	}

	:global(#tree-preview-container > div > svg) {
		position: absolute;
		pointer-events: none;
	}
</style>
