/*
 * AlphabetActions
 *
 *implements Action to change the Alphabet
 *manages the input of the virtual keyboard and the changes of the virtual keyboard layout
 *updates the infobox near the mouse pointer
 * 
 * 
*/
import editor from './Editor';

let ss = {}; // fsmCSS, Graph/Graph.js
let trAct = {}; // transitionActions
let stAct = {}; // stateActions
let spaAct = {}; // specialArrowActions
let keyinfo = {}; // info, Constants/Infotips 
let infocount = 0; // only for alpAct.showinfo 

const alpAct = {}; // main object here

//called by FSM.js, onclick event on the specialbuttons to change alphabet
alpAct.updateAlphabetL = () => {
	editor.updateAlphabet('L', 'C');
};
alpAct.updateAlphabetG = () => {
	editor.updateAlphabet('G', 'S');
};
alpAct.updateAlphabetS = () => {
	editor.updateAlphabet('S', 'S');
};
alpAct.updateAlphabetlow = () => {
	editor.updateAlphabetCase("low");
};
alpAct.updateAlphabetup = () => {
	editor.updateAlphabetCase("up");
};
//called by FSM.js alphabet button clicked, now stAct.stateName 
//or trAct.nameAppendRate is called
alpAct.letterIn = (r) => {
	switch (ss.state[0]){
		case 's':
			stAct.stateName(r);
			break;
		case 't':
			trAct.nameAppendRate(r);
			break;
		default:
			break;
	}
};
//called by FSM.js, remove button clicked, now stAct.nameRemoveToken 
//or trAct.nameRemoveToken(); is called
alpAct.RemoveTolken = () => {
	switch (ss.state){
		case 'sr':
			stAct.nameRemoveToken();
			break;
		case 'tr':
			trAct.nameRemoveToken();
			break;
		default:
			break;
	}
};
//called by FSM.js, check button is clicked, now stAct.checkName 
//or trAct.nameConfirm is called
alpAct.check = () => {
	switch (ss.state[0]){
		case 's':
			stAct.checkName();
			break;
		case 't':
			trAct.nameConfirm();
			break;
		default:
			break;
	}
};
//called by FSM.js, delete button clicked, now stAct.stateActivateDelete 
//or trAct.transitionActivateDelete is called
alpAct.delete = () => {
	switch (ss.state[0]){
		case 's':
			stAct.stateActivateDelete();
			break;
		case 't':
			spaAct.rearrangement();
			trAct.transitionActivateDelete();
			break;
		default:
			break;
	}
};
//called by FSM.js, rename button is clicked, now stAct.stateActivateRename 
//or trAct.transitionActivateRename is called
alpAct.rename = () => {
	switch (ss.state[0]){
		case 's':
			stAct.stateActivateRename();
			break;
		case 't':
			trAct.transitionActivateRename();
			break;
		default:
			break;
	}
};
//calles by FSM.js, arrowIn button clicked, now create a new SpecialArrow with target the active shape
alpAct.arrowIn = () => {
	spaAct.specialArrowCreate('in');
};
//calles by FSM.js, arrowOut button clicked, now create a new SpecialArrow with source the active shape
alpAct.arrowOut = () => {
	spaAct.specialArrowCreate('out');
};

