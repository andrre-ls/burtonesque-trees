<script>
	import TreeControls from './components/TreeControls.svelte';
	import TreePreview from './components/TreePreview.svelte';
	import BurtonTree from './burtonesque-trees';
	import { updateColourMode } from './ui-utils/colourMode.js';

	let isLightMode = true;
	let showAbout = true; // TODO: should be false
	let treeControlsComponent;

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

	// show and hide about card
	const handleToggleAbout = () => {
		showAbout = !showAbout;
		tree.generate(showAbout);
		if (showAbout) treeControlsComponent.collapseLayout();
	};

	const closeAbout = () => {
		showAbout = false;
		tree.generate(showAbout);
	};
</script>

<main>
	<header>
		<ul class="no-select">
			<li id="header-title">Burton<i>esque</i> Trees</li>
			<li class="header-bttn" id="colour-mode-bttn" on:click={handleSwitchColourMode}>{isLightMode ? 'Dark Mode' : 'Light Mode'}</li>
			<li class="header-bttn" on:click={handleToggleAbout} style={showAbout ? 'opacity: 0.5' : ''}>{showAbout ? 'Close About' : 'About'}</li>
		</ul>
	</header>

	<div id="main-container">
		<TreeControls bind:this={treeControlsComponent} {tree} {closeAbout} debugStyle={showAbout} />
		<TreePreview {tree} />

		{#if showAbout}
			<section id="about">
				<div class="section-title-button-cont">
					<h3 class="section-title">About</h3>
					<span on:click={closeAbout}>close about</span>
				</div>
				<div id="about-content">
					<div>
						<p>
							This is a simple generative design project centred on creating SVG tree silhouettes inspired by the visual aesthetic most commonly attributed to
							<a target="_blank" href="https://en.wikipedia.org/wiki/Tim_Burton">Tim Burton</a>. Each tree is randomly generated based on a unique seed and a set of parameters.
						</p>
						<h4>Credits</h4>
						<p>
							The tree generator script relies on the <i>random()</i> and <i>noise()</i> methods of
							<a target="_blank" href="https://p5js.org/">p5.js</a>, and the user interface you are looking at was built with
							<a target="_blank" href="https://svelte.dev/">Svelte</a>. The user interface typeface is
							<a target="_blank" href="https://fonts.google.com/specimen/IBM+Plex+Mono?query=ibm#standard-styles">IBM Plex Mono</a>.
						</p>
						<p id="its-aaa-me">
							// ---------------------------
							<a target="_blank" href="https://github.com/andrre-ls">André Santos</a>, 2021
						</p>
					</div>
				</div>
			</section>
		{/if}
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

	#colour-mode-bttn {
		width: 5.5rem;
		white-space: nowrap;
	}

	#main-container {
		display: grid;
		grid-template-columns: var(--side-bar-width) auto;
		grid-column-gap: 4.5rem;
		position: relative;
	}

	/* ABOUT */
	#about {
		position: absolute;
		left: calc(var(--side-bar-width) + 4.5rem);
		z-index: 20000;
	}

	#about-content {
		width: var(--about-content-width);
		border: var(--stroke-size) solid var(--clr-main);
		border-radius: var(--stroke-size);
		background-color: var(--clr-background);
	}

	#about-content > div {
		padding: 0.5rem 1.5rem;
	}

	#about-content p {
		font-weight: 400;
		line-height: 1.5rem;
		color: var(--clr-main);
		text-align: justify;
		hyphens: auto;
	}

	#about-content h4 {
		font-weight: 700;
		margin-top: 2rem;
		margin-bottom: 0;
	}

	#about-content a {
		text-decoration: underline;
		color: var(--clr-main);
	}

	#about-content a:hover {
		color: var(--clr-hover);
		cursor: pointer;
	}

	#about-content #its-aaa-me {
		margin-top: 2rem;
	}

	#its-aaa-me > a {
		text-decoration: none;
	}
</style>
