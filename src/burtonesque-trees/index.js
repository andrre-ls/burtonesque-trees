import p5 from 'p5';
import LsSvg from './lsSvg.js';
import genomeStructure from './genomeStructure.js';
import { countDecimals } from './utils.js';

// p5js
// https://p5js.org/
const _p5 = new p5(() => {});

// remove anoying default p5 <canvas>
(function () {
	const p5Canvas = document.getElementById('defaultCanvas0');
	if (p5Canvas) p5Canvas.remove();
})();

class BurtonesqueTree {
	constructor(_canvasSize, _baseCoords) {
		// define starting parameters and seed
		this.genome = {};
		this.defaultGenome();
		this.seed = parseInt(Math.random() * 100000);

		// create canvas
		this.canvasSize = _canvasSize ?? [512, 512];
		this.baseCoords = _baseCoords ?? [256, 512];
		this.treeCanvas = new LsSvg(this.canvasSize[0], this.canvasSize[1], 'tree');
	}

	// set new seed
	newSeed(_seed) {
		this.seed = _seed ?? parseInt(Math.random() * 100000);
	}

	// fill genome with default values
	defaultGenome() {
		for (const geneName of Object.keys(genomeStructure)) this.genome[geneName] = genomeStructure[geneName].default;
	}

	// randomize entire genome
	randomizeGenome() {
		for (const geneName of Object.keys(genomeStructure)) {
			this.genome[geneName] = genomeStructure[geneName].min + Math.random() * (genomeStructure[geneName].max - genomeStructure[geneName].min);
			this.genome[geneName] = Number(this.genome[geneName].toFixed(countDecimals(genomeStructure[geneName].step)));
		}
	}

