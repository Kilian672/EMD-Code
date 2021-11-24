/*
 * Graph/Graph.js
 * Defines fsmCSS (= Finite State Machine - Current System State)
 * 
 * This can be seen as the core module of the application.
 * The application is system state driven (not to be confused with the states in the graph)
 * The current system state is stored in fsmCSS.state
 * The system states are 'i' for idle (no selection),
 * 's' for state selected, 'sm' for state move, 'sr' for state rename,
 * 't' for transition selected, 'tm' for transition move and 'tr' for transition rename
 * 
 * The contents of the tooltips frame are updated corresponding to the current system state
 * User input is also processed according to the current system state
 * and the system state is changed corresponding to the user input
 */

import tooltips from '../Constants/Tooltips'; // contents of the tooltips frame
import infotips from '../Constants/Infotips'; //contents for the infotips frame
import symbols from '../Constants/Symbols'; // unicodes for lower case/upper case latin/greek/special characters
import constants from '../Constants/Constants'; // all sorts of constants, summarized for easy adjustment
import State from './State'; // the class modelling states in the graph
import initEventManager from './EventMgr'; // manages user input
import shapes from './Shapes'; // the shapes map, storing all states and transitions
import stateActions from './StateActions'; // actions for states (rename, move, etc.)
import transitionActions from './TransitionActions'; // actions for transitions (renamen, move, etc.)
import modelChange from './ModelChange'; // model change event manager
import alpAct from '../TransitionEditor/AlphabetActions'; //actions for the alphabet (delete a state/transition/specialArrow, rename ..., etc)
import specialArrowActions from './SpecialArrowActions'; //actions for the specialArrows (rename, create, arrangement, etc)


// Current System State, containes all the information we need at a given time
const fsmCSS = {}; // the main object
fsmCSS.help = tooltips; // possible contents of the tooltips frame

fsmCSS.symbols = symbols; // unicodes for all required symbols
fsmCSS.alphabet = 'L'; // by default we use the latin alphabet
fsmCSS.callback = modelChange.update; // informs all stakeholders when the model changed

// time dependent
fsmCSS.activeShape = null; // stores the currently selected shape (colored blue)
fsmCSS.selectionTransitionTarget = false; // true if we are in system state 't' and substate transition target selection
fsmCSS.selectionTransitionSource = false; // true if we are in system state 't' and substate source target selection
fsmCSS.selectionTransitionFactor = false; // deprecated
fsmCSS.state = 'i'; // initially we're in system state idle
fsmCSS.nameOld = ''; // stores the old name of a shape (when the name is changed)

// creates the initial state 'S', positioned at the upper left corner
fsmCSS.initState = () => {
	//dummy state for the population
	let id = 'n';
	let st = new State(
		id,0,0,0
	);
	shapes.addShape(id, st);
	let u = 78;
	st.nameAddChr(u);

	id = shapes.generateFreeID('s');
	st = new State(
		id,
		2 * constants.stateRadius,
		2 * constants.stateRadius,
	);
	shapes.addShape(id, st);
	u = fsmCSS.symbols.L.C.S;
	st.nameAddChr(u);
};

// main initialization function
fsmCSS.init = () => {
	constants.canvas = document.getElementById('canvasID'); // get the HTML Canvas for drawing
	constants.context = constants.canvas.getContext('2d'); // Context of the canvas for drawing
	shapes.init(
		constants.canvas,
		constants.stateRadius,
		constants.hitTargetPadding,
		constants.instancesLimit,
	);
	transitionActions.init(shapes, fsmCSS, constants.instancesLimit, specialArrowActions);
	specialArrowActions.init(shapes, fsmCSS, constants.specialArrowLimit); 
	stateActions.init(
		shapes,
		fsmCSS,
		transitionActions,
		constants.instancesLimit,
	);
	alpAct.init(fsmCSS, transitionActions, stateActions, specialArrowActions, infotips); 
	fsmCSS.helpBox = document.getElementById('helpID'); // get the HTML div for the tooltips
	fsmCSS.helpBox.innerHTML = fsmCSS.help.i; //tooltips for system state idle
	initEventManager(
		constants.canvas,
		fsmCSS,
		stateActions,
		transitionActions,
		constants.stateKeys,
		constants.transitionKeys,
	);
	fsmCSS.initState(); // create the first state 'S'
	shapes.draw(); // draw the first state
	fsmCSS.callback(shapes.shMap); // inform the stakeholders that the model changed (new state)
};

/*
 * Default function for handling a change of the system state
 * Argument st: the system state we want to move to
 * Argument sh: the shape that was selected (or null)
 * 
 * Description: If a shape was selected, we activate it and store its name (as a fallback)
 * Then we set the variables accordingly (including the tooltips), or reset them
 */
fsmCSS.systemStateActivate = (st, sh) => {
	if (sh != null) sh.activate();
	if (sh != null) fsmCSS.nameOld = sh.name;
	else fsmCSS.nameOld = '';
	fsmCSS.activeShape = sh;
	fsmCSS.state = st;
	fsmCSS.selectionTransitionFactor = false;
	fsmCSS.selectionTransitionSource = false;
	fsmCSS.selectionTransitionTarget = false;
	fsmCSS.alphabet = st === 'tr' ? 'G' : 'L'; // for transitions we prefer greek
	fsmCSS.helpBox.innerHTML = fsmCSS.help[st];
	alpAct.systemupdate(st); //calls the alphabet update -> perhaps change of the layout 
};

