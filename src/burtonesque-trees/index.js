import p5 from 'p5';
import Asvg from '../Asvg';
import { genomeStructure, randomGenomeBoundOverrides } from './genomeStructure.js';
import { downloadFile, countDecimals } from './utils.js';

// https://p5js.org/
const _p5 = new p5(() => {});

// remove anoying default p5 <canvas>
(function () {
	window.addEventListener('load', () => {
		const p5Canvas = document.getElementById('defaultCanvas0');
		if (p5Canvas) p5Canvas.remove();
	});
})();

// SETTINGS -- might move this to its own file
const BASE_ANGLE = -Math.PI / 4;
const ANGLE_RANGE = [-Math.PI / 2, Math.PI / 3];
const SPIRAL_FACTOR = Math.PI / 48;
const DOWNLOAD_PNG_HEIGHT = 2048;

// SVG styles
const stylesheet = { fill: 'rgba(0, 0, 0, 1)', stroke: 'rgba(0, 0, 0, 1)', 'stroke-width': '1px', 'stroke-linejoin': 'round' };
const debugStylesheet = {
	trunk: { fill: 'rgba(0, 0, 0, 0.25)', stroke: 'rgba(0, 0, 0, 0.5)', 'stroke-width': '1px' },
	branch: { fill: 'rgba(0, 0, 0, 0.25)', stroke: 'rgba(0, 0, 0, 0.5)', 'stroke-width': '1px' },
	trunk_gap: { fill: 'rgba(0, 0, 200, 0.25)', stroke: 'rgba(0, 0, 0, 0.5)', 'stroke-width': '1px' },
	branch_gap: { fill: 'rgba(200, 0, 0, 0.25)', stroke: 'rgba(0, 0, 0, 0.5)', 'stroke-width': '1px' },
	trunk_branch_gap: { fill: 'rgba(0, 200, 0, 0.25)', stroke: 'rgba(0, 0, 0, 0.5)', 'stroke-width': '1px' },
};
let activeStylesheet = stylesheet;

class BurtonesqueTree {
	constructor(_canvasSize, _baseCoords) {
		// define starting parameters and seed
		this.genome = {};
		this.resetGenome();
		this.seed = parseInt(Math.random() * 100000);

		// create canvas
		this.canvasSize = _canvasSize ?? [512, 512];
		this.baseCoords = _baseCoords ?? [this.canvasSize[0] / 2, this.canvasSize[1]];
		this.treeCanvas = new Asvg(this.canvasSize[0], this.canvasSize[1], 'tree');
	}

	// set new seed
	newSeed(_seed) {
		this.seed = _seed ?? parseInt(Math.random() * 1000000);
	}

	// fill genome with default values
	resetGenome() {
		for (const geneName of Object.keys(genomeStructure)) this.genome[geneName] = genomeStructure[geneName].default;
	}

	// change single gene
	updateGene(gene, value) {
		if (!(gene in this.genome)) return;
		this.genome[gene] = value;
	}

	// TODO:
	// randomize entire genome
	randomizeGenome() {
		for (const gene of Object.keys(genomeStructure)) {
			const bounds = randomGenomeBoundOverrides[gene] ?? [genomeStructure[gene].min, genomeStructure[gene].max];
			let randomValue = bounds[0] + Math.random() * (bounds[1] - bounds[0]);

			if (gene === 'spiral_amount') randomValue = Math.random() > 0.5 ? 0 : randomValue;

			// make sure the new value matches the predefined decimal count of the gene
			this.genome[gene] = Number(randomValue.toFixed(countDecimals(genomeStructure[gene].step)));
		}

		// prevent end thicknessess from being greater than start thicknesses -- avoids weird-looking trees
		if (this.genome['base_thickness'] < this.genome['top_thickness']) [this.genome['base_thickness'], this.genome['top_thickness']] = [this.genome['top_thickness'], this.genome['base_thickness']];
		if (this.genome['branch_start_thickness'] < this.genome['branch_end_thickness']) [this.genome['branch_start_thickness'], this.genome['branch_end_thickness']] = [this.genome['branch_end_thickness'], this.genome['branch_start_thickness']];
	}

