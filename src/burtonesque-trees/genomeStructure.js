export default {
	// trunk recursion depth -- number of trunk sections
	trunk_size: {
		default: 10,
		max: 20,
		min: 2,
		step: 1,
	},
	// how far horizontally each new trunk section can move
	trunk_range_x: {
		default: 50,
		max: 100,
		min: 5,
		step: 5,
	},
	// how far vertically each new trunk section can move
	trunk_range_y: {
		default: 50,
		max: 100,
		min: 15,
		step: 5,
	},

	// how straight (aka point up) the trunk will. Incrementing this value will progressively straighten the tree from base to top
	inc_straightness: { default: 2, min: 1, max: 50, step: 1 },

	// trunk thickness at base
	base_thickness: { default: 40, max: 75, min: 5, step: 5 },

	// trunk thickness at top
	top_thickness: {
		default: 5,
		max: 50,
		min: 5,
		step: 5,
	},
	// how the trunk goes from base_thickness to top_thickness
	// 0: linear growth
	trunk_exponetial_growth: {
		default: 1,
		max: 10,
		min: 1,
		step: 1,
	},
	// number of noise offsets in each edge of the trunk
	trunk_roughness: {
		default: 3,
		max: 15,
		min: 1,
		step: 1,
	},
	// probability of sprouting a branch at each body node
	branch_prob: { default: 0.95, max: 0.95, min: 0, step: 0.0025 },

	// how biased the branch sprout probability it toward the top of the tree
	// 0: sprout probability is independent form the height of the tree
	// 1: sprout probability is higher at the top of the tree
	depth_branch_bias: { default: 0.5, max: 1, min: 0, step: 0.05 },

	// branch recursion depth -- number of sections per branch
	max_branch_depth: { default: 10, max: 10, min: 1, step: 1 },
	// bias towards branches sprouting in the left or right side of the tree
	// 0: all branches on left side
	// 1: all branches on right side
	left_right_bias: {
		default: 0.5,
		max: 1,
		min: 0,
		step: 0.05,
	},
	// probability of the branch stopping before reaching the max_branch_depth
	stop_branch_prob: {
		default: 0.2,
		max: 0.9,
		min: 0,
		step: 0.05,
	},

	// probability of branch forking into two
	fork_prob: { default: 0.1, max: 0.5, min: 0, step: 0.05 },

	// how much each new branch section will decrease by in length
	branch_short_factor: {
		default: 0.3,
		max: 0.95,
		min: 0,
		step: 0.05,
	},
	// how much each branch will lean toward spiraling
	spiral_amount: { default: 0.5, max: 1, min: 0, step: 0.05 },

	// length of each branch node
	branch_range: { default: 20, max: 75, min: 10, step: 5 },

	// how much the angle can vary from PI (i.e. horizontal)
	branch_angle_range: {
		default: 1,
		max: 1,
		min: 0,
		step: Math.PI / 48,
	},
	// branch thickness at body
	branch_start_thickness: {
		default: 10,
		max: 20,
		min: 5,
		step: 1,
	},
	// branch thickness at end
	branch_end_thickness: {
		default: 2,
		max: 5,
		min: 1,
		step: 1,
	},
	// number of noise offsets in each edge of each branch section
	branch_roughness: {
		default: 3,
		max: 15,
		min: 1,
		step: 1,
	},
};
