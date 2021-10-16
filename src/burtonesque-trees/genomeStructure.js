export default {
	// trunk recursion depth. Number of trunk nodes.
	trunk_size: { default: 15, max: 20, min: 3, step: 1 },
	// *
	// how far horizontally from the last node each new trunk node can be randomly placed
	trunk_range_x: { default: 50, max: 75, min: 5, step: 5 },
	// *
	// how far vertically from the last node each new trunk node can be randomly placed
	trunk_range_y: { default: 50, max: 75, min: 15, step: 5 },
	// *
	// how straight (upright) the trunk is forced to be. This values incrementally straightens the tree from base to top.
	inc_straightness: { default: 2, min: 1, max: 50, step: 1 },
	// *
	// trunk thickness at base
	base_thickness: { default: 60, max: 75, min: 5, step: 5 },
	// *
	// trunk thickness at top
	top_thickness: { default: 20, max: 50, min: 5, step: 5 },
	// *
	// how the trunk goes from base_thickness to top_thickness. 0 = linear growth
	trunk_exponetial_growth: { default: 4, max: 10, min: 1, step: 1 },
	// *
	// number of noise offsets in each edge of the trunk
	trunk_roughness: { default: 3, max: 15, min: 1, step: 1 },
	// *
	// probability of sprouting a branch at each body node
	branch_prob: { default: 0.8, max: 0.99, min: 0, step: 0.0025 },
	// *
	// how biased the branch sprout probability it toward the top of the tree
	// 0: sprout probability is independent form the height of the tree
	// 1: sprout probability is higher at the top of the tree
	depth_branch_bias: { default: 0.3, max: 1, min: 0, step: 0.005 },
	// *
	// branch recursion depth -- number of sections per branch
	max_branch_depth: { default: 10, max: 15, min: 1, step: 1 },
	// *
	// probability of the branch stopping before reaching the max_branch_depth
	stop_branch_prob: { default: 0.3, max: 0.5, min: 0, step: 0.05 },
	// *
	// bias towards branches sprouting in the left or right side of the tree
	// 0: all branches on left side
	// 1: all branches on right side
	left_right_bias: { default: 0.5, max: 1, min: 0, step: 0.05 },
	// *
	// probability of branch forking into two
	fork_prob: { default: 0.1, max: 0.5, min: 0, step: 0.05 },
	// *
	// length of each branch node
	branch_range: { default: 30, max: 75, min: 10, step: 1 },
	// *
	// how much each new branch section will decrease by in length
	branch_short_factor: { default: 0.3, max: 0.95, min: 0, step: 0.05 },
	// *
	// how much each branch will lean toward spiraling
	spiral_amount: { default: 0, max: 1, min: 0, step: 0.05 },
	// *
	// branch thickness at body
	branch_start_thickness: { default: 15, max: 30, min: 5, step: 1 },
	// *
	// branch thickness at end
	branch_end_thickness: { default: 4, max: 10, min: 1, step: 1 },
	// *
	// number of noise offsets in each edge of each branch section
	branch_roughness: { default: 3, max: 15, min: 1, step: 1 },
};
