<script>
	import TreeControls from './components/TreeControls.svelte';
	import TreePreview from './components/TreePreview.svelte';
	import BurtonTree from './burtonesque-trees';

	const tree = new BurtonTree();
	tree.generate();
</script>

<main>
	<TreePreview {tree} />
	<TreeControls {tree} />
</main>

<style>
</style>