	// recursively build branch
	buildBranch(trunk, branches, parentIndex, _trunkSide = null, lastAngle = null, lastLength = null) {
		if (branches.nodes[parentIndex] !== undefined && branches.nodes[parentIndex].d >= this.genome.max_branch_depth) return;

		// side of tree the branch is on (left: < 0.5, right: > 0.5);
		const trunkSide = _trunkSide ?? _p5.random();

		// branch sprouted from trunk and first node needs to be created
		if (lastAngle === null) {
			branches.nodes.push({
				x: trunk.nodes[parentIndex].x,
				y: trunk.nodes[parentIndex].y,
				d: 0,
				oldest: 0,
				creator: branches.nodes.length,
				trunk_creator: parentIndex,
			});
			parentIndex = branches.nodes.length - 1;
		}

		lastLength = lastLength ?? this.genome.branch_range;
		const branchLength = _p5.random() * this.genome.branch_short_factor * lastLength + lastLength * (1 - this.genome.branch_short_factor);

		// branch Angle
		let branchAngle = 0;
		// const randomAngle = BASE_ANGLE + _p5.random(-this.genome.branch_angle_range, this.genome.branch_angle_range) * ANGLE_RANGE;
		const randomAngle = BASE_ANGLE + _p5.random(ANGLE_RANGE[0], ANGLE_RANGE[1]);

		// random branches or spiral branches
		if (this.genome.spiral_amount === 0 || lastAngle === null) {
			branchAngle = randomAngle;
			// place on left side
			if (trunkSide > this.genome.left_right_bias) branchAngle = Math.PI - branchAngle;
		} else {
			const inverter = trunkSide > this.genome.left_right_bias ? -1 : 1;
			branchAngle = lastAngle + inverter * _p5.random() * (Math.PI - SPIRAL_FACTOR) * this.genome.spiral_amount;
		}

		// create new branch node
		const newBranchNode = {
			x: branches.nodes[parentIndex].x + branchLength * Math.cos(branchAngle),
			y: branches.nodes[parentIndex].y + branchLength * Math.sin(branchAngle),
			d: branches.nodes[parentIndex].d + 1,
			creator: branches.nodes[parentIndex].creator,
			oldest: branches.nodes[parentIndex].d + 1,
			trunk_creator: branches.nodes[parentIndex].trunk_creator,
		};
		const newBranchIndex = branches.nodes.length;

		// cancel if branch is below the ground plane
		if (newBranchNode.y + 10 > trunk.nodes[0].y) return;

		// add branch node
		branches.nodes[newBranchNode.creator].oldest = newBranchNode.d;
		branches.nodes.push(newBranchNode);
		branches.edges.push({
			parent: parentIndex,
			child: newBranchIndex,
		});

		// cut branch short
		if (_p5.random() < this.genome.stop_branch_prob) return;

		// fork branch
		if (_p5.random() < this.genome.fork_prob) {
			// up
			const upAngleOffset = _p5.random(this.genome.branch_angle_range) * (Math.PI / 7);
			this.buildBranch(trunk, branches, newBranchIndex, trunkSide, branchAngle + upAngleOffset, branchLength);

			// down
			const downAngleOffset = -_p5.random(this.genome.branch_angle_range) * (Math.PI / 7);
			this.buildBranch(trunk, branches, newBranchIndex, trunkSide, branchAngle + downAngleOffset, branchLength);

			// OH DAMNNN, triple fork!!!!
			if (_p5.random() < this.genome.fork_porb / 10) this.buildBranch(trunk, branches, newBranchIndex, trunkSide, branchAngle, branchLength);
		} else {
			// no fork
			this.buildBranch(trunk, branches, newBranchIndex, trunkSide, branchAngle, branchLength);
		}
	}

