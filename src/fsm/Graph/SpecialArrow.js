/*
 * SpecialArrows
 *
 * All Arrows which aren't a transition are instances of this class
 */


import fsmTransition from './Transition';

//we insert a new attribut type, so we can figure out if it is a 
//transiton or a specialArrow by checking the type
class fsmSpecialArrow extends fsmTransition{

	constructor(id, s, t, type){
		super(id, s, t);
		this.type = type; 
	}

}

export default fsmSpecialArrow;