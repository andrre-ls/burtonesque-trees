<script>
	import TreeControls from './components/TreeControls.svelte';
	import TreePreview from './components/TreePreview.svelte';
	import BurtonTree from './burtonesque-trees';
	import { updateColourMode } from './ui-utils/colourMode.js';

	let isLightMode = true;

	const tree = new BurtonTree([1024, 1024]);
	tree.generate();

	// switch between light and dark mode
	const handleSwitchColourMode = () => {
		isLightMode = !isLightMode;
		const modeStr = isLightMode ? 'LIGHT' : 'DARK';
		updateColourMode(modeStr);
		
		// invert tree. I did it this way to keep the export colour consistent — a black silhouette
		tree.canvas.style.filter = isLightMode ? null : 'invert()';
	};

</script>

<main>
	<header>
		<ul class="no-select">
			<li id="header-title">Burton<i>esque</i> Trees</li>
			<li class="header-bttn">About</li>
			<li class="header-bttn" on:click={handleSwitchColourMode}>{isLightMode ? 'Dark Mode' : 'Light Mode'}</li>
		</ul>
	</header>

	<div id="main-container">
		<TreeControls {tree} />
		<TreePreview {tree} />
	</div>
</main>

<style>
	main {
		display: grid;
		grid-template-rows: calc(1.5rem + var(--page-margin)) auto;
		grid-row-gap: 3rem;
		margin: var(--page-margin);
		margin-top: 0;
		position: fixed;
		width: calc(100vw - 2 * var(--page-margin));
		height: calc(100vh - var(--page-margin));
	}

	header {
		position: relative;
		font-weight: 500;
		width: 100%;
		color: var(--clr-main);
	}

	header > ul {
		position: absolute;
		bottom: 0;
		padding: 0;
		margin: 0;
	}

	header > ul > li {
		vertical-align: baseline;
		display: inline-block;
		margin-left: 1.75rem;
		padding: 0.75rem 1.5rem;
		color: var(--clr-main);
	}

	#header-title {
		font-weight: bold;
		font-size: 1.5rem;
		margin: 0;
		padding-left: 0;
	}

	#header-title > i {
		font-size: 1.5rem;
	}

	.header-bttn {
		cursor: pointer;
	}

	.header-bttn:hover {
		color: var(--clr-hover);
	}

	#main-container {
		display: grid;
		grid-template-columns: var(--side-bar-width) auto;
		grid-column-gap: 4.5rem;
	}
</style>
