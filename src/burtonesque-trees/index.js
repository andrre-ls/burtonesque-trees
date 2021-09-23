import LsSvg from './lsSvg.js';
import GeneController from './genes.js';

// p5js
// https://p5js.org/
const _p5 = new p5(() => {});

// settings
const SVG_RESOLUTION = [512, 512];
const BASE_COORDS = [256, 512];

// globals
let genome = null;
let canvas = null;
let seed = null;

const init = () => {
	// define starting parameters and seed
	genome = GeneController.defaultGenome();
	seed = parseInt(Math.random() * 100000);

	// create canvas
	canvas = new LsSvg(SVG_RESOLUTION[0], SVG_RESOLUTION[1], 'tree');

	return canvas.node;
};

// recursively build branch
const buildBranch = (trunk, branches, parentIndex, branchRange, direction, curvedAng, fromtrunk = false) => {
	if (branches.nodes[parentIndex] !== undefined && branches.nodes[parentIndex].d >= genome.max_branch_depth) return;

	// Branch sprouted from the trunk, as opposed to from another branch
	if (fromtrunk) {
		branches.nodes.push({
			x: trunk.nodes[parentIndex].x,
			y: trunk.nodes[parentIndex].y,
			d: 0,
			oldest: 0,
			creator: branches.nodes.length,
		});
		parentIndex = branches.nodes.length - 1;
	}

	// length and angle. Branches are placed with a radius and angle
	const branchLength = branchRange - _p5.random() * genome.branch_short_factor * branchRange;
	let branchAngle = _p5.random(Math.PI - genome.branch_angle_range, Math.PI + genome.branch_angle_range);

	// set side of the tree (left or right)
	const inverter = direction < genome.left_right_bias ? -1 : 1;
	if (inverter < 0) branchAngle -= Math.PI;

	// spiral operations
	if (curvedAng !== false) {
		const spiralBranchAngle = curvedAng + (inverter * genome.spiral_factor * Math.PI) / 2 + (inverter * Math.PI) / 48;
		branchAngle = branchAngle * (1 - genome.spiral_amount) + spiralBranchAngle * genome.spiral_amount;
	}

	// create new branch node
	const newBranchNode = {
		x: branches.nodes[parentIndex].x + branchLength * Math.cos(branchAngle),
		y: branches.nodes[parentIndex].y + branchLength * Math.sin(branchAngle),
		d: branches.nodes[parentIndex].d + 1,
		creator: branches.nodes[parentIndex].creator,
		oldest: branches.nodes[parentIndex].d + 1,
	};
	const newBranchIndex = branches.nodes.length;

	// cancel if branch is below the ground plane
	if (newBranchNode.y > trunk.nodes[0].y) return;

	// TODO: check if new node intersects with body

	// add branch node
	branches.nodes[newBranchNode.creator].oldest = newBranchNode.d;
	branches.nodes.push(newBranchNode);
	branches.edges.push({
		parent: parentIndex,
		child: newBranchIndex,
	});

	// Fork branch
	if (_p5.random() < genome.fork_prob) {
		buildBranch(trunk, branches, newBranchIndex, branchLength, direction, branchAngle + (Math.PI / 2) * genome.spiral_factor);
		buildBranch(trunk, branches, newBranchIndex, branchLength, 3, branchAngle - (Math.PI / 2) * genome.spiral_factor);
	} else if (_p5.random() > genome.stop_branch_prob) {
		// Continue on current branch
		buildBranch(trunk, branches, newBranchIndex, branchLength, direction, branchAngle);
	}
};

// recursively build tree
const buildTree = (index, trunk, branches) => {
	if (trunk.nodes.length >= genome.trunk_size) return;

	const constraint = Math.min(1, _p5.map(index, 0, 3, 0, 1)); // What is this? I don't remember
	const newNode = {
		x: trunk.nodes[index].x + constraint * (_p5.random() * genome.trunk_range_x * 2 - genome.trunk_range_x),
		y: trunk.nodes[index].y - _p5.random() * genome.trunk_range_y,
		d: trunk.nodes[index].d + 1,
	};
	const newIndex = trunk.nodes.length;

	// add new node to trunk
	trunk.nodes.push(newNode);
	trunk.edges.push({ parent: newIndex, child: index });

	// probability of sprouting branch. Based on current depth and trunk size
	let calculatedBranchProbability = _p5.map(newNode.d, 0, genome.trunk_size, genome.branch_prob - genome.branch_prob * genome.depth_branch_bias, genome.branch_prob);

	// triple the probability of sprouting branch when at the end of the tree
	if (trunk.nodes.length === genome.trunk_size) calculatedBranchProbability *= 3;

	if (_p5.random() < calculatedBranchProbability) buildBranch(trunk, branches, newIndex, genome.branch_range, _p5.random(), false, true);
	buildTree(newIndex, trunk, branches);
};

