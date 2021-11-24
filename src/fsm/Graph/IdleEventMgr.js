/*
 * Idle Event Manager
 * 
 * Canvas events are delegated from Event Handler to Event Manager,
 * and then end up here if we are in system state idle (and processing is required)
 */

const eMgr = {};
let ss = {}; // fsmCSS in Graph/Graph.js
let stAct = {};

// we are trying to select something, this is taken care of in fsmCSS
eMgr.mouseDown = (e) => {
	ss.systemStateMouseDown(e.offsetX, e.offsetY);
};

// creating a new state, delegated to state actions
eMgr.dblClick = (e) => {
	// idle state; MouseDown ensures that we double clicked empty space (b/c else state change)
	stAct.stateCreate(e);
};

// initializes with fsmCSS and state actions
eMgr.init = (systemState, stateActions) => {
	ss = systemState;
	stAct = stateActions;
};

export default eMgr;
