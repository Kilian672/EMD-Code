/*
 * Semantic Event Handling
 * This is only used for mapping an event to the intended action, meaning e.g.
 * We're idle and double click -> create state
 * Left click -> select
 * Ctrl key in state State -> transition creation mode (by selecting target)
 * ...
 * 
 * Here, we only delegate the incoming events from EventHandler to the
 * event managers for the corresponding system state 'i', 's', 't'
 */

import initCanvasEvents from './EventHandler'; // source events from canvas, technical
import sEM from './StateEventMgr'; // specific for system state 's'
import tEM from './TransitionEventMgr'; // specific for system state 't'
import iEM from './IdleEventMgr'; // specific for system state 'i'

const eMgr = {}; // (semantic) event manager
let ss = {}; // system state

// maps the granular system state ('i','s','t','sm','sr','tm','tr') to the base state ('i','s','t')
function computeState() {
	let res;
	switch (ss.state) {
		case 's':
		case 'sr':
		case 'sm':
			res = 's';
			break;
		case 't':
		case 'tr':
		case 'tm':
			res = 't';
			break;
		case 'i':
			res = 'i';
			break;
		default:
			break;
	}
	return res;
}

eMgr.mouseDown = (e) => {
	const state = computeState();
	switch (state) {
		case 'i':
			iEM.mouseDown(e);
			break;
		case 's':
			sEM.mouseDown(e);
			break;
		case 't':
			tEM.mouseDown(e);
			break;
		default:
			break;
	}
};
eMgr.dblClick = (e) => {
	const state = computeState();
	if (state !== 'i') return false;
	iEM.dblClick(e);
	return false;
};
eMgr.mouseCancel = () => {
	const state = computeState();
	switch (state) {
		case 's':
			sEM.mouseCancel();
			break;
		case 't':
			tEM.mouseCancel();
			break;
		default:
			break;
	}
};
eMgr.mouseMove = (e) => {
	const state = computeState();
	switch (state) {
		case 's':
			sEM.mouseMove(e);
			break;
		case 't':
			tEM.mouseMove(e);
			break;
		default:
			break;
	}
};
eMgr.keyDown = (e) => {
	const state = computeState();
	switch (state) {
		case 's':
			sEM.keyDown(e);
			break;
		case 't':
			tEM.keyDown(e);
			break;
		default:
			break;
	}
};
eMgr.keyUp = (e) => {
	const state = computeState();
	switch (state) {
		case 's':
			sEM.keyUp(e);
			break;
		case 't':
			tEM.keyUp(e);
			break;
		default:2
			break;
	}
};


/*
 * function initEventManager
 * This function is called by fsmCSS (in Graph/Graph.js)
 * Arguments are the HTML canvas (for events), fsmCSS (for the system state)
 * stateActions, transitionActions (to trigger action based on events)
 * stateKeys (e.g. ctrl for transition creation)
 * transitionKeys (e.g. 't' for target, 's' for source selection)
 * 
 * We then call the initialization routines of the dedicated event managers,
 * for the canvas (idle state), states (system state 's'), transitions (system state 't')
 */
function initEventManager(
	canvas,
	systemState,
	stateActions,
	transitionActions,
	stateKeys,
	transitionKeys,
) {
	initCanvasEvents(canvas, eMgr);
	ss = systemState;
	iEM.init(ss, stateActions);
	sEM.init(ss, stateActions, stateKeys);
	tEM.init(ss, transitionActions, transitionKeys);
}

export default initEventManager;
