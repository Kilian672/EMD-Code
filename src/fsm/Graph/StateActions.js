/*
 * State Actions
 *
 * implements actions that are related to the (Markov) states
 * usually, stateActions is used by the stateEventMgr to act upon events
 * however, it is for example also used by the idleEventMgr to create a state
 */

import State from './State';

let shapes = {}; //shapes array, Graph/Shapes.js
let ss = {}; // fsmCSS, Graph/Graph.js
let trAct = {}; // transitionActions
let instLimit = 0; // instance limit for id generation
const stAct = {}; // main object here

// see StateEventMgr.js for context
// when we are in state 's', substate 't' (transition creation), mousedown event
// user wants to select a target state to create a new transition
// if the selection is not reasonable (not a distinct state) we do nothing
// otherwise we create a new transition (using transitionActions) and enter the state 'tr'
// since the user needs to provide an expression
stAct.stateSelectTransitionTarget = (e) => {
	const shAct = ss.activeShape;
	const sh = shapes.findShape(e.offsetX, e.offsetY);
	if (sh == null || sh.id.substring(0, 1) !== 's' || sh.id === shAct.id) return;
	shAct.deactivate();
	const tr = trAct.transitionCreate(shAct, sh);
	// no object change yet, only after we have a name
	ss.systemStateActivate('tr', tr);
	shapes.draw();
};

// see StateEventMgr.js for context
// when we are in state 's', substate 'r' (rename), keydown event
stAct.renameKeyDown = (e) => {
	let key = e.keyCode || e.which;
	const st = ss.activeShape;
	// pressed enter and name is valid (not empty, not already taken)
	// -> change to system state 's' (state selected)
	if (key === 13 && stAct.renameValidate()) {
		ss.systemStateActivate('s', st);
		shapes.draw();
		return true;
	}
	// change the alphabet (with ctrl pressed)
	// alphabet is stored in fsmCSS and changed there
	if (e.ctrlKey) {
		key = String.fromCharCode(key);
		if (key === 'L' || key === 'G' || key === 'S') ss.alphabet = key;
		return true; // the only CTRL combinations we're interested in
	}
	// backspace, remove the last character
	if (key === 8) {
		st.nameRemoveChr();
		shapes.draw();
		return true;
	}
	// map the key code to the unicode using the symbols
	// e.g. the key code for 'G' maps to 'g' if we are in lower case latin
	// and to gamma if we are in lower case greek
	key = String.fromCharCode(key);
	const u = ss.symbols[ss.alphabet][e.shiftKey ? 'C' : 'S'][key];
	if (u === undefined) return true;
	st.nameAddChr(u);
	shapes.draw();
	return true;
};


//see AlphabetActions.js for content
//button is clicked then rename is activated
stAct.stateName = (e) => {
	if(ss.state !== 'sr') return false;
	ss.activeShape.nameAddChr(e);
	shapes.draw();
	return true;
}
//see AlphabetActions.js for content
//button is clicked then removetoken is acivated
stAct.nameRemoveToken = () => {
	ss.activeShape.nameRemoveChr();
	shapes.draw();
	return true;
}
//see AlphabetActions.js for content
//button is clicked then name has to be confirmed
stAct.checkName = () => {
	if(stAct.renameValidate()) {
		ss.systemStateActivate('s', ss.activeShape);
		shapes.draw();
		return true;
	}
}


// this is called if we are in system state 'sr' and received a mousedown event
// meaning that the user finishes renaming
// however, we only let the user finish if the name is valid (not empty, not taken)
// the rest is handled by fsmCSS (Graph/Graph.js), i.e. identify new system state based on coordinates
stAct.stateRenameExitSelect = (e) => {
	if (stAct.renameValidate()) {
		ss.systemStateMouseDown(e.offsetX, e.offsetY);
	}
};

