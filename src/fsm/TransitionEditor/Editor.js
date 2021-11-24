/*
 * Transition Editor
 * 
 * The purpose of these functions is to manage the keyboard frame.
 */

import spKeys from './SpecialKeys'; // plus, backspace, check
import alCr from './AlphabetCreator'; // greek alphabet
import stKeys from './StateKeys'; // the buttons for the states

let xmlns = 'http://www.w3.org/2000/svg'; // xml namespace for SVG

let colCnt = 13; // number of columns in total for the keayboard
let elSize = 35; // length of one square/button
let pad = 10; // space in between buttons
let cont = null; // HTML container
let svgRoot = null; // the SVG root for the extended keyboard
let svgAl = null; // greek alphabet layer
let svgSt = null; // state key layer
let svgSk = null; // special key layer
let alHdl = null; // alphabet event handler
let stHdl = null; // state key event handler
const skHdls = { plus: null, del: null, check: null, L: null, G: null, S: null, up: null, low: null, Del: null, R: null, T: null, X: null, target: null, source: null, in: null, out: null,
 checkenter: null, Deleteenter: null, Renter: null, inenter: null, outenter: null, Lenter:null, Genter:null, Senter:null, upenter:null, lowenter:null,
 Tenter: null, Xenter: null, targetenter: null, sourceenter: null }; // event handlers for special keys
let stBase = [10, 55]; // upper left corner for state keys 

//the main object, the transition editor
const editor = {};

//creates the SVG pane
function initRoot() {
	const w = 2 * pad + elSize * colCnt; // left/right padding + number of columns*size of one element
	// top/bottom padding, padding between special/greek and greek/state, one row special, two rows greek, two rows state
	const h = 4 * pad + elSize * 5; 
	svgRoot = document.createElementNS(xmlns, 'svg'); //<SVG>
	svgRoot.setAttributeNS(null, 'width', w + 'px');
	svgRoot.setAttributeNS(null, 'height', h + 'px');
}

// initialize special keys, communicate the handlers to take care of the click events
function initSpecialKeys() {
	spKeys.setKeySize(elSize);
	spKeys.setNS(xmlns);
	spKeys.setColoumnCount(colCnt);
	spKeys.setHandler('plus', skHdls.plus);
	spKeys.setHandler('del', skHdls.del);
	spKeys.setHandler('check', skHdls.check);
	spKeys.setHandler('L', skHdls.L);
	spKeys.setHandler('G', skHdls.G);
	spKeys.setHandler('S', skHdls.S);
	spKeys.setHandler('up', skHdls.up);
	spKeys.setHandler('low', skHdls.low);
	spKeys.setHandler('Del', skHdls.Del);
	spKeys.setHandler('R', skHdls.R);
	spKeys.setHandler('T', skHdls.T);
	spKeys.setHandler('X', skHdls.X);
	spKeys.setHandler('target', skHdls.target);
	spKeys.setHandler('source', skHdls.source);
	spKeys.setHandler('in', skHdls.in);
	spKeys.setHandler('out', skHdls.out);
	spKeys.setHandler('checkenter', skHdls.checkenter);
	spKeys.setHandler('Deleteenter', skHdls.Deleteenter);
	spKeys.setHandler('Renter', skHdls.Renter);
	spKeys.setHandler('inenter', skHdls.inenter);
	spKeys.setHandler('outenter', skHdls.outenter);
	spKeys.setHandler('Senter', skHdls.Senter);
	spKeys.setHandler('Genter', skHdls.Genter);
	spKeys.setHandler('Lenter', skHdls.Lenter);
	spKeys.setHandler('upenter', skHdls.upenter);
	spKeys.setHandler('lowenter', skHdls.lowenter);
	spKeys.setHandler('Tenter', skHdls.Tenter);
	spKeys.setHandler('Xenter', skHdls.Xenter);
	spKeys.setHandler('targetenter', skHdls.targetenter);
	spKeys.setHandler('sourceenter', skHdls.sourceenter);
}

// initialize the greek keyboard
function initAlphabet() {
	alCr.setColoumnCount(colCnt);
	alCr.setKeySize(elSize);
	alCr.setNS(xmlns);
	alCr.setHandler(alHdl);
}

