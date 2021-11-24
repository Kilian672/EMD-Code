/*
 * Transition Actions
 * 
 * This is similar to stateActions, but for transitions
 * Usually called by transitionEventMgr
 * But also called elsewhere, e.g. stateActions
 * since state actions induce transition actions (e.g. deletion)
 */

import Transition from './Transition';

let shapes = {};
let ss = {};
let spaAct = {};
let instLimit = 0;
const trAct = {};

// creates a new transition and returns it
// this is only called by state actions, since transitions are created in system state 's'
trAct.transitionCreate = (source, target) => {
	const id = shapes.generateFreeID('t');
	if (id.length === 0) {
		// eslint-disable-next-line no-alert
		alert('Only ' + instLimit + ' transitions allowed, limit reached!');
		return null;
	}
	const tr = new Transition(id, source, target);
	shapes.addShape(id, tr);
	return tr;
};

// change the transition target
// change is only applied if user selected a state which is not the current source/target
//then the specialArrows change place according to the target change
// stakeholders are informed
trAct.transitionSelectTarget = (e) => {
	spaAct.rearrangement();  //only important for instances of the class specialArrow
	const sh = shapes.findShape(e.offsetX, e.offsetY);
	if (sh === null) return;
	if (sh.id.substring(0, 1) !== 's') return;
	if (sh.id === ss.activeShape.source.id) return;
	if (sh.id === ss.activeShape.target.id) return;
	if(spaAct.limitspAinreached(sh)){alert("limit reached"); return;} //only important for instances of the class specialArrow
	ss.activeShape.deactivate(); // back to normal colours
	ss.activeShape.setTarget(sh);
	ss.activeShape.activate();
	spaAct.arrangement(); //only important for instances of the class specialArrow
	ss.callback(shapes.shMap);
	shapes.draw();
};

// analogous to transition target
trAct.transitionSelectSource = (e) => {
	spaAct.rearrangement(); 
	const sh = shapes.findShape(e.offsetX, e.offsetY);
	if (sh == null) return;
	if (sh.id.substring(0, 1) !== 's') return;
	if (sh.id === ss.activeShape.source.id) return;
	if (sh.id === ss.activeShape.target.id) return;
	if(spaAct.limitspAoutreached(sh)) {alert("limit reached");return;} 
	ss.activeShape.deactivate(); // back to normal colours
	ss.activeShape.setSource(sh);
	ss.activeShape.activate();
	spaAct.arrangement(); 
	ss.callback(shapes.shMap);
	shapes.draw();
};

// deprecated
trAct.transitionSelectFactor = (e) => {
	const sh = shapes.findShape(e.offsetX, e.offsetY);
	if (sh === null) return;
	if (sh.id.substring(0, 1) !== 's') return;
	ss.activeShape.deactivate(); // back to normal colours
	ss.activeShape.toggleFactor(sh);
	ss.activeShape.activate();
	ss.callback(shapes.shMap);
	shapes.draw();
};

// enter "select transition target" mode
trAct.transitionActivateTarget = () => {
	ss.selectionTransitionTarget = true;
};

// enter "select transition source" mode
trAct.transitionActivateSource = () => {
	ss.selectionTransitionSource = true;
};

// deprecated
trAct.transitionActivateFactor = () => {
	ss.selectionTransitionFactor = true;
};

// called through system state 't' and DEL
// deletes the selected transition and changes to system state idle
trAct.transitionActivateDelete = () => {
	trAct.transitionDelete(ss.activeShape);
	ss.systemStateActivate('i', null);
	shapes.draw();
};

// leaving the "trivial" substates (target/source selection) of 't'
// substate "factor selection" is deprecated
trAct.transitionActivateIdle = () => {
	ss.selectionTransitionTarget = false;
	ss.selectionTransitionSource = false;
	ss.selectionTransitionFactor = false;
};

// deletes the provided transition and updates stakeholders if update=true
// this is called when a state is deleted
// In this case multiple transitions may be deleted and we only want to
// inform stakeholders and draw once, when all affected objects are processed
trAct.transitionDelete = (tr, update = true) => {
	tr.delete();
	shapes.deleteShape(tr.id);
	if (update) {
		ss.callback(shapes.shMap);
	}
};

// triggered by system state 't' + INS
trAct.transitionActivateRename = () => {
	ss.systemStateActivate('tr', ss.activeShape);
};

// ensures that the transition label is not empty
// informs stakeholders if the name did change
trAct.nameValidate = () => {
	const tr = ss.activeShape;
	if (tr.name.length === 0) {
		// eslint-disable-next-line no-alert
		alert('Please provide a name!');
		return false;
	}
	if (tr.name !== ss.nameOld) {
		ss.callback(shapes.shMap);
	}
	return true;
};

// called by the transition editor to add a rate (greek keyboard)
trAct.nameAppendRate = (r) => {
	if (ss.state !== 'tr') return false;
	ss.activeShape.nameAddToken('r', r);
	shapes.draw();
	return true;
};

// called by the transition editor to add a plus
trAct.nameAppendPlus = () => {
	if (ss.state !== 'tr') return false;
	ss.activeShape.nameAddToken('o', 65291);
	shapes.draw();
	return true;
};

// called by the transition editor check button
// hence, we move back to system state 't' (if the name is valid)
trAct.nameConfirm = () => {
	if (ss.state !== 'tr') return false;
	ss.activeShape.nameNormalize();
	shapes.draw();
	if (trAct.nameValidate()) {
		ss.systemStateActivate('t', ss.activeShape);
		shapes.draw();
		return true;
	}
	return false;
};

// called in system state 'tr' + mousedown
// similar to name confirm, but now we may enter a different system state
// depending on the mouse coordinates
trAct.transitionRenameExitSelect = (e) => {
	ss.activeShape.nameNormalize();
	if (trAct.nameValidate()) {
		ss.systemStateMouseDown(e.offsetX, e.offsetY);
	}
};

// triggered by the transition editor (state keyboard)
trAct.nameAppendState = (s) => {
	if (ss.state !== 'tr') return false;
	ss.activeShape.nameAddToken('s', s);
	shapes.draw();
	return true;
};

// triggered by the transition editor (backspace)
trAct.nameRemoveToken = () => {
	if (ss.state !== 'tr') return false;
	ss.activeShape.nameRemoveToken();
	shapes.draw();
	return true;
};

//called by fsmCSS.init (Graph/Graph.js)
trAct.init = (shapeMgr, systemState, instanceLimit, specialArrowActions) => {
	shapes = shapeMgr;
	ss = systemState;
	instLimit = instanceLimit;
	spaAct = specialArrowActions;
};

export default trAct;