// renders trunk as rects and branches as ellipses
const debugRenderer = (trunk, branches) => {
	// trunk
	const trunkLayer = canvas.layer('trunk');
	for (let trunkNode of trunk.nodes) trunkLayer.rect(trunkNode.x - 10, trunkNode.y - 10, 20, 20, { fill: 'rgba(0, 0, 255, 0.5)', stroke: 'rgba(0, 0, 255, 1)' });
	let trunkPathString = '';
	for (let trunkEdge of trunk.edges) {
		const [parent, child] = [trunk.nodes[trunkEdge.parent], trunk.nodes[trunkEdge.child]];
		trunkPathString += `M${parent.x} ${parent.y} L${child.x} ${child.y}`;
	}
	trunkLayer.path(trunkPathString, { id: 'trunk-edges', stroke: 'rgba(0, 0, 255, 1)' });

	// branches
	const branchLayer = canvas.layer('branches');
	for (let branchNode of branches.nodes) branchLayer.ellipse(branchNode.x, branchNode.y, 10, 10, { fill: 'rgba(255, 0, 0, 0.5)', stroke: 'rgba(255, 0, 0, 1)' });
	let edgePathString = '';
	for (let branchEdge of branches.edges) {
		const [parent, child] = [branches.nodes[branchEdge.parent], branches.nodes[branchEdge.child]];
		edgePathString += `M${parent.x} ${parent.y} L${child.x} ${child.y} `;
	}
	branchLayer.path(edgePathString, { id: 'branch-edges', stroke: 'rgba(255, 0, 0, 1)' });

	return canvas.node;
};