// validate the new state name before leaving the system state 'sr'
// check if the provided name is empty (error)
// check if the provided name is already taken (error)
// otherwise the name is valid
// if (and only if) the name changed we update all transitions involving the state
// meaning that the state name appears in the transition label
// further, we notify all stakeholders that the model changed
stAct.renameValidate = () => {
	const st = ss.activeShape;
	if (st.name.length === 0) {
		// eslint-disable-next-line no-alert
		alert('Please provide a name!');
		return false;
	}
	if(st.name === '𝑁'){
		alert('The name 𝑁 is blocked!');
		return false;
	}
	// should move the next function here
	const st2 = shapes.findStateNameConflict(st);
	if (st2 !== null) {
		// eslint-disable-next-line no-alert
		alert('There already exists a state with this name!');
		return false;
	}
	if (st.name !== ss.nameOld) {
		st.updateTransitions();
		ss.callback(shapes.shMap);
	}
	return true;
};

// system state is 's', user pressed ctrl to create transition
// we activate selectionTransitionTarget, which is then used
// by stateEventMgr to identify that we are in system state 's'/'t'
stAct.stateActivateTransition = () => {
	ss.selectionTransitionTarget = true;
};

// system state 's', user pressed INS
// we change the system state to 'sr'
stAct.stateActivateRename = () => {
	ss.systemStateActivate('sr', ss.activeShape);
};

// system state 's', user pressed DEL
// we call stateDelete to delete the selected state
// we change the system state to 'i'
stAct.stateActivateDelete = () => {
	if (ss.activeShape.id !== 's0') {
		stAct.stateDelete(ss.activeShape);
		ss.systemStateActivate('i', null);
		shapes.draw();
	}
};

// usually we enter the system state 's' using fsmCSS.systemStateActivate
// for any non-trivial system state change
// this function is only called when we leave 's'/'t' without creating a transition
stAct.stateActivateIdle = () => {
	ss.selectionTransitionTarget = false;
};

// creates a new state, triggered by a double click on the canvas
// we generate a new id, return an error if the instance limit is reached
// otherwise we create a new state at the given position, add it to the shapes
// and enter the system state 'sr' since the user needs to provide a name
// Remark: stakeholders are only informed when the state has a name (i.e. when we leave 'sr')
stAct.stateCreate = (e) => {
	const id = shapes.generateFreeID('s');
	if (id.length === 0) {
		// eslint-disable-next-line no-alert
		alert('Only ' + instLimit + ' states allowed, limit reached!');
		return false;
	}
	const st = new State(id, e.offsetX, e.offsetY);
	//we can't create a states which is colliding with another state
	if(shapes.stateconflict(st)) {alert("Collision with another State");return false;}
	shapes.addShape(id, st);
	ss.systemStateActivate('sr', st);
	shapes.draw();
	return false;
};

// deletes a state, triggered in system state 's' when DEL is pressed
// first, we deactivate the state which takes care of all highlights (including transitions)
// we delete all transitions that invlove the state
// we delete the state and inform stakeholders on the model change
stAct.stateDelete = (sh) => {
	let id;
	sh.deactivate();
	// eslint-disable-next-line guard-for-in, no-restricted-syntax
	for (id in sh.transitions.in) {
		trAct.transitionDelete(shapes.getShape(id), false);
	}
	// eslint-disable-next-line guard-for-in, no-restricted-syntax
	for (id in sh.transitions.out) {
		trAct.transitionDelete(shapes.getShape(id), false);
	}
	// eslint-disable-next-line guard-for-in, no-restricted-syntax
	for (id in sh.transitions.factor) {
		trAct.transitionDelete(shapes.getShape(id), false);
	}
	shapes.deleteShape(sh.id);
	ss.callback(shapes.shMap);
};

// called by fsmCSS.init in Graph.js
stAct.init = (shapeMgr, systemState, transitionActions, instanceLimit) => {
	shapes = shapeMgr;
	ss = systemState;
	trAct = transitionActions;
	instLimit = instanceLimit;
};

export default stAct;
