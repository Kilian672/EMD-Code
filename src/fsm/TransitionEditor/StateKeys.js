/*
 * State Keys
 *
 * Creates and manages the state key part in the keyboard frame
 */

import keyCreator from './KeyCreator';

let elSize = 35; // length of square/button
let colCnt = 13; // number columns in total
let xmlns = 'http://www.w3.org/2000/svg'; //SVG namespace
let hdl = null; // event handler for mousedown event on key

const stKeys = {};

// to each key we add an event listener for mousedown, calling the handler with argument st (a state object)
function addListener(st, key) {
	key.addEventListener('mousedown', (e) => {
		e.preventDefault();
		if (e.button !== 0) return false;
		hdl(st);
		return false;
	});
}

// initialize creator for single keys
function initKeyCreator() {
	keyCreator.setKeySize(elSize);
	keyCreator.setNS(xmlns);
}

// create the keyboard
// (x,y) is the upper left corner
// shapes is the map shapes.shMap in Shapes.js
function create(x, y, shapes) {
	let rID = 0;
	let cID = 0;
	let stID;
	let st;
	let key;
	initKeyCreator();
	const keys = document.createElementNS(xmlns, 'g');
	keys.setAttributeNS(null, 'transform', 'translate(' + x + ',' + y + ')');
	// eslint-disable-next-line no-restricted-syntax
	for ([stID, st] of shapes) {
		// if it's a state, we create the key with the name of the state and add a listener
		if (stID.substring(0, 1) === 'n') {
			key = keyCreator.createKey(cID * elSize, rID * elSize, st.name);
			addListener(st, key);
			keys.appendChild(key);
			cID += 1;
			if (cID === colCnt) {
				cID = 0;
				rID += 1;
			}
		}
		if (stID.substring(0, 1) === 's') {
			key = keyCreator.createKey(cID * elSize, rID * elSize, st.name);
			addListener(st, key);
			keys.appendChild(key);
			cID += 1;
			if (cID === colCnt) {
				cID = 0;
				rID += 1;
			}
		}
	}
	return keys;
}

stKeys.setNS = (ns) => {
	xmlns = ns;
};
stKeys.getNS = () => xmlns;
stKeys.setKeySize = (s) => {
	elSize = s;
};
stKeys.getKeySize = () => elSize;
stKeys.setColoumnCount = (c) => {
	colCnt = c;
};
stKeys.getColoumnCount = () => colCnt;
stKeys.getHandler = () => hdl;
stKeys.setHandler = (h) => {
	hdl = h;
};
stKeys.create = create;

export default stKeys;
