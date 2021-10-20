const lightValues = {
	'--lum-main': 10,
	'--lum-secondary': 125,
	'--lum-hover': 125,
	'--lum-focus': 90,
	'--lum-hover-bg': 225,
	'--lum-focus-bg': 200,
	'--lum-background': 250,
};

const darkValues = {
	'--lum-main': 250,
	'--lum-secondary': 125,
	'--lum-hover': 180,
	'--lum-focus': 150,
	'--lum-hover-bg': 50,
	'--lum-focus-bg': 75,
	'--lum-background': 10,
};

// switch between light and dark mode
export const updateColourMode = (mode) => {
    const values = mode.toLowerCase() === 'light' ? lightValues : darkValues;
    const rootVars = Object.keys(values);
    for(let i = 0, len = rootVars.length; i < len; i++) {
       document.documentElement.style.setProperty(rootVars[i], values[rootVars[i]]);
    }
}