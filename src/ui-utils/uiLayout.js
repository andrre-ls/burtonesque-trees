export const expand = (buttons) => {    
    // change side bar width values
	document.documentElement.style.setProperty('--side-bar-width', getComputedStyle(document.body).getPropertyValue('--side-bar-expanded-parameters'));
    buttons.style.width = 'var(--side-bar-expanded-buttons)';

    // place buttons on the side
	buttons.style.position = 'absolute';
	buttons.style.top = 0;
	buttons.style.marginTop = 0;
	buttons.style.left = 'calc(var(--side-bar-width) + 4.5rem)';
};

export const collapse = (buttons) => {
	// change side bar width values
	document.documentElement.style.setProperty('--side-bar-width', getComputedStyle(document.body).getPropertyValue('--side-bar-collapsed'));
    
    // revert buttons back to bottom
	buttons.style.width = '100%';
	buttons.style.position = 'relative';
	buttons.style.top = null;
	buttons.style.marginTop = null;
	buttons.style.left = null;
};
