import BurtonTree from './burtonesque-trees/index.js';

const tree = new BurtonTree();

document.body.append(tree.canvas);
tree.generate();