// SYSTEM STATE MOUSE DOWN: System State Switch Triggered by Mouse Down
fsmCSS.systemStateMouseDown = (x, y) => {
	const sh = shapes.findShape(x, y); // find the shape matching the coordinates
	// determine the correct new system state
	// if a shape is selected, it starts moving per default (since the mouse is down)
	let shType = 'i';
	if (sh != null) {
		shType = sh.id.substring(0, 1) + 'm';
		sh.moveStart(x, y);
		let a = specialArrowActions.returnstates(sh); 
		if(a.length !== 0){
			for(let i = 0; i<a.length; i++){
				a[i].moveStart(x,y);					//when a state starts moving all specialArrows have to follow
			}
		}
	}
	// if something is selected, we deactivate the old selection
	if (fsmCSS.state !== 'i') fsmCSS.activeShape.deactivate();
	// change the system state
	fsmCSS.systemStateActivate(shType, sh);
	// draw the changes
	shapes.draw();
};

// STOP MOVING: System State Switch Triggered by Mouse Up/Out
fsmCSS.moveStop = () => {
	// if we move, stop moving, change to the corresponding selection state ('sm'->'s', 'tm'->'t')
	if (fsmCSS.state.length > 1 && fsmCSS.state.substring(1, 2) === 'm') {
		fsmCSS.activeShape.moveStop();
		let a = specialArrowActions.returnstates(fsmCSS.activeShape);
		if(a.length !== 0){
			for(let i = 0; i<a.length; i++){
				a[i].moveStop();								//when a state stops moving all specialArrows have to stop moving
			}
		}
		fsmCSS.systemStateActivate(
			fsmCSS.state.substring(0, 1),
			fsmCSS.activeShape,
		);
	}
};
// move the selected shape to the new position (in system state 'sm' or 'tm')
fsmCSS.moveObject = (e) => {
	fsmCSS.activeShape.move(e.offsetX, e.offsetY);
	let a = specialArrowActions.returnstates(fsmCSS.activeShape); //array with all specialArrows according to the state
	if(a.length !== 0){
		for(let i =0; i<a.length; i++){
			a[i].move(e.offsetX, e.offsetY);
		}
	}
	for(let i = 0; i<a.length; i++){
		if(a[i].y<2){
			fsmCSS.moveStop();
			fsmCSS.activeShape.move(fsmCSS.activeShape.x, 102)
			a[i].move(a[i].x, 2);
			for(let j =0; j<a.length; j++){
				a[j].moveStop();
			}
			specialArrowActions.arrangementstate();
		}else if(a[i].x<fsmCSS.activeShape.radius){
			fsmCSS.moveStop();
			fsmCSS.activeShape.move(fsmCSS.activeShape.radius+102, fsmCSS.activeShape.y);
			for(let j =0; j<a.length; j++){
				a[j].moveStop();
			}
			specialArrowActions.arrangementstate();
		}
	}
	if(shapes.stateconflict(fsmCSS.activeShape)) {
		fsmCSS.moveStop();
		if(a.length !== 0){
			for(let i =0; i<a.length; i++){
				a[i].moveStop();
			}
		}
		let i = 0;
		let j = 0;
		let n = 1;
		//if a states is moved into another state (not another transition), we stop moving and calculate 
		//a new free spot for the state
		//then we move all specialArrows to this new position too
		while(shapes.stateconflict(fsmCSS.activeShape)){
			for(; i <= n ; i++){
				if(!shapes.stateconflict(fsmCSS.activeShape)) break;
				fsmCSS.activeShape.move(fsmCSS.activeShape.x + i, fsmCSS.activeShape.y + j);
				if(a.length !== 0){
					for(let n =0; n<a.length; n++){
						a[n].move(a[n].x + i, a[n].y +j);
					}
				}
			}
			for(; j <= n; j++){
				if(!shapes.stateconflict(fsmCSS.activeShape)) break;
				fsmCSS.activeShape.move(fsmCSS.activeShape.x + i, fsmCSS.activeShape.y + j);
				if(a.length !== 0){
					for(let n =0; n<a.length; n++){
						a[n].move(a[n].x + i, a[n].y +j);
					}
				}
			}
			n++;
			for(; i >= -n ; i--){
				if(!shapes.stateconflict(fsmCSS.activeShape)) break;
				fsmCSS.activeShape.move(fsmCSS.activeShape.x + i, fsmCSS.activeShape.y + j);
				if(a.length !== 0){
					for(let n =0; n<a.length; n++){
						a[n].move(a[n].x + i, a[n].y +j);
					}
				}
			}
			for(; j >= -n ; j--){
				if(!shapes.stateconflict(fsmCSS.activeShape)) break;
				fsmCSS.activeShape.move(fsmCSS.activeShape.x + i, fsmCSS.activeShape.y + j);
				if(a.length !== 0){
					for(let n =0; n<a.length; n++){
						a[n].move(a[n].x + i, a[n].y +j);
					}
				}
			}
			n++;
		}
	}
	shapes.draw();
};

export default fsmCSS;