	// recursively build tree
	buildTree(index, trunk, branches) {
		if (trunk.nodes.length >= this.genome.trunk_size) return;

		// force trunk to be straighter (aka point upwards) at the base
		const straightnessConstraint = Math.min(1, _p5.map(index, 0, this.genome.inc_straightness, 0, 1));

		const newNode = {
			x: trunk.nodes[index].x + straightnessConstraint * _p5.random(-this.genome.trunk_range_x, this.genome.trunk_range_x),
			y: trunk.nodes[index].y - _p5.random() * this.genome.trunk_range_y - 3,
			d: trunk.nodes[index].d + 1,
		};
		const newIndex = trunk.nodes.length;

		// add new node to trunk
		trunk.nodes.push(newNode);
		trunk.edges.push({ parent: index, child: newIndex });

		// probability of sprouting branch. Based on current depth and trunk size
		let calculatedBranchProbability = _p5.map(newNode.d, 0, this.genome.trunk_size, this.genome.branch_prob - this.genome.branch_prob * this.genome.depth_branch_bias, this.genome.branch_prob);

		//	triple the probability of sprouting branch when at the end of the tree
		if (trunk.nodes.length === this.genome.trunk_size) calculatedBranchProbability *= 3;

		if (index > 1 && _p5.random() < calculatedBranchProbability) this.buildBranch(trunk, branches, newIndex);

		this.buildTree(newIndex, trunk, branches);
	}

	// render a polygon between two edges
	renderEdgeGapPolygon(layer, end1Pos, angle1, thickness1, start2Pos, angle2, thickness2, styleAttributes = {}) {
		layer.beginShape(styleAttributes);
		layer.vertex(end1Pos.x - (thickness1 / 2) * Math.cos(angle1), end1Pos.y - (thickness1 / 2) * Math.sin(angle1));
		layer.vertex(start2Pos.x - (thickness2 / 2) * Math.cos(angle2), start2Pos.y - (thickness2 / 2) * Math.sin(angle2));
		layer.vertex(end1Pos.x + (thickness1 / 2) * Math.cos(angle1), end1Pos.y + (thickness1 / 2) * Math.sin(angle1));
		layer.vertex(start2Pos.x + (thickness2 / 2) * Math.cos(angle2), start2Pos.y + (thickness2 / 2) * Math.sin(angle2));
		layer.endShape();
	}

	// render trunk polygons
	renderTrunk(layer, start, end, startThickness, endThickness, lastEnd) {
		const resolution = this.genome.trunk_roughness;
		const roughnessNoiseInc = _p5.random(0.0025, 0.07);
		const roughnessStrength = _p5.map(this.genome.trunk_roughness, genomeStructure.trunk_roughness.min, genomeStructure.trunk_roughness.max, 0, 1) * (_p5.random(startThickness, endThickness) / 2);

		let angle = Math.atan((end.y - start.y) / (end.x - start.x)) + Math.PI / 2;
		let inverter = 1;

		// create new shape
		layer.beginShape();
		for (let i = 0; i <= 2 * resolution + 1; i++) {
			let k = (1 / resolution) * i;
			if (i > resolution) {
				k = 1 - (1 / resolution) * (i - 1 - resolution);
				inverter = -1;
			}

			//(a, b) = (x1 + k * (x2 - x1), y1 + k * (y2 - y1))
			const point = { x: start.x + k * (end.x - start.x), y: start.y + k * (end.y - start.y) };
			let offset = (_p5.noise(point.x * roughnessNoiseInc, point.y * roughnessNoiseInc) - 0.5) * 2 * roughnessStrength * _p5.map(-(Math.pow(k, 2) - k), 0, 0.25, 0, 1);
			if (offset > endThickness / 2 || offset < -endThickness / 2) offset = 0;
			let thickness = startThickness + k * (endThickness - startThickness) + offset;

			// add single point to created shape
			layer.vertex(point.x + (thickness / 2) * inverter * Math.cos(angle), point.y + (thickness / 2) * inverter * Math.sin(angle));
		}
		// close shape
		layer.endShape(true);

		// fill gap between this and last trunk edge
		if (lastEnd) {
			const lastEndAng = Math.atan((lastEnd[1].y - lastEnd[0].y) / (lastEnd[1].x - lastEnd[0].x)) + Math.PI / 2;
			this.renderEdgeGapPolygon(layer, lastEnd[1], lastEndAng, lastEnd[2], start, angle, startThickness, activeStylesheet.trunk_gap || activeStylesheet);
		}
	}

