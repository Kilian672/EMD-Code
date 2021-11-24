/*
 * State Event Manager
 * 
 * Canvas events are delegated from Event Handler to Event Manager,
 * and then end up here if we are in system state 's' (or some substate and processing is required)
 */


let codes = {}; // key codes for substates (e.g. system state 's' + ctrl=transition creation)
const eMgr = {}; // the event manager for system state 's'
let ss = {}; // fsmCSS in Graph/Graph.js
let stateAct = {}; //stateActions to implement the user request

// returns the correct substate of system state 's'
// 't' transition creation
// 'i' state selected
// 'm' moving
// 'r' rename
function computeState() {
	let res;
	if (ss.state === 's') {
		if (ss.selectionTransitionTarget) res = 't';
		else res = 'i';
	} else if (ss.state === 'sm') res = 'm';
	else if (ss.state === 'sr') res = 'r';
	else res = null;
	return res;
}

// process key event when in system state 's'/'i' (see above)
function keyDownIdle(key) {
	switch (key) {
		case codes.Transition:
			stateAct.stateActivateTransition();
			break;
		case codes.Rename:
			stateAct.stateActivateRename();
			break;
		case codes.Delete:
			stateAct.stateActivateDelete();
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
			stateAct.stateSelectTransitionTarget(e);
			break;
		case 'r':
			stateAct.stateRenameExitSelect(e);
			break;
		// state m not possible
		default:
			break;
	}
};

// mouse move, only relevant for 'sm'
eMgr.mouseMove = (e) => {
	const state = computeState();
	if (state === 'm') ss.moveObject(e);
};

// mouse cancel, only relevant for 'sm'
eMgr.mouseCancel = () => {
	const state = computeState();
	if (state === 'm') ss.moveStop();
};

// keydown, delegate according to substate
eMgr.keyDown = (e) => {
	const state = computeState();
	const key = e.keycode || e.which;
	switch (state) {
		case 'i':
			keyDownIdle(key);
			break;
		case 'r':
			stateAct.renameKeyDown(e);
			break;
		default:
			break;
	}
};

// keyup, only relevant if we want to exit transition creation mode
eMgr.keyUp = (e) => {
	const state = computeState();
	const key = e.keycode || e.which;
	if (state === 't' && key === codes.Transition) stateAct.stateActivateIdle();
};

// init, called by event manager
eMgr.init = (systemState, stateActions, keys) => {
	ss = systemState;
	codes = keys;
	stateAct = stateActions;
};

export default eMgr;
