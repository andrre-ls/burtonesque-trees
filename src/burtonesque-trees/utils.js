// https://stackoverflow.com/questions/17369098/simplest-way-of-getting-the-number-of-decimals-in-a-number-in-javascript
export const countDecimals = (value) => {
	if (Math.floor(value) === value) return 0;
	return value.toString().split('.')[1].length || 0;
};

export const downloadFile = (file, fileName) => {
	const downloadLink = document.createElement('a');
	downloadLink.href = file;
	downloadLink.download = fileName;
	downloadLink.click();
};
