/*
 *
 *  STATE CLASS
 *
 * All shapes of type 's' (state) are instances of this class
 */

import constants from '../Constants/Constants'; // used for colors, stateRadius, ...

class fsmState {

	// id is generated beforehand (shapes.js), coordinates for circle center
	// we pay attention to keep the circle on the canvas
	// circle center=(x,y)
	// moveOffset is the translation vector for the circle
	// nameArr is the name as array with symbols, to deal with unicode
	// name is the concatenation of nameArr (it's annoying to extract a unicode symbol from the string name)
	// color stores the current color (idle/selected)
	// transitions stores incoming (state is target state), outgoing (state is source state)
	// and factors (state appears in the transition label, as a factor in one of the products)

	constructor(id, x, y, radius = constants.stateRadius) {
		this.radius = radius;
		this.x = Math.min(x, constants.canvas.width - this.radius);
		this.x = Math.max(this.x, this.radius);
		this.y = Math.min(y, constants.canvas.height - this.radius);
		this.y = Math.max(this.y, this.radius);
		//this.x = x;
		//this.y = y;
		this.moveOffsetX = 0;
		this.moveOffsetY = 0;
		this.id = id;
		this.nameArr = []; // javascript is not too good at handling unicode
		this.name = '';
		this.data = []; //deprecated
		this.colour = constants.stateDefaultColour;
		this.lineWidth = 1; // add flexibility
		this.transitions = { in: [], out: [], factor: [] };
	}

	// called when a transition is created (with the state as source or target) or renamed (with the state as factor)
	transitionAdd(t, typ) {
		this.transitions[typ][t.id] = t;
	}

  // called when a transition is deleted, to remove it from the list
	transitionDelete(t, typ) {
		delete this.transitions[typ][t.id];
	}

	// when the state changes its name, all factor transitions need to update their labels
	updateTransitions() {
		let id;
		// eslint-disable-next-line guard-for-in, no-restricted-syntax
		for (id in this.transitions.factor) {
			this.transitions.factor[id].nameUpdate();
		}
	}

	/*
	 *  DE-ACTIVATION
	 */

	// activates the state: assigns proper colours to components involved
	activate() {
		let id;
		this.colour = constants.stateSelectedColour;
		// eslint-disable-next-line guard-for-in, no-restricted-syntax
		for (id in this.transitions.factor) {
			this.transitions.factor[id].colour =
				constants.stateTransitionFactorColour;
		}
	}

	// deactivates state: assigns default colours to components involved
	deactivate() {
		let id;
		this.colour = constants.stateDefaultColour;
		// eslint-disable-next-line guard-for-in, no-restricted-syntax
		for (id in this.transitions.factor) {
			this.transitions.factor[id].colour = constants.transitionDefaultColour;
		}
	}

	/*
	 *  MOVING
	 */

	moveStart(xm, ym) {
		this.moveOffsetX = xm - this.x;
		this.moveOffsetY = ym - this.y;
	}

	move(xm, ym) {
		let id;
		this.x = xm - this.moveOffsetX;
		this.y = ym - this.moveOffsetY;
		this.x = Math.min(this.x, constants.canvas.width - this.radius);
		this.x = Math.max(this.x, this.radius);
		this.y = Math.min(this.y, constants.canvas.height - this.radius);
		this.y = Math.max(this.y, this.radius);
		// eslint-disable-next-line guard-for-in, no-restricted-syntax
		for (id in this.transitions.in) {
			this.transitions.in[id].updateShape();
		}
		// eslint-disable-next-line guard-for-in, no-restricted-syntax
		for (id in this.transitions.out) {
			this.transitions.out[id].updateShape();
		}
	}

	moveStop() {
		this.moveOffsetX = 0;
		this.moveOffsetY = 0;
	}

	/*
	 *  STRING MANIPULATION: RENAMING
	 */

	nameAddChr(c) {
		this.nameArr.push(c);
		this.name += String.fromCodePoint(c);
	}

	nameRemoveChr() {
		if (this.nameArr.length === 0) return false;
		this.nameArr.pop();
		this.name = constants.buildString(this.nameArr);
		return true;
	}

	/*
	 *  DRAWING
	 */

	draw() {
		if(this.radius !== 0){
		const ctx = constants.context;
		ctx.lineWidth = this.lineWidth;
		ctx.strokeStyle = this.colour;
		ctx.fillStyle = this.colour;
		ctx.font = '20px Verdana, Geneva, Tahoma, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fillText(this.name, this.x, this.y);
		}
	}

	// determines the intersection point between
	// the line connecting (x,y) and the state circle center
	// and the circle
	// this is used to draw the transitions
	closestPointOnCircle(x, y) {
		const dx = x - this.x;
		const dy = y - this.y;
		const scale = Math.sqrt(dx * dx + dy * dy);
		return {
			x: this.x + (dx * this.radius) / scale,
			y: this.y + (dy * this.radius) / scale,
		};
	}
}

export default fsmState;
