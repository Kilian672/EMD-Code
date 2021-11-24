/*
 *
 * SpecialArrows Actions
 * implements actions that are related to the SpecialArrows
 * 
 */

import SpecialArrow from './SpecialArrow';
import State from './State';

let shapes = {}; //shapes array, Graph/Shapes.js
let ss = {};  // fsmCSS, Graph/Graph.js
let instLimit = 0; //instance limit for one state and for one type
const spaAct = {};  //main object here


//return all states which are Special Arrow linked with the state in an array
spaAct.returnstates = (state) => {
	let shID;
	let sh;
	let shType;
	let res = [];
	for([shID, sh] of shapes.shMap) {
		shType = shID.substring(0,1);
		if(shType === 't' && sh.type !== undefined){
				if(sh.source === state){
					res.push(sh.target);
				}else if(sh.target === state){
					res.push(sh.source);
				}
		}
	}
	return res;
};

//creates a new SpecialArrow, triggered by button click
//we generate to ids, one for the transition which is the SpecialArrow and one for the state dummy
//the state dummy is than placed depended on the SpecialArrow type and the number of istances we have created so far
//after that user has to enter a name and then all stakeholders are informed 
spaAct.specialArrowCreate = (type) =>{
	const idstate = shapes.generateFreeID('s');
	const id = shapes.generateFreeID('t');
	let spA;
	let x = ss.activeShape.x;
	let y = ss.activeShape.y;
	let xmove = 0;
	let ymove = 0;
	let numberin = 0;
	let numberout = 0;
	const a = spaAct.returnstates(ss.activeShape);
	for(let i = 0; i<a.length; i++){
		if(((ss.activeShape.x-a[i].x)<=0 && (ss.activeShape.y-a[i].y)>0)||((a[i].x-ss.activeShape.x)>0 && (a[i].y-ss.activeShape.y)>0)){ numberin++;}
		else{ numberout++;}
	}
	if(numberin === instLimit && type ==='in'|| numberout === instLimit && type === 'out') {
		alert('Only ' + instLimit + ' specialArrows allowed, limit reached!');
		return null;
	}
	const angle = Math.PI / instLimit; 
	switch (type) {
		case 'in':
			xmove = Math.cos(Math.PI/2.0-angle*numberin)*100;
			ymove = Math.cos(angle*numberin)*100;
			const source = new State(idstate, x+xmove, y-ymove,1);
			spA = new SpecialArrow(id, source, ss.activeShape, type);
			break;
		case 'out':
			xmove = Math.cos(Math.PI/2.0-angle*numberout)*100;
			ymove = Math.cos(angle*numberout)*100;
			const target = new State(idstate, x-xmove, y+ymove,1);
			spA = new SpecialArrow(id, ss.activeShape, target, type);
			break;
		default:
			break;
	}
	shapes.addShape(id, spA);
	ss.activeShape.deactivate();
	ss.systemStateActivate('tr', spA);
	shapes.draw();
	return false;
};
//called by AlphabetActions.delete
//before a Specialarrow can be deleted the position of all other SpecialArrows is new calculated
//and they are new positioned
spaAct.rearrangement = () => {
	let type = ss.activeShape.type;
	let state = null;
	switch(type){
		case 'in':
			state = ss.activeShape.target;
			break;
		case 'out':
			state = ss.activeShape.source;
			break;
		default:
			break;
	}
	let countin =0;
	let countout =0;
	let xmove=0;
	let ymove=0;
	let shID;
	let sh;
	let shType;
	const angle = Math.PI / instLimit; 

	for([shID, sh] of shapes.shMap) {
		shType = shID.substring(0,1);
		if(shType === 't' && sh.type !== undefined && shID != ss.activeShape.id){
				if(sh.source === state){
					xmove = Math.cos(Math.PI/2.0-angle*countout)*100;
					ymove = Math.cos(angle*countout)*100;
					countout++;
					sh.target.move(state.x - xmove, state.y+ymove);
				}else if(sh.target === state){
					xmove = Math.cos(Math.PI/2.0-angle*countin)*100;
					ymove = Math.cos(angle*countin)*100;
					countin++;
					sh.source.move(state.x+xmove, state.y-ymove);
				}
		}
	}
}
//nearly the same as spAct.rearrangement but here the input is not ignored in the new position
spaAct.arrangement = (spA = ss.activeShape) => {
	let type = spA.type;
	let state = null;
	switch(type){
		case 'in':
			state = spA.target;
			break;
		case 'out':
			state = spA.source;
			break;
		default:
			break;
	}
	let countin =0;
	let countout =0;
	let xmove=0;
	let ymove=0;
	let shID;
	let sh;
	let shType;
	const angle = Math.PI / instLimit; 

	for([shID, sh] of shapes.shMap) {
		shType = shID.substring(0,1);
		if(shType === 't' && sh.type !== undefined){
				if(sh.source === state){
					xmove = Math.cos(Math.PI/2.0-angle*countout)*100;
					ymove = Math.cos(angle*countout)*100;
					countout++;
					sh.target.move(state.x - xmove, state.y+ymove);
				}else if(sh.target === state){
					xmove = Math.cos(Math.PI/2.0-angle*countin)*100;
					ymove = Math.cos(angle*countin)*100;
					countin++;
					sh.source.move(state.x+xmove, state.y-ymove);
				}
		}
	}
}
//nearly the same as spAct.arrangement but here the input is a state
spaAct.arrangementstate = (state = ss.activeShape) => {
	let countin =0;
	let countout =0;
	let xmove=0;
	let ymove=0;
	let shID;
	let sh;
	let shType;
	const angle = Math.PI / instLimit; 

	for([shID, sh] of shapes.shMap) {
		shType = shID.substring(0,1);
		if(shType === 't' && sh.type !== undefined){
				if(sh.type === 'out' && sh.source === state){
					xmove = Math.cos(Math.PI/2.0-angle*countout)*100;
					ymove = Math.cos(angle*countout)*100;
					countout++;
					sh.target.move(state.x - xmove, state.y+ymove);
				}else if(sh.type === 'in' && sh.target === state){
					xmove = Math.cos(Math.PI/2.0-angle*countin)*100;
					ymove = Math.cos(angle*countin)*100;
					countin++;
					sh.source.move(state.x+xmove, state.y-ymove);
				}
		}
	}
}
//called by TransitionActions, returns true if limit for Specialarrows with type 'out' is reached
spaAct.limitspAoutreached = (state = ss.activeShape) => {
	let countout =0;
	let shID;
	let sh;
	let shType;
	for([shID, sh] of shapes.shMap) {
		shType = shID.substring(0,1);
		if(shType === 't' && sh.type === 'out' && sh.source === state){
				countout++;
		}
	}
	if(countout >= instLimit)return true;
	return false;
}
//called by TransitionActions, returns true if limit for Specialarrows with type 'in' is reached
spaAct.limitspAinreached = (state = ss.activeShape) => {
	let countin =0;
	let shID;
	let sh;
	let shType;

	for([shID, sh] of shapes.shMap) {
		shType = shID.substring(0,1);
		if(shType === 't' && sh.type === 'in' && sh.target === state){
				countin++;
		}
	}
	if(countin >= instLimit)return true;
	return false;
}


// called by fsmCSS.init in Graph.js
spaAct.init = (shapeMgr, systemState, instanceLimit) => {
	shapes = shapeMgr;
	ss = systemState;
	instLimit = instanceLimit;
};

export default spaAct;