	// render branch polygons
	renderBranch(layer, start, end, startThickness, endThickness, lastEnd) {
		const resolution = this.genome.branch_roughness;
		const roughnessNoiseInc = _p5.random(0.0025, 0.07);
		const roughnessStrength = _p5.map(this.genome.branch_roughness, genomeStructure.branch_roughness.min, genomeStructure.branch_roughness.max, 0, 1) * 2 * (_p5.random(startThickness, endThickness) / 3);

		const angle = Math.atan((end.y - start.y) / (end.x - start.x)) + Math.PI / 2;
		let inverter = 1;

		// create new shape
		layer.beginShape();
		for (let i = 0; i <= 2 * resolution + 1; i++) {
			let k = (1 / resolution) * i;
			if (i > resolution) {
				k = 1 - (1 / resolution) * (i - 1 - resolution);
				inverter = -1;
			}
			//(a, b) = (x1 + k * (x2 - x1), y1 + k * (y2 - y1))
			const point = { x: start.x + k * (end.x - start.x), y: start.y + k * (end.y - start.y) };
			let offset = (_p5.noise(point.x * roughnessNoiseInc, point.y * roughnessNoiseInc) - 0.5) * 2 * roughnessStrength * _p5.map(-(Math.pow(k, 2) - k), 0, 0.25, 0, 1);
			if (offset > endThickness / 2 || offset < -endThickness / 2) offset = 0;
			let thickness = startThickness + k * (endThickness - startThickness) + offset;

			// add single point to created shape
			layer.vertex(point.x + (thickness / 2) * inverter * Math.cos(angle), point.y + (thickness / 2) * inverter * Math.sin(angle));
		}
		// close shape
		layer.endShape(true);

		// fill gap between this and last branch edge
		if (lastEnd) {
			const lastEndAng = Math.atan((lastEnd[1].y - lastEnd[0].y) / (lastEnd[1].x - lastEnd[0].x)) + Math.PI / 2;
			this.renderEdgeGapPolygon(layer, lastEnd[1], lastEndAng, lastEnd[2], start, angle, startThickness, activeStylesheet.branch_gap || activeStylesheet);
		}
	}

