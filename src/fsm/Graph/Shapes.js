/*
 * Shapes
 * 
 * Stores all rendered shapes (states and transitions)
 * Provides functionality to identify shapes and create shapes
 * This is a crucial part of the script
 */

let ctx = {}; // The HTML Canvas 2d context
let cvs = {}; // The HTML Canvas
let pad = 0; // padding, allow for some buffer when trying to select something (in particular transitions)
let r = 0; // state radius
let instLimit = 100; // maximum number of instances

const currInd = { s: 0, t: 0 };

const shapes = {}; // stores all shapes, one of the crucial objects

// checks if the point (x,y) is in the circle corresponding to state s
function pointInState(x, y, s) {
	ctx.beginPath();
	ctx.arc(s.x, s.y, r, 0, 2 * Math.PI);
	ctx.closePath();
	if (ctx.isPointInPath(x, y)) return true;
	return false;
}

// check if the point (x,y) is sufficiently close to the transition t edge (using the padding pad)
function pointInTransition(x, y, t) {
	const ps = t.shape.source.point;
	const pt = t.shape.target.point;
	const dx = pt.x - ps.x;
	const dy = pt.y - ps.y;
	const len = Math.sqrt(dx * dx + dy * dy);
	const percent = (dx * (x - ps.x) + dy * (y - ps.y)) / (len * len);
	const dist = (dx * (y - ps.y) - dy * (x - ps.x)) / len;
	return percent > 0 && percent < 1 && Math.abs(dist) < pad;
}


// shMap stores all shapes (states and transitions), used in various parts
// the keys are the ids (see below), values are the objects
shapes.shMap = new Map();

// retrieve a certain shape using its id
shapes.getShape = (id) => shapes.shMap.get(id);

// given a point (x,y), see if there is a shape matching it
// uses the functions above for states and transitions respectively
shapes.findShape = (x, y) => {
	let shID;
	let shType;
	let sh;
	// eslint-disable-next-line no-restricted-syntax
	for ([shID, sh] of shapes.shMap) {
		shType = shID.substring(0, 1);
		switch (shType) {
			case 's':
				if (pointInState(x, y, sh)) return sh;
				break;
			case 't':
				if (pointInTransition(x, y, sh)) return sh;
				break;
			default:
				break;
		}
	}
	return null;
};

//check if a state collides with another state or transition
shapes.stateconflict = (st) => {
	let shID;
	let sh;
	let shType;
	const stID = st.id;
	for ([shID, sh] of shapes.shMap) {
		shType = shID.substring(0, 1);
		switch (shType) {
			case 's':
				if ((st.x-sh.x)*(st.x-sh.x)+(st.y-sh.y)*(st.y-sh.y) <= 4*r*r && stID !== shID) return true;
				break;
			case 't':
				
				break;
			default:
				break;
		}
	}
	return false;
}


// checks if one of the other states has the same name as the provided state
shapes.findStateNameConflict = (st) => {
	let id;
	let sh;
	const stID = st.id;
	const stName = st.name;
	// eslint-disable-next-line no-restricted-syntax
	for ([id, sh] of shapes.shMap) {
		if (id.substring(0, 1) === 's' && sh.name === stName && id !== stID) {
			return sh;
		}
	}
	return null;
};

// ID GENERATION: generate unique ID for each shape, the type determined by the prefix pre
// state ID's are 's0'. 's1', ....
// transition ID's are 't0', 't1', ....
shapes.generateFreeID = (pre) => {
	if (currInd[pre] >= instLimit) return '';
	currInd[pre] += 1;
	return pre + (currInd[pre] - 1);
};

// draws all shapes on the canvas (after clearing it)
shapes.draw = () => {
	let sh;
	ctx.clearRect(0, 0, cvs.width, cvs.height);
	// eslint-disable-next-line no-restricted-syntax
	for (sh of shapes.shMap.values()) {
		sh.draw();
	}
};

// add a new shape to the shMap map (the shape, state or transition, as object is created beforehand and passed as argument)
shapes.addShape = (id, sh) => {
	shapes.shMap.set(id, sh);
};

// delete a shape from shMap (object is deleted if there are no other references, hopefully)
shapes.deleteShape = (id) => {
	shapes.shMap.delete(id);
};

// called by fsmCSS.init (Graph/Graph.js)
shapes.init = (canvas, stateRadius, hitTargetPadding, instanceLimit) => {
	cvs = canvas;
	ctx = cvs.getContext('2d');
	r = stateRadius;
	pad = hitTargetPadding;
	instLimit = instanceLimit;
};

export default shapes;