	// recursively build branch
	buildBranch(trunk, branches, parentIndex, branchRange, direction, curvedAng, fromtrunk = false) {
		if (branches.nodes[parentIndex] !== undefined && branches.nodes[parentIndex].d >= this.genome.max_branch_depth) return;

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
		const branchLength = branchRange - _p5.random() * this.genome.branch_short_factor * branchRange;
		let branchAngle = _p5.random(Math.PI - this.genome.branch_angle_range, Math.PI + this.genome.branch_angle_range);

		// set side of the tree (left or right)
		const inverter = direction < this.genome.left_right_bias ? -1 : 1;
		if (inverter < 0) branchAngle -= Math.PI;

		// spiral operations
		if (curvedAng !== false) {
			const spiralBranchAngle = curvedAng + (inverter * this.genome.spiral_factor * Math.PI) / 2 + (inverter * Math.PI) / 48;
			branchAngle = branchAngle * (1 - this.genome.spiral_amount) + spiralBranchAngle * this.genome.spiral_amount;
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
		if (_p5.random() < this.genome.fork_prob) {
			this.buildBranch(trunk, branches, newBranchIndex, branchLength, direction, branchAngle + (Math.PI / 2) * this.genome.spiral_factor);
			this.buildBranch(trunk, branches, newBranchIndex, branchLength, 3, branchAngle - (Math.PI / 2) * this.genome.spiral_factor);
		} else if (_p5.random() > this.genome.stop_branch_prob) {
			// Continue on current branch
			this.buildBranch(trunk, branches, newBranchIndex, branchLength, direction, branchAngle);
		}
	}

	// recursively build tree
	buildTree(index, trunk, branches) {
		if (trunk.nodes.length >= this.genome.trunk_size) return;

		const constraint = Math.min(1, _p5.map(index, 0, 3, 0, 1)); // What is this? I don't remember
		const newNode = {
			x: trunk.nodes[index].x + constraint * (_p5.random() * this.genome.trunk_range_x * 2 - this.genome.trunk_range_x),
			y: trunk.nodes[index].y - _p5.random() * this.genome.trunk_range_y,
			d: trunk.nodes[index].d + 1,
		};
		const newIndex = trunk.nodes.length;

		// add new node to trunk
		trunk.nodes.push(newNode);
		trunk.edges.push({ parent: newIndex, child: index });

		// probability of sprouting branch. Based on current depth and trunk size
		let calculatedBranchProbability = _p5.map(newNode.d, 0, this.genome.trunk_size, this.genome.branch_prob - this.genome.branch_prob * this.genome.depth_branch_bias, this.genome.branch_prob);

		// triple the probability of sprouting branch when at the end of the tree
		if (trunk.nodes.length === this.genome.trunk_size) calculatedBranchProbability *= 3;

		if (_p5.random() < calculatedBranchProbability) this.buildBranch(trunk, branches, newIndex, this.genome.branch_range, _p5.random(), false, true);
		this.buildTree(newIndex, trunk, branches);
	}

	// render trunk polygons
	renderTrunk(layer, start, end, startThickness, endThickness) {
		const resolution = this.genome.trunk_roughness;
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
	}

	// stitch seams between trunk polygons
	stitchtrunkSeams(layer, points) {
		for (let i = 0; i < points.length - 4; i += 4) {
			layer.path(`
					M${points[i].x} ${points[i].y}
					L${points[i + 5].x} ${points[i + 5].y}
					L${points[i + 3].x} ${points[i + 3].y}
					L${points[i + 6].x} ${points[i + 6].y}
					z
				`);
		}
	}

	// render branch polygons
	renderBranch(layer, start, end, startThickness, endThickness, strength = 12, roughness = 0.05) {
		const resolution = this.genome.branch_roughness;

		// also don't remember what this is
		const nStrength = _p5.map(endThickness, this.genome.branch_start_thickness, this.genome.branch_end_thickness, strength, strength / 5);

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
	}

	// render whole tree
	renderTree(trunk, branches) {
		// call trunk render functions
		let [trunkSeams, trunkThicknesses] = [[], []];
		const trunkLayer = this.treeCanvas.layer('trunk');
		trunkLayer.attribute('fill', '#000');

		for (let edge of trunk.edges) {
			const [parent, child] = [trunk.nodes[edge.parent], trunk.nodes[edge.child]];

			let kS = 1 - _p5.map(Math.pow(1 - (1 / (trunk.nodes.length - 1)) * trunk.nodes.indexOf(parent), this.genome.trunk_exponetial_growth), Math.pow(0, this.genome.trunk_exponetial_growth), Math.pow(1, this.genome.trunk_exponetial_growth), 0, 1);
			let kE = 1 - _p5.map(Math.pow(1 - (1 / (trunk.nodes.length - 1)) * trunk.nodes.indexOf(child), this.genome.trunk_exponetial_growth), Math.pow(0, this.genome.trunk_exponetial_growth), Math.pow(1, this.genome.trunk_exponetial_growth), 0, 1);

			const startT = this.genome.base_thickness + kS * (this.genome.top_thickness - this.genome.base_thickness);
			const endT = Math.max(0, this.genome.base_thickness + kE * (this.genome.top_thickness - this.genome.base_thickness));

			const seamPoints = this.renderTrunk(trunkLayer, parent, child, startT, endT);
			trunkSeams.push.apply(trunkSeams, seamPoints);
			trunkThicknesses[edge.parent] = startT;
			trunkThicknesses[edge.child] = endT;
 		}
		 
		this.stitchtrunkSeams(trunkLayer, trunkSeams);

		// call branch render functions
		const branchesLayer = this.treeCanvas.layer('branches');
		branchesLayer.attribute('fill', '#000');
		for (let branchEdge of branches.edges) {
			const [parent, child] = [branches.nodes[branchEdge.parent], branches.nodes[branchEdge.child]];
			const creator = branches.nodes[parent.creator];

			const trunkCreatorThickness = trunkThicknesses[parent.creator] ?? this.genome.top_thickness;
			const startT = Math.min(trunkCreatorThickness, Math.max(this.genome.branch_end_thickness, _p5.map(parent.d, 0, creator.oldest, this.genome.branch_start_thickness, this.genome.branch_end_thickness)));
			const endT = Math.min(trunkCreatorThickness, Math.max(this.genome.branch_end_thickness, _p5.map(child.d, 0, creator.oldest, this.genome.branch_start_thickness, this.genome.branch_end_thickness)));

			this.renderBranch(branchesLayer, parent, child, startT, endT);
		}
	}

	// generate new burton tree
	generate() {
		const trunk = { nodes: [], edges: [] };
		const branches = { nodes: [], edges: [] };

		trunk.nodes.push({ x: this.baseCoords[0], y: this.baseCoords[1], d: 0 });

		_p5.randomSeed(this.seed);
		this.treeCanvas.clear();
		this.buildTree(0, trunk, branches);
		this.renderTree(trunk, branches);
	}

	get canvas() {
		return this.treeCanvas.node;
	}
}

export default BurtonesqueTree;
