/*
 * Transition Event Manager
 * 
 * Canvas events are delegated from Event Handler to Event Manager,
 * and then end up here if we are in system state 't' (or some substate and processing is required)
 */

let codes = {}; // key codes for substates (e.g. system state 't' + key 't'=target selection)
const eMgr = {}; // the event manager for system state 't'
let ss = {}; // fsmCSS in Graph/Graph.js
let trAct = {}; //transitionActions to implement the user request

// returns the correct substate of system state 't'
// 'i' transition selected
// 's' transition source
// 't' transition target
// 'm' moving
// 'r' rename
// 'f' deprecated (factor selection)
function computeState() {
	let res;
	if (ss.state === 't') {
		if (ss.selectionTransitionTarget) res = 't';
		else if (ss.selectionTransitionSource) res = 's';
		else if (ss.selectionTransitionFactor) res = 'f';
		else res = 'i';
	} else if (ss.state === 'tm') res = 'm';
	else if (ss.state === 'tr') res = 'r';
	else res = null;
	return res;
}

// process key event when in system state 't'/'i' (see above)
function keyDownIdle(e) {
	const key = e.keycode || e.which;
	switch (key) {
		case codes.Target:
			trAct.transitionActivateTarget();
			break;
		case codes.Source:
			trAct.transitionActivateSource();
			break;
		case codes.Factor:
			trAct.transitionActivateFactor();
			break;
		case codes.Rename:
			trAct.transitionActivateRename();
			break;
		case codes.Delete:
			trAct.transitionActivateDelete();
			break;
		default:
			break;
	}
}

// mousedown, according to system state and substate
eMgr.mouseDown = (e) => {
	const state = computeState();
	switch (state) {
		case 'i':
			ss.systemStateMouseDown(e.offsetX, e.offsetY);
			break;
		case 't':
			trAct.transitionSelectTarget(e);
			break;
		case 's':
			trAct.transitionSelectSource(e);
			break;
		case 'f':
			trAct.transitionSelectFactor(e);
			break;
		case 'r':
			trAct.transitionRenameExitSelect(e);
			break;
		// state m not possible
		default:
			break;
	}
};

// mouse move, only relevant for 'tm'
eMgr.mouseMove = (e) => {
	const state = computeState();
	if (state === 'm') ss.moveObject(e);
};

// mouse cancel, only relevant for 'tm'
eMgr.mouseCancel = () => {
	const state = computeState();
	if (state === 'm') ss.moveStop();
};

// keydown, delegate according to substate
// recall: renaming is not (physical) keyboard based, but mouse based (keyboard frame)
eMgr.keyDown = (e) => {
	const state = computeState();
	switch (state) {
		case 'i':
			keyDownIdle(e);
			break;
		default:
			break;
	}
};

// keyup, only relevant if we want to exit source/target mode (factor deprecated)
eMgr.keyUp = (e) => {
	const state = computeState();
	const key = e.keycode || e.which;
	if (state === 't' && key === codes.Target) trAct.transitionActivateIdle();
	else if (state === 's' && key === codes.Source) {
		trAct.transitionActivateIdle();
	} else if (state === 'f' && key === codes.Factor) {
		trAct.transitionActivateIdle();
	}
};

// init, called by event manager
eMgr.init = (systemState, transitionActions, keys) => {
	ss = systemState;
	trAct = transitionActions;
	codes = keys;
};

export default eMgr;