//called by AlphabetHandler to change the ALphabet
editor.updateAlphabet = (alphabettype, alphabetcase) => {
	svgRoot.removeChild(svgAl);
	svgAl = alCr.createAlphabet(pad, 2 * pad + elSize, alphabettype , alphabetcase);
	svgRoot.appendChild(svgAl);
}
//called by AlphabetHandler to change the vsibility of the alphabet
editor.Alphabetvisibility = (visibility) => {
	svgAl.setAttributeNS(null, 'visibility', visibility);
}
//called by AlphabetHandler to change the case of the Alphabet
editor.updateAlphabetCase = (alphabetcase) => {
	if(alphabetcase == "up") {
		let s = svgAl.getElementsByTagName("text")[0].innerHTML;
		s = s.charCodeAt(1);
		switch (s){
			case 56398:
				svgRoot.removeChild(svgAl);
				svgAl = alCr.createAlphabet(pad, 2 * pad + elSize, 'L', 'C');
				svgRoot.appendChild(svgAl);
				break;
			case 57084:
				svgRoot.removeChild(svgAl);
				svgAl = alCr.createAlphabet(pad, 2 * pad + elSize, 'G', 'C');
				svgRoot.appendChild(svgAl);
				break;
			case 57110:
				svgRoot.removeChild(svgAl);
				svgAl = alCr.createAlphabet(pad, 2 * pad + elSize, 'S', 'C');
				svgRoot.appendChild(svgAl);
				break;
			default:
				break;
		}
	} else {
		let s = svgAl.getElementsByTagName("text")[0].innerHTML;
		s = s.charCodeAt(1);
		switch (s){
			case 56372:
				svgRoot.removeChild(svgAl);
				svgAl = alCr.createAlphabet(pad, 2 * pad + elSize, 'L', 'S');
				svgRoot.appendChild(svgAl);
				break;
			case 57058:
				svgRoot.removeChild(svgAl);
				svgAl = alCr.createAlphabet(pad, 2 * pad + elSize, 'G', 'S');
				svgRoot.appendChild(svgAl);
				break;
			case 57075:
				svgRoot.removeChild(svgAl);
				svgAl = alCr.createAlphabet(pad, 2 * pad + elSize, 'S', 'S');
				svgRoot.appendChild(svgAl);
				break;
			default:
				break;
		}
	}
}

//called by ALphabetHandler to change the specialkey layout
editor.updateSpecialKeys = (state) =>{
	svgRoot.removeChild(svgSk);
	svgSk = spKeys.create(pad, pad, state);
	svgRoot.appendChild(svgSk);
}
//called by AlphabetHandler to change the Statekey visibility
editor.StateKeysvisibility = (visibility) => {
	svgSt.setAttributeNS(null, 'visibility', visibility);
}
//called by AlphabetHandler to change the complete visbility
editor.visibility = (visibility) => {
	svgRoot.setAttributeNS(null, 'visibility', visibility);
}


// initialize the state keyboard
function initStateKeys() {
	stKeys.setColoumnCount(colCnt);
	stKeys.setKeySize(elSize);
	stKeys.setNS(xmlns);
	stKeys.setHandler(stHdl);
}

// called when the model changes (see init below, FSM.js and ModelChange.js)
// we discard the state keys, initialize them and extract the current states from shapes
function updateStateKeys(shapes) {
	initStateKeys();
	const keys = stKeys.create(stBase[0], stBase[1], shapes);
	if (svgSt !== null) svgRoot.removeChild(svgSt);
	svgRoot.appendChild(keys);
	svgSt = keys;
}

// when the SVG tree is in place we attach it to the container
function attachRoot() {
	cont.appendChild(svgRoot);
}

// called by FSM.js
// we build the contents in the htmlContainer from scratch, SVG based
editor.init = (htmlContainer, stUpdate) => {
	cont = htmlContainer;
	initRoot();
	initSpecialKeys();
	initAlphabet();
	initStateKeys();
	// this will cause creation of state keys when the first state is created (editor init before graph init in FSM.js!)
	stUpdate.addListener(updateStateKeys);
	stBase = [pad, 3 * pad + 3 * elSize]; //left pad & top+special/greek+greek/state pad + special row + two greek rows
	svgSk = spKeys.create(pad, pad, 'name'); // left & top padding, create special keys 
	svgRoot.appendChild(svgSk);
	svgAl = alCr.createAlphabet(pad, 2 * pad + elSize, 'L', 'C'); // create keyboard with lower case greek
	svgRoot.appendChild(svgAl);
	attachRoot();
	svgRoot.setAttributeNS(null, 'visibility', 'hidden');  //as deafault the alphabet is hidden
	document.getElementById('inID').style.visibility = 'hidden'; //as default the inId div is hidden
};


editor.setNS = (ns) => {
	xmlns = ns;
};
editor.getNS = () => xmlns;
editor.setKeySize = (s) => {
	elSize = s;
};
editor.getKeySize = () => elSize;
editor.setColoumnCount = (c) => {
	colCnt = c;
};
editor.getColoumnCount = () => colCnt;
editor.setAlphabetHandler = (h) => {
	alHdl = h;
};
editor.getAlphabetHandler = () => alHdl;
editor.setStateKeyHandler = (h) => {
	stHdl = h;
};
editor.getStateKeyHandler = () => stHdl;
editor.setPadding = (p) => {
	pad = p;
};
editor.setSpecialKeyHandler = (type, h) => {
	skHdls[type] = h;
};
editor.getSpecialKeyHandler = (type) => skHdls[type];
editor.getPadding = () => pad;

export default editor;