const renderTree = (trunk, branches) => {
	// render trunk polygons
	const rendertrunk = (layer, start, end, startThickness, endThickness) => {
		const resolution = genome.trunk_roughness;
		const roughnessNoiseInc = _p5.random(0.0025, 0.06);
		const roughnessStrength = (_p5.random(endThickness, startThickness) * 2) / 3;

		let angle = Math.atan((end.y - start.y) / (end.x - start.x)) + Math.PI / 2;
		let inverter = 1;
		let svgString = '';

		// point to stitch seams between trunk polygons
		const seamPoints = [];

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

			svgString += `${i === 0 ? 'M' : 'L'}${point.x + (thickness / 2) * inverter * Math.cos(angle)} ${point.y + (thickness / 2) * inverter * Math.sin(angle)}`;

			if (k === 0 || k === 1) seamPoints.push({ x: point.x + (thickness / 2) * inverter * Math.cos(angle), y: point.y + (thickness / 2) * inverter * Math.sin(angle) });
		}

		layer.path(svgString + 'z');
		return seamPoints;
	};

	// stitch gaps between trunk polygons
	const stitchtrunkSeams = (layer, points) => {
		for (let i = 0; i < points.length - 4; i += 4) {
			layer.path(`
					M${points[i].x} ${points[i].y}
					L${points[i + 5].x} ${points[i + 5].y}
					L${points[i + 3].x} ${points[i + 3].y}
					L${points[i + 6].x} ${points[i + 6].y}
					z
				`);
		}
	};

	// call trunk render functions
	let trunkSeams = [];
	const trunkLayer = canvas.layer('trunk');
	trunkLayer.attribute('fill', '#000');

	for (let edge of trunk.edges) {
		const [parent, child] = [trunk.nodes[edge.parent], trunk.nodes[edge.child]];

		let kS = 1 - _p5.map(Math.pow(1 - (1 / (trunk.nodes.length - 1)) * trunk.nodes.indexOf(parent), genome.trunk_exponetial_growth), Math.pow(0, genome.trunk_exponetial_growth), Math.pow(1, genome.trunk_exponetial_growth), 0, 1);
		let kE = 1 - _p5.map(Math.pow(1 - (1 / (trunk.nodes.length - 1)) * trunk.nodes.indexOf(child), genome.trunk_exponetial_growth), Math.pow(0, genome.trunk_exponetial_growth), Math.pow(1, genome.trunk_exponetial_growth), 0, 1);

		const startT = genome.base_thickness + kS * (genome.top_thickness - genome.base_thickness);
		const endT = Math.max(0, genome.base_thickness + kE * (genome.top_thickness - genome.base_thickness));

		const seamPoints = rendertrunk(trunkLayer, parent, child, startT, endT);
		trunkSeams.push.apply(trunkSeams, seamPoints);
	}

	stitchtrunkSeams(trunkLayer, trunkSeams);

	// render branch polygons
	const renderBranch = (layer, start, end, startThickness, endThickness, strength = 12, roughness = 0.05) => {
		const resolution = genome.branch_roughness;

		// also don't remember what this is
		const nStrength = _p5.map(endThickness, genome.branch_start_thickness, genome.branch_end_thickness, strength, strength / 5);

		let angle = Math.atan((end.y - start.y) / (end.x - start.x)) + Math.PI / 2;
		let inverter = 1;
		let svgString = '';

		for (let i = 0; i <= 2 * resolution + 1; i++) {
			let k = (1 / resolution) * i;
			if (i > resolution) {
				k = 1 - (1 / resolution) * (i - 1 - resolution);
				inverter = -1;
			}
			//(a, b) = (x1 + k * (x2 - x1), y1 + k * (y2 - y1))
			const point = { x: start.x + k * (end.x - start.x), y: start.y + k * (end.y - start.y) };
			let offset = (_p5.noise(point.x * roughness, point.y * roughness) - 0.5) * 2 * nStrength * _p5.map(-(Math.pow(k, 2) - k), 0, 0.25, 0, 1);
			if (offset > endThickness / 2 || offset < -endThickness / 2) offset = 0;
			let thickness = startThickness + k * (endThickness - startThickness) + offset;

			svgString += `${i === 0 ? 'M' : 'L'}${point.x + (thickness / 2) * inverter * Math.cos(angle)} ${point.y + (thickness / 2) * inverter * Math.sin(angle)}`;
		}

		layer.path(svgString + 'z');

		// stitching polygon corners with hexagons
		if (start.x > end.x) {
			layer.polygon(start.x, start.y, startThickness, 6, angle + Math.PI, Math.PI * 2 + angle);
			layer.polygon(end.x, end.y, endThickness, 6, angle, Math.PI + angle);
		} else {
			layer.polygon(start.x, start.y, startThickness, 6, angle, Math.PI + angle);
			layer.polygon(end.x, end.y, endThickness, 6, angle + Math.PI, Math.PI * 2 + angle);
		}
	};

	// call branch render functions
	const branchesLayer = canvas.layer('branches');
	branchesLayer.attribute('fill', '#000');
	for (let branchEdge of branches.edges) {
		const [parent, child] = [branches.nodes[branchEdge.parent], branches.nodes[branchEdge.child]];
		const creator = branches.nodes[parent.creator];
		const startT = Math.max(genome.branch_end_thickness, _p5.map(parent.d, 0, creator.oldest, genome.branch_start_thickness, genome.branch_end_thickness));
		const endT = Math.max(genome.branch_end_thickness, _p5.map(child.d, 0, creator.oldest, genome.branch_start_thickness, genome.branch_end_thickness));
		renderBranch(branchesLayer, parent, child, startT, endT);
	}
};

// generate new burton tree
const generate = () => {
	const trunk = { nodes: [], edges: [] };
	const branches = { nodes: [], edges: [] };

	trunk.nodes.push({ x: BASE_COORDS[0], y: BASE_COORDS[1], d: 0 });

	_p5.randomSeed(seed);
	canvas.clear();
	buildTree(0, trunk, branches);

	//debugRenderer(trunk, branches);
	renderTree(trunk, branches);
};

const newSeed = () => (seed = parseInt(Math.random() * 100000));
const randomizeGenome = () => (genome = GeneController.randomGenome());

const changeGene = (gene, _value) => {
	const value = GeneController.validateGene(gene, _value);
	if (value === false) return;
	genome[gene] = value;
	generate();
};

export default { init, generate, randomizeGenome, newSeed, genome };