//called by FSM.js, newTransition button is clicked
alpAct.newTransition = () => {
	stAct.stateActivateTransition();
	editor.updateSpecialKeys('X');
	//alert('click a State to create a transition and/or click X');
};
//special layout of the alphabet box, so user can vallidate the input 
//or leave the selection 
alpAct.leaveX = () => {
	switch (ss.state){
		case 's':
			stAct.stateActivateIdle();
			editor.updateSpecialKeys('s');
			alpAct.systemupdate('s');
			break;
		case 't':
			trAct.transitionActivateIdle();
			editor.updateSpecialKeys('t');
			alpAct.systemupdate('t');
			break;
		default:
			break;
	}
};
//called by FSM.js, transitiontarget button is clicked 
//user is forced to click a state or the X button which is shown with editor.updateSpecialKeys('X')
alpAct.transitiontarget = () => {
	trAct.transitionActivateTarget();
	editor.updateSpecialKeys('X');
	//alert('select a State as new target for the transition and/or click X');
};
//called by FSM.js, transitionsource button is clicked
//user is forced to click a state or the X button which is shown with editor.updateSpecialKeys('X')
alpAct.transitionsource = () => {
	trAct.transitionActivateSource();
	editor.updateSpecialKeys('X');
	//alert('select a State as new source for the transition and/or click X');
};
//called by alpAct.checkenter, alpAct.Deleteenter, ....; with a string as paramenter which is the shown info-text
//the info-DIV is shown relativ to the mouse-position and is hidden again after a few second
//(here the var infocount helps to reset the timer)
alpAct.showinfo = (info) => {
	let e  = window.event;
	let divinfo = document.getElementById('infoID');
	divinfo.style.left = e.clientX + 'px';
	let y = e.clientY - 50;
	divinfo.style.top = y + 'px';
	divinfo.style.visibility = 'visible';
	divinfo.innerHTML = info;
	if(infocount === 0){
		infocount++;
		setTimeout(function () {divinfo.style.visibility = 'hidden'; infocount = 0;}, 1250);
	}
}
//called by fsmCSS.systemStateActivate every time the system status changes, so we can change the keyboard layout or let it be hidden
alpAct.systemupdate = (systemState) => {
	let divkeys = document.getElementById('inID');
	switch (systemState){
		case 's':
			divkeys.style.visibility = 'visible';
			editor.visibility('visible');
			editor.updateSpecialKeys('s');
			editor.Alphabetvisibility('hidden');
			editor.StateKeysvisibility('hidden');
			break;
		case 'sr':
			divkeys.style.visibility = 'visible';
			editor.visibility('visible');
			alpAct.updateAlphabetL();
			editor.Alphabetvisibility('visible');
			editor.updateSpecialKeys('name');
			editor.StateKeysvisibility('hidden');
			break;
		case 'sm':
			divkeys.style.visibility = 'hidden';
			editor.visibility('hidden');
			editor.Alphabetvisibility('hidden');
			break;
		case 't':
			switch(ss.activeShape.type){
				case undefined:
					divkeys.style.visibility = 'visible';
					editor.visibility('visible');
					editor.updateSpecialKeys('t');
					editor.Alphabetvisibility('hidden');
					editor.StateKeysvisibility('hidden');
					break;
				case 'in':
					divkeys.style.visibility = 'visible';
					editor.visibility('visible');
					editor.updateSpecialKeys('tspecialin');
					editor.Alphabetvisibility('hidden');
					editor.StateKeysvisibility('hidden');
					break;
				case 'out':
					divkeys.style.visibility = 'visible';
					editor.visibility('visible');
					editor.updateSpecialKeys('tspecialout');
					editor.Alphabetvisibility('hidden');
					editor.StateKeysvisibility('hidden');
					break;
				default:
					break;
			}
			break;
		case 'tr':
			divkeys.style.visibility = 'visible';
			editor.visibility('visible');
			alpAct.updateAlphabetG();
			editor.Alphabetvisibility('visible');
			editor.updateSpecialKeys('name');
			editor.StateKeysvisibility('visible');
			break;
		case 'tm':
			divkeys.style.visibility = 'hidden';
			editor.visibility('hidden');
			editor.Alphabetvisibility('hidden');
			editor.StateKeysvisibility('hidden');
			break;
		case 'i':
			divkeys.style.visibility = 'hidden';
			editor.visibility('hidden');
			editor.Alphabetvisibility('hidden');
			editor.StateKeysvisibility('hidden');
			break;
		default:
			break;
	}
};
//called by FSM.js then alpAct.showinfo is called with the fitting info-text which we get from Constants/Infotips
alpAct.checkenter = () => {
	let info = keyinfo['check'];
	alpAct.showinfo(info);
};
alpAct.Deleteenter = () => {
	let info = keyinfo['Delete'];
	switch (ss.state){
		case 's':
			info += ' state';
			break;
		case 't':
			if(ss.activeShape.type !== undefined) {
				info += ' special arrow';
			}else{info += ' transition';}
			break;
		default:
			break;
	}
	alpAct.showinfo(info);
};
alpAct.Renter = () =>  {
	let info = keyinfo['rename'];
	alpAct.showinfo(info);
};
alpAct.inenter = () => {
	let info = keyinfo['in'];
	alpAct.showinfo(info);
};
alpAct.outenter = () =>{
	let info = keyinfo['out'];
	alpAct.showinfo(info);
};
alpAct.Senter = () =>{
	let info = keyinfo['S'];
	alpAct.showinfo(info);
};
alpAct.Genter = () =>{
	let info = keyinfo['G'];
	alpAct.showinfo(info);
};
alpAct.Lenter = () =>{
	let info = keyinfo['L'];
	alpAct.showinfo(info);
};
alpAct.upenter = () =>{
	let info = keyinfo['up'];
	alpAct.showinfo(info);
};
alpAct.lowenter = () =>{
	let info = keyinfo['low'];
	alpAct.showinfo(info);
};
alpAct.Tenter = () =>{
	let info = keyinfo['T'];
	alpAct.showinfo(info);
};
alpAct.Xenter = () =>{
	let info = keyinfo['X'];
	alpAct.showinfo(info);
};
alpAct.tagetenter = () =>{
	let info = keyinfo['target'];
	alpAct.showinfo(info);
};
alpAct.sourceenter = () =>{
	let info = keyinfo['source'];
	alpAct.showinfo(info);
};
// called by fsmCSS.init in Graph.js
alpAct.init = (systemState, transitionActions, stateActions, specialArrowActions, tooltipsInfo) => {
	ss = systemState;
	trAct = transitionActions;
	stAct = stateActions;
	spaAct = specialArrowActions;
	keyinfo = tooltipsInfo;
};

export default alpAct;