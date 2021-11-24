/*
 * Alphabet Creator
 * 
 * used to create and manage the greek keyboard part
 */

import symbols from '../Constants/Symbols'; // unicodes for greek symbols
import keyCreator from './KeyCreator'; // used to create single keys

let xmlns = 'http://www.w3.org/2000/svg'; // SVG namespace
let elSize = 35; // length of one square/button
let colCnt = 13; // number columns in total
let hdl = null; // event handler when key is clicked

// when a given key triggers a mousedown event we call the event handler hdl with argument unicode (the code for the key)
function addListener(unicode, key) {
	key.addEventListener('mousedown', (e) => {
		e.preventDefault();
		if (e.button !== 0) return false;
		hdl(unicode);
		return false;
	});
}

// initialize creator for single keys
function initKeyCreator() {
	keyCreator.setKeySize(elSize);
	keyCreator.setNS(xmlns);
}

// create the keyboard, called by Editor
// upper left corner is (x,y)
// alType is the alphabet type (greek)
// alCase is upper or lower (here it's lower)
function createAlphabet(x, y, alType, alCase) {
	let rID = 0;
	let cID = 0;
	let ascii = 65; // this is 'A'
	let chr;
	let unicode;
	let unichr;
	let key;
	initKeyCreator();
	const al = document.createElementNS(xmlns, 'g');
	al.setAttributeNS(null, 'transform', 'translate(' + x + ',' + y + ')');
	// we loop through the alphabet
	while (ascii < 91) {
		chr = String.fromCharCode(ascii); // the actual character
		unicode = symbols[alType][alCase][chr]; // the unicode (number) for greek lower case & character
		if (unicode !== undefined) {
			unichr = String.fromCodePoint(unicode); // the unicode string
			key = keyCreator.createKey(cID * elSize, rID * elSize, unichr); // create the key with the label
			addListener(unicode, key); // add the listener for the mousedown
			al.appendChild(key);
			cID += 1;
			if (cID === colCnt) {
				cID = 0;
				rID += 1;
			}
		}
		ascii += 1;
	}
	return al;
}

const alCr = {};
alCr.setNS = (ns) => {
	xmlns = ns;
};
alCr.getNS = () => xmlns;
alCr.setKeySize = (s) => {
	elSize = s;
};
alCr.getKeySize = () => elSize;
alCr.setColoumnCount = (c) => {
	colCnt = c;
};
alCr.getColoumnCount = () => colCnt;
alCr.setHandler = (h) => {
	hdl = h;
};
alCr.getHandler = () => hdl;
alCr.createAlphabet = createAlphabet;

export default alCr;
