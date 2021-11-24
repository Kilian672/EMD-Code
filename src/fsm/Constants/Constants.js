const constants = {
	stateRadius: 20,
	snapToPadding: 6,
	hitTargetPadding: 6, // px, buffer to assume we wanted to click current shape
	instancesLimit: 1000000,
	specialArrowLimit: 5, //Erweiterung
	stateDefaultColour: 'black',
	stateSelectedColour: 'blue',
	stateTransitionFactorColour: 'red',

	transitionDefaultColour: 'black',
	transitionSelectedColour: 'blue',
	transitionStateFactorColour: 'red',

	stateKeys: {
		Rename: 45,
		Delete: 46,
		Transition: 17,
	},
	transitionKeys: {
		Rename: 45,
		Delete: 46,
		Target: 84,
		Source: 83,
		Factor: 70,
	},
	canvas: null,
	context: null,

	buildString: (a) => {
		let s = '';
		for (let i = 0; i < a.length; i += 1) s += String.fromCodePoint(a[i]);
		return s;
	},
};

export default constants;
