/*	
	An unfinished p5.js-inspired SVG canvas I was working on for another project and ended up borrowing for this one.
	Basically raw-doging my own SVG canvas with a few convinient abrastractions.
*/

const SVG_URI = 'http://www.w3.org/2000/svg';

const setMultipleAttributes = (node, attributes) => {
	const attKeys = Object.keys(attributes);
	for (let i = 0, len = attKeys.length; i < len; i++) {
		node.setAttribute(attKeys[i], attributes[attKeys[i]]);
	}
};

// layer object where shapes are drawn
class Alayer {
	#currentPath;
	#layer;

	constructor(_id) {
		// DOM node
		this.#layer = document.createElementNS(SVG_URI, 'g');
		this.#layer.id = _id;

		// ever-available path element
		this.#currentPath = null;
	}

	// draw rect
	rect(x, y, width, height, styleAttributes = {}) {
		const ellipseNode = document.createElementNS(SVG_URI, 'rect');

		// position and size
		setMultipleAttributes(ellipseNode, { x, y, width, height });

		// optional attributes
		setMultipleAttributes(ellipseNode, styleAttributes);

		this.#layer.append(ellipseNode);
	}

	// draw and append ellipse (from center)
	ellipse(x, y, width, height, styleAttributes = {}) {
		const ellipseNode = document.createElementNS(SVG_URI, 'ellipse');

		// position and size
		setMultipleAttributes(ellipseNode, { cx: x, cy: y, rx: width / 2, ry: height / 2 });

		// optional attributes
		setMultipleAttributes(ellipseNode, styleAttributes);

		this.#layer.append(ellipseNode);
	}

	// draw and append ellipse (from corner)
	ellipseCorner(x, y, width, height, styleAttributes = {}) {
		this.ellipse(x + width / 2, y + height / 2, width, height, styleAttributes);
	}

	// draw polygon
	polygon(x, y, radius, npoints, startAng, endAng, styleAttributes = {}) {
		const angle = (Math.PI * 2) / npoints;
		this.beginShape(styleAttributes);
		for (let a = startAng; a <= endAng; a += angle) {
			this.vertex(x + (Math.cos(a) * radius) / 2, y + (Math.sin(a) * radius) / 2);
		}
		this.endShape(true);
	}

	// begin creating path
	beginShape(styleAttributes = {}) {
		this.#currentPath = {
			d: '',
			node: document.createElementNS(SVG_URI, 'path'),
		};

		// optional attributes
		setMultipleAttributes(this.#currentPath.node, styleAttributes);
	}

	// add point to path
	vertex(x, y) {
		if (this.#currentPath === null) return;

		this.#currentPath.d += this.#currentPath.d.length === 0 ? 'M' : 'L';
		this.#currentPath.d += `${x} ${y} `;
	}

	// close and append path
	endShape(close = true) {
		if (this.#currentPath === null) return;
		if (this.#currentPath.d.length === 0) return;
		if (close) this.#currentPath.d += 'z';
		this.#currentPath.node.setAttribute('d', this.#currentPath.d);
		this.#layer.append(this.#currentPath.node);
	}

	// set single attribute in layer DOM node
	setAttribute(attributeKey, value) {
		this.#layer.setAttribute(attributeKey, value);
	}

	// set multiple attribures in layer DOM node
	setAttributeMult(attributeObject) {
		setMultipleAttributes(this.#layer, attributeObject);
	}

	clear() {
		this.#layer.innerHTML = '';
	}

	get node() {
		return this.#layer;
	}
}

// canvas object
class Asvg {
	constructor(_width, _height, _id) {
		// DOM node
		this.canvas = document.createElementNS(SVG_URI, 'svg');
		this.canvas.setAttribute('width', _width ?? 256);
		this.canvas.setAttribute('height', _height ?? 256);
		if (_id) this.canvas.id = _id;

		// layers
		this.layers = {};
	}

	// add layer
	createLayer(_layerId) {
		const layerId = _layerId ?? `layer-${Object.keys(this.layers).length}`;
		const newLayer = new Alayer(layerId);

		// TODO: handle repeat Ids

		this.layers[layerId] = newLayer;
		this.canvas.append(newLayer.node);
		return newLayer;
	}

	// find and return layer
	getLayer(layerId) {
		if (layerId in this.layers) return this.layers[layerId];
		return false;
	}

	setAttribute(attributeKey, value) {
		this.canvas.setAttribute(attributeKey, value);
	}

	clear() {
		this.canvas.innerHTML = '';
	}

	// export clone of SVG canvas
	getSvg(getBlob = false) {
		if (!getBlob) return this.canvas.cloneNode(true);
		return new Blob([this.canvas.outerHTML], { type: 'image/svg+xml;charset=utf-8' });
	}

	// export canvas as a PNG. Returns a promise.
	getPng(newHeight) {
		return new Promise((resolve, reject) => {
			// clone canvas
			let clonedSvg = this.getSvg();

			// get pixels dimensions
			const [svgWidth, svgHeight] = [clonedSvg.getAttribute('width'), clonedSvg.getAttribute('height')];

			// resize if needed
			if (newHeight) {
				clonedSvg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
				clonedSvg.setAttribute('width', (svgWidth * newHeight) / svgHeight);
				clonedSvg.setAttribute('height', newHeight);
			}
			
			// convert svg to image
			const convertedCanvas = document.createElement('img');
			convertedCanvas.setAttribute('src', 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(clonedSvg)));
			convertedCanvas.onload = () => resolve(convertedCanvas);
		});
	}

	// set canvas DOM node ID
	set id(_id) {
		this.canvas.id = _id;
	}

	// get actual DOM
	get node() {
		return this.canvas;
	}
}

export default Asvg;