	// render whole tree
	renderTree(trunk, branches) {
		// call trunk render functions
		let trunkThicknesses = [];
		const trunkLayer = this.treeCanvas.createLayer('trunk');
		trunkLayer.setAttributeMult(activeStylesheet.trunk || activeStylesheet);
		let lastTrunkEnd = null;
		for (let edge of trunk.edges) {
			const [parent, child] = [trunk.nodes[edge.parent], trunk.nodes[edge.child]];

			let kS = 1 - _p5.map(Math.pow(1 - (1 / (trunk.nodes.length - 1)) * trunk.nodes.indexOf(parent), this.genome.trunk_exponetial_growth), Math.pow(0, this.genome.trunk_exponetial_growth), Math.pow(1, this.genome.trunk_exponetial_growth), 0, 1);
			let kE = 1 - _p5.map(Math.pow(1 - (1 / (trunk.nodes.length - 1)) * trunk.nodes.indexOf(child), this.genome.trunk_exponetial_growth), Math.pow(0, this.genome.trunk_exponetial_growth), Math.pow(1, this.genome.trunk_exponetial_growth), 0, 1);

			const startT = this.genome.base_thickness + kS * (this.genome.top_thickness - this.genome.base_thickness);
			const endT = Math.max(0, this.genome.base_thickness + kE * (this.genome.top_thickness - this.genome.base_thickness));

			this.renderTrunk(trunkLayer, parent, child, startT, endT, lastTrunkEnd);
			trunkThicknesses[edge.parent] = startT;
			trunkThicknesses[edge.child] = endT;

			lastTrunkEnd = [parent, child, endT];
		}

		// call branch render functions
		const branchesLayer = this.treeCanvas.createLayer('branches');
		branchesLayer.setAttributeMult(activeStylesheet.branch || activeStylesheet);
		let lastBranchEnd = null;
		for (let branchEdge of branches.edges) {
			const [parent, child] = [branches.nodes[branchEdge.parent], branches.nodes[branchEdge.child]];
			const creator = branches.nodes[parent.creator];

			const trunkCreatorThickness = trunkThicknesses[parent.trunk_creator] ?? this.genome.top_thickness;
			let startT = Math.min(trunkCreatorThickness, Math.max(this.genome.branch_end_thickness, _p5.map(parent.d, 0, creator.oldest, this.genome.branch_start_thickness, this.genome.branch_end_thickness)));
			const endT = Math.min(trunkCreatorThickness, Math.max(this.genome.branch_end_thickness, _p5.map(child.d, 0, creator.oldest, this.genome.branch_start_thickness, this.genome.branch_end_thickness)));

			// make last branch start out with the same thickness as the top of the tree — again, to avoid weird-looking stuff
			if (parent.trunk_creator + 1 === trunk.nodes.length && parent.d === 0) startT = this.genome.top_thickness;

			// filter lastEnd to pass null when a new branch is started
			const lastEndFiltered = lastBranchEnd && parent === lastBranchEnd[1] ? lastBranchEnd : null;
			this.renderBranch(branchesLayer, parent, child, startT, endT, lastEndFiltered);

			// branch end cap -- if at the end of current branch, render an hexagonal cap
			if (lastEndFiltered === null && lastBranchEnd !== null) {
				const branchEndAng = Math.atan((lastBranchEnd[1].y - lastBranchEnd[0].y) / (lastBranchEnd[1].x - lastBranchEnd[0].x)) + Math.PI / 2;
				branchesLayer.nAgon(lastBranchEnd[1].x, lastBranchEnd[1].y, lastBranchEnd[2], 6, branchEndAng, 0, Math.PI * 2, activeStylesheet.branch || activeStylesheet);
			}

			// save positions and thickness of last branch edge
			lastBranchEnd = [parent, child, endT];

			// branch sprouted from last branch node.
			// fill the gap between the trunk and the last branch
			if (parent.trunk_creator === lastTrunkEnd[1].d && parent.d === 0) {
				const trunkEndAng = Math.atan((lastTrunkEnd[1].y - lastTrunkEnd[0].y) / (lastTrunkEnd[1].x - lastTrunkEnd[0].x)) + Math.PI / 2;
				const branchStartAng = Math.atan((child.y - parent.y) / (child.x - parent.x)) + Math.PI / 2;
				this.renderEdgeGapPolygon(branchesLayer, lastTrunkEnd[1], trunkEndAng, lastTrunkEnd[2], parent, branchStartAng, startT, activeStylesheet.trunk_branch_gap || activeStylesheet);
			}
		}

		// draws last branch's cap -- it doesn't do it inside the for loop because the end-of-branch check runs 1 loop behind.
		if (lastBranchEnd !== null) {
			const branchEndAng = Math.atan((lastBranchEnd[1].y - lastBranchEnd[0].y) / (lastBranchEnd[1].x - lastBranchEnd[0].x)) + Math.PI / 2;
			branchesLayer.nAgon(lastBranchEnd[1].x, lastBranchEnd[1].y, lastBranchEnd[2], 6, branchEndAng, 0, Math.PI * 2, activeStylesheet.branch || activeStylesheet);
		}
	}

	// generate new burton tree
	generate(debug = false) {
		const trunk = { nodes: [], edges: [] };
		const branches = { nodes: [], edges: [] };

		// choose SVG stylesheet
		activeStylesheet = debug ? debugStylesheet : stylesheet;

		// create first trunk node at the bottm of  the canvas
		trunk.nodes.push({ x: this.baseCoords[0], y: this.baseCoords[1], d: 0 });

		_p5.randomSeed(this.seed);
		_p5.noiseSeed(this.seed);
		this.treeCanvas.clear();
		this.buildTree(0, trunk, branches);
		this.renderTree(trunk, branches);
	}

	// download tree as SVG
	exportSvg() {
		const svgUrl = URL.createObjectURL(this.treeCanvas.getSvg(true));
		downloadFile(svgUrl, 'burtonesque-tree.svg');
	}

	// download tree as PNG
	async exportPng() {
		// tree as png
		const treeImage = await this.treeCanvas.getPng(DOWNLOAD_PNG_HEIGHT);

		// convert image to canvas
		const canvas = document.createElement('canvas');
		canvas.width = treeImage.width;
		canvas.height = treeImage.height;
		canvas.getContext('2d').drawImage(treeImage, 0, 0);
		const canvasUrl = canvas.toDataURL();

		downloadFile(canvasUrl, 'burtonesque-tree.png');
	}

	get canvas() {
		return this.treeCanvas.node;
	}
}

export default BurtonesqueTree;
