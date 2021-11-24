/*
 * Special Keys
 *
 * Takes care of +, backspace and check button in keyboard frame
 */

import keyCreator from './KeyCreator';

let xmlns = 'http://www.w3.org/2000/svg'; // SVG namespace
let elSize = 35; // length of one square/button
let colCnt = 13; // number keyboard columns in total
const hdls = { check: null, del: null, plus: null, L: null, G: null, S: null, up: null, low: null, Del: null, R: null, T: null, X: null, target: null, source: null, in: null, out: null, 
	checkenter: null, Deleteenter: null, Renter: null, inenter: null, outenter: null, Lenter: null, Genter:null, Senter:null, upenter: null, lowenter:null, 
	Tenter: null, Xenter: null, targetenter: null, sourceenter: null }; //event handlers for buttons
const codes = { check: 10003, del: 11013, plus: 65291, L: 76, G: 71, S: 83, up: 8593, low: 8595, Del: 9249, R: 82, T: 8594, X: 88, target: 8614, source: 8620, in: 8681, out: 8679}; // unicodes for the button labels

// adds the event handler hdls[type] to the mousedown event of the key "type" (plus, del, check)
function addListener(type, key) {
	key.addEventListener('mousedown', (e) => {
		e.preventDefault();
		if (e.button !== 0) return false;
		hdls[type]();
		return false;
	});
}

//adds a listener, if we enter the button
function addListenerEnter(type, key) {
	key.addEventListener('mouseenter', (e) => {
		e.preventDefault();
		if (e.button !== 0) return false;
		hdls[type]();
		return false;
	});
}

// initialize KeyCreator to create the keys for the special keys
function initKeyCreator() {
	keyCreator.setKeySize(elSize);
	keyCreator.setNS(xmlns);
}

// called by Editor during initialization
// create the three keys with upper left corner at (x,y)
// the keys are placed in the last columns, with one column distance in between
//state 's', 't', 'tspecialin', ... shows other specialkeys
function create(x, y, state) { 
	let key;
	let chr;
	initKeyCreator();
	const sk = document.createElementNS(xmlns, 'g');
	sk.setAttributeNS(null, 'transform', 'translate(' + x + ',' + y + ')');
	switch(state){
		case 's':
			chr = String.fromCodePoint(codes.Del);
			key = keyCreator.createKey(elSize * (colCnt - 13), 0, chr);
			addListener('Del', key);
			addListenerEnter('Deleteenter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.R);
			key = keyCreator.createKey(elSize * (colCnt - 12), 0, chr);
			addListener('R', key);
			addListenerEnter('Renter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.T);
			key = keyCreator.createKey(elSize * (colCnt - 11), 0, chr);
			addListener('T', key);
			addListenerEnter('Tenter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.in);
			key = keyCreator.createKey(elSize * (colCnt - 10), 0, chr);
			addListener('in', key);
			addListenerEnter('inenter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.out);
			key = keyCreator.createKey(elSize * (colCnt - 9), 0, chr);
			addListener('out', key);
			addListenerEnter('outenter', key);
			sk.appendChild(key);
			break;
		case 't':
			chr = String.fromCodePoint(codes.Del);
			key = keyCreator.createKey(elSize * (colCnt - 13), 0, chr);
			addListener('Del', key);
			addListenerEnter('Deleteenter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.R);
			key = keyCreator.createKey(elSize * (colCnt - 12), 0, chr);
			addListener('R', key);
			sk.appendChild(key);
			addListenerEnter('Renter', key);
			chr = String.fromCodePoint(codes.target);
			key = keyCreator.createKey(elSize * (colCnt - 11), 0, chr);
			addListener('target', key);
			addListenerEnter('targetenter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.source);
			key = keyCreator.createKey(elSize * (colCnt - 10), 0, chr);
			addListener('source', key);
			addListenerEnter('sourceenter', key);
			sk.appendChild(key);
			break;
		case 'tspecialin':
			chr = String.fromCodePoint(codes.Del);
			key = keyCreator.createKey(elSize * (colCnt - 13), 0, chr);
			addListener('Del', key);
			addListenerEnter('Deleteenter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.R);
			key = keyCreator.createKey(elSize * (colCnt - 12), 0, chr);
			addListener('R', key);
			addListenerEnter('Renter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.target);
			key = keyCreator.createKey(elSize * (colCnt - 11), 0, chr);
			addListener('target', key);
			addListenerEnter('targetenter', key);
			sk.appendChild(key);
			break;
		case 'tspecialout':
			chr = String.fromCodePoint(codes.Del);
			key = keyCreator.createKey(elSize * (colCnt - 13), 0, chr);
			addListener('Del', key);
			addListenerEnter('Deleteenter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.R);
			key = keyCreator.createKey(elSize * (colCnt - 12), 0, chr);
			addListener('R', key);
			addListenerEnter('Renter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.source);
			key = keyCreator.createKey(elSize * (colCnt - 10), 0, chr);
			addListener('source', key);
			addListenerEnter('sourceener', key);
			sk.appendChild(key);
			break;
		case 'X':
			chr = String.fromCodePoint(codes.X);
			key = keyCreator.createKey(elSize * (colCnt - 13), 0, chr);
			addListener('X', key);
			addListenerEnter('Xenter', key);
			sk.appendChild(key);
			break;
		case 'name':
			chr = String.fromCodePoint(codes.plus);
			key = keyCreator.createKey(elSize * (colCnt - 5), 0, chr);
			addListener('plus', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.del);
			key = keyCreator.createKey(elSize * (colCnt - 3), 0, chr);
			addListener('del', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.check);
			key = keyCreator.createKey(elSize * (colCnt - 1), 0, chr);
			addListener('check', key);
			addListenerEnter('checkenter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.L);
			key = keyCreator.createKey(elSize * (colCnt - 13), 0, chr);
			addListener('L', key);
			addListenerEnter('Lenter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.G);
			key = keyCreator.createKey(elSize * (colCnt - 12), 0, chr);
			addListener('G', key);
			addListenerEnter('Genter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.S);
			key = keyCreator.createKey(elSize * (colCnt - 11), 0, chr);
			addListener('S', key);
			addListenerEnter('Senter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.up);
			key = keyCreator.createKey(elSize * (colCnt - 9), 0, chr);
			addListener('up', key);
			addListenerEnter('upenter', key);
			sk.appendChild(key);
			chr = String.fromCodePoint(codes.low);
			key = keyCreator.createKey(elSize * (colCnt - 8), 0, chr);
			addListener('low', key);
			addListenerEnter('lowenter', key);
			sk.appendChild(key);
			break;
		default:
			break;
	}
	return sk;
}

const skCr = {};
skCr.setNS = (ns) => {
	xmlns = ns;
};
skCr.getNS = () => xmlns;
skCr.setKeySize = (s) => {
	elSize = s;
};
skCr.getKeySize = () => elSize;
skCr.setColoumnCount = (c) => {
	colCnt = c;
};
skCr.getColoumnCount = () => colCnt;
skCr.setHandler = (type, h) => {
	hdls[type] = h;
};
skCr.getHandler = (type) => hdls[type];
skCr.create = create;

export default skCr;
