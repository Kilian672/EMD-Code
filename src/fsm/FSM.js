/*
 * TODOS
 * Find proper id management, in particular for load/save
 * load/save
 * GUI for all inputs
 * Move Transition
 * Arithmetic Operations
 * Keyboard Styling
 * Latex
 */

// Entry point for everything related to the tab "The Model"
// We recommend to keep the webpage open for reference
//
// In this file the object EMDModel (=Epidemic Model Designer - Model) is defined
// The object has two functions
// init() initializes all components of the tab "The Model."
// getODEs() returns the system of ordinary differential equations
//           as displayed in the upper left frame in the tab "The Model"
//           the data structure is süecified in "ODE/Export"

import graph from './Graph/Graph'; // controls graph & tooltip frame (right & bottom left in "The Model")
import trAct from './Graph/TransitionActions'; // editing of transitions in graph frame
import ode from './ODE/ODE'; // controls ode frame (upper left in "The Model")
import fsmEvents from './Graph/ModelChange'; // global event manager
import transitionEditor from './TransitionEditor/Editor'; // controls keyboard frame (middle left in "The Model")
import getODEs from './ODE/Export'; // provides getODEs() function (i.e. data export)
import alpAct from './TransitionEditor/AlphabetActions'; //handles the alphabet-frame input


// Object definition
const EMDModel = {};

//function init()
EMDModel.init = () => {
	ode.init(document.getElementById('odeID')); //initialize ode frame, with a pointer to the html div
	fsmEvents.addListener(ode.update); // add the ode frame as listener (ode update when model changes)
	// keyboard frame initialization
	transitionEditor.setAlphabetHandler(alpAct.letterIn); //letterIn is called when letter is clicked

	transitionEditor.setStateKeyHandler(trAct.nameAppendState); //nameAppendState is called when state is clicked
	transitionEditor.setSpecialKeyHandler('plus', trAct.nameAppendPlus); // nameAppendPlus is called when '+' is clicked
	transitionEditor.setSpecialKeyHandler('del', alpAct.RemoveTolken); //RemoveTolken is called when "backspace" is clicked
	transitionEditor.setSpecialKeyHandler('check', alpAct.check); //check is called when the "check" symbol is clicked
	transitionEditor.setSpecialKeyHandler('L', alpAct.updateAlphabetL); //updateAlphabetL is called when L is clicked
	transitionEditor.setSpecialKeyHandler('G', alpAct.updateAlphabetG); //updateAlphabetG is called when G is clicked
	transitionEditor.setSpecialKeyHandler('S', alpAct.updateAlphabetS); //updateAlphabetS is called when S is clicked
	transitionEditor.setSpecialKeyHandler('up', alpAct.updateAlphabetup); //updateAlphabetup is called when up is clicked
	transitionEditor.setSpecialKeyHandler('low', alpAct.updateAlphabetlow); //updateAlphabetlow is called when low is clicked
	transitionEditor.setSpecialKeyHandler('Del', alpAct.delete); //delete is called when Del is clicked
	transitionEditor.setSpecialKeyHandler('R', alpAct.rename); //rename is called when R is clicked
	transitionEditor.setSpecialKeyHandler('T', alpAct.newTransition); //newTransition is called when T is clicked
	transitionEditor.setSpecialKeyHandler('X', alpAct.leaveX); //leaveX is called when X is clicked
	transitionEditor.setSpecialKeyHandler('target', alpAct.transitiontarget); //transitiontarget is called when target is clicked
	transitionEditor.setSpecialKeyHandler('source', alpAct.transitionsource); //tramsitionsource is called when source is clicked
	transitionEditor.setSpecialKeyHandler('in', alpAct.arrowIn); //arrowIn is called when in is clicked
	transitionEditor.setSpecialKeyHandler('out', alpAct.arrowOut); //arrowOut is called when out is clicked
	//analog, but the enter methods are called now
	transitionEditor.setSpecialKeyHandler('checkenter', alpAct.checkenter);
	transitionEditor.setSpecialKeyHandler('Deleteenter', alpAct.Deleteenter); 
	transitionEditor.setSpecialKeyHandler('Renter', alpAct.Renter); 
	transitionEditor.setSpecialKeyHandler('inenter', alpAct.inenter); 
	transitionEditor.setSpecialKeyHandler('outenter', alpAct.outenter); 
	transitionEditor.setSpecialKeyHandler('Genter', alpAct.Genter); 
	transitionEditor.setSpecialKeyHandler('Lenter', alpAct.Lenter); 
	transitionEditor.setSpecialKeyHandler('Senter', alpAct.Senter);
	transitionEditor.setSpecialKeyHandler('upenter', alpAct.upenter);
	transitionEditor.setSpecialKeyHandler('lowenter', alpAct.lowenter); 
	transitionEditor.setSpecialKeyHandler('Tenter', alpAct.Tenter); 
	transitionEditor.setSpecialKeyHandler('Xenter', alpAct.Xenter); 
	transitionEditor.setSpecialKeyHandler('targetenter', alpAct.tagetenter); 
	transitionEditor.setSpecialKeyHandler('sourceenter', alpAct.sourceenter); 

	// initialize keyboard, with HTML div and the ModelChange (since we need to update the states on model change)
	transitionEditor.init(document.getElementById('inID'), fsmEvents);
	graph.init(); // initializes graph frame (graph fetches html divs for graph & tooltip frame on its own)
};

//function getODEs()
EMDModel.getODEs = getODEs; //function getODEs() is defined in ODE/Export

export default EMDModel; // this is imported in index.js as fsm (=finite state machine)
