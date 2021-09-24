<script>
	import { onMount } from 'svelte';
	export let tree;
	let treeContainer;

	onMount(() => treeContainer.append(tree.canvas));
</script>

<div>
	<div id="tree-container" bind:this={treeContainer} />
</div>

<style>
	#tree-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: none;
	}
</style>
