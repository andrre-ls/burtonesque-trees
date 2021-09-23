import genomeStructure from './genomeStructure.js';

// https://stackoverflow.com/questions/17369098/simplest-way-of-getting-the-number-of-decimals-in-a-number-in-javascript
const countDecimals = (value) => {
	if (Math.floor(value) === value) return 0;
	return value.toString().split('.')[1].length || 0;
};

const defaultGenome = () => {
	const output = {};
	for (const geneName of Object.keys(genomeStructure)) output[geneName] = genomeStructure[geneName].default;
	return output;
};

const randomGenome = () => {
	const output = {};
	for (const geneName of Object.keys(genomeStructure)) {
		output[geneName] = genomeStructure[geneName].min + Math.random() * (genomeStructure[geneName].max - genomeStructure[geneName].min);
		output[geneName] = Number(output[geneName].toFixed(countDecimals(genomeStructure[geneName].step)));
	}
	return output;
};

// check if gene exists and contrains its value
const validateGene = (gene, value) => {
	if (!(gene in geneStructure)) return false;
	return parseInt(Math.min(Math.max(value, geneStructure[gene].min), geneStructure[gene].max));
};

export default { validateGene, defaultGenome, randomGenome };
