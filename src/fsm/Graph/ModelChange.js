/*
 * Graph/ModelChange
 * Can be imported by stakeholders that need to be informed when the model changes
 * Stakeholders can then register using addListener
 */

const ls = [];

const mc = {};

mc.addListener = (l) => {
	ls.push(l);
};

// calls all listeners when the model changes, and provides the shapes (raw data)
mc.update = (shapes) => {
	ls.forEach((l) => {
		l(shapes);
	});
};

export default mc;
