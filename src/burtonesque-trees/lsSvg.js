/*
	Basically raw-doging my own SVG canvas with a few convinient abrastractions
*/

const SVG_URI = 'http://www.w3.org/2000/svg';

const setAttributes = (node, values) => {
	for(const attribute of Object.keys(values)) {
		node.setAttribute(attribute, values[attribute]);
	}
}

class LsLayer {
	constructor(parent, id) {
		this.layerNode = document.createElementNS(SVG_URI, 'g');
		if(id) this.layerNode.id = id;
		if(parent instanceof LsLayer || parent instanceof LsSvg) parent = parent.node;
		parent.append(this.layerNode);

		this.children = [];
	}

	layer(id) {
		const newLayer = new LsLayer(this.layerNode, id);
		this.children.push(newLayer);
		return newLayer;
	}

	rect(x, y, width, height, attributes) {
		const rectNode = document.createElementNS(SVG_URI, 'rect');
		if(attributes) setAttributes(rectNode, attributes);
		setAttributes(rectNode, { x, y, width, height });
		this.layerNode.append(rectNode);
	}

	ellipse(x, y, width, height, attributes) {
		const ellipseNode = document.createElementNS(SVG_URI, 'ellipse');
		if(attributes) setAttributes(ellipseNode, attributes);
		setAttributes(ellipseNode, { cx: x, cy: y, rx: width / 2, ry: height / 2 });
		this.layerNode.append(ellipseNode);
	}

	path(svgString, attributes) {
		const pathNode = document.createElementNS(SVG_URI, 'path');
		if(attributes) setAttributes(pathNode, attributes);
		setAttributes(pathNode, { d: svgString });
		this.layerNode.append(pathNode);
	}

	attribute(attribute_id, attribute_value) {
		this.layerNode.setAttribute(attribute_id, attribute_value);
	}

	polygon(x, y, radius, npoints, startAng, endAng, _attributes) {
		const angle = (Math.PI * 2) / npoints;
		let svgString = '';
		for(let a = startAng; a <= endAng; a += angle) {
			svgString += `${(a === startAng) ? 'M' : 'L'}${x + Math.cos(a) * radius / 2} ${y + Math.sin(a) * radius / 2}`;
		}
		this.path(svgString + 'z', _attributes);
	}
}


export default class LsSvg {
	constructor(width, height, id) {
		this.canvas = document.createElementNS(SVG_URI, 'svg');
		this.canvas.setAttribute('width', width);
		this.canvas.setAttribute('height', height);
		this.canvas.setAttribute('viewbox', `0 0 ${width} ${height}`);
		if(id) this.canvas.id = id;

		this.layers = [];
	}

	layer(id) {
		const newLayer = new LsLayer(this, id);
		this.layers.push(newLayer);
		return newLayer;
	}

	clear() {
		this.canvas.innerHTML = '';
	}


	get node() {
		return this.canvas;
	}


}
