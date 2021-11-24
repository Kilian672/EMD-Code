/*
 * Transition
 *
 * All shapes of type 't' (transition) are instances of this class
 */

import constants from '../Constants/Constants'; // used for e.g. colors

class fsmTransition {

	// Arguments:
	// pre-generated id (shapes.js)
	// source state s
	// target state t
	//
	// nameArr does not only store symbols, but types and objects
	// we have type 's' for state, then the value is a state object (instance of state.js)
	// we have type 'r' for rate, then the value is a unicode (the actual code)
	// we have type 'o' for operation, currently this is only '+'
	// the name is the string corresponding to nameArr
	//
	// color is the current color (default, selected, affected)
	// shape stores the actual start and end of the line (which are on state circle boundaries)
	// factors stores the states appearing in the label
	// source stores the source state
	// target stores the target state
	constructor(id, s, t) {
		this.id = id;
		this.nameArr = [];
		this.name = '';
		this.colour = constants.transitionDefaultColour;
		this.lineWidth = 1;
		this.shape = {
			source: { point: { x: 0, y: 0 } },
			target: { point: { x: 0, y: 0 } },
		};
		this.factors = [];
		s.transitionAdd(this, 'out');
		t.transitionAdd(this, 'in');
		this.source = s;
		this.target = t;
		this.updateShape();
	}

	// deletes the transition
	// deactivates it first for color management
	// removes it from all affected states
	delete() {
		let id;
		this.deactivate();
		this.source.transitionDelete(this, 'out');
		this.target.transitionDelete(this, 'in');
		// eslint-disable-next-line guard-for-in, no-restricted-syntax
		for (id in this.factors) {
			this.factors[id].transitionDelete(this, 'factor');
		}
	}

	//change the target state
	setTarget(t) {
		this.target.transitionDelete(this, 'in');
		this.target = t;
		t.transitionAdd(this, 'in');
		this.updateShape();
	}

	// change the source state
	setSource(s) {
		this.source.transitionDelete(this, 'out');
		this.source = s;
		s.transitionAdd(this, 'out');
		this.updateShape();
	}

	/*
	 *  DE-ACTIVATION
	 */

	// activates transition: assigns proper colours to components involved
	activate() {
		let id;
		this.colour = constants.transitionSelectedColour;
		// eslint-disable-next-line guard-for-in, no-restricted-syntax
		for (id in this.factors) {
			this.factors[id].colour = constants.transitionStateFactorColour;
		}
	}

	// deactivates transition: assigns default colours to components involved
	deactivate() {
		let id;
		this.colour = constants.transitionDefaultColour;
		// eslint-disable-next-line guard-for-in, no-restricted-syntax
		for (id in this.factors) {
			this.factors[id].colour = constants.stateDefaultColour;
		}
	}

	/*
	 *  MOVING
	 *  not implemented yet
	 *  would allow to deform the transition (curve) without changing state positions
	 */

	// eslint-disable-next-line class-methods-use-this, no-unused-vars
	moveStart(xm, ym) {}

	// eslint-disable-next-line class-methods-use-this, no-unused-vars
	move(x, y) {}

	// eslint-disable-next-line class-methods-use-this, no-unused-vars
	moveStop() {}

	/*
	 *  UPDATE
	 */

	// when states move we need to recompute the start and end point
	updateShape() {
		const midX = (this.source.x + this.target.x) / 2;
		const midY = (this.source.y + this.target.y) / 2;
		this.shape.source.point = this.source.closestPointOnCircle(midX, midY);
		this.shape.target.point = this.target.closestPointOnCircle(midX, midY);
	}

	// build the name from scratch when nameArr changed
	nameUpdate() {
		let i;
		let type;
		let token;
		const arr = this.nameArr;
		const len = arr.length;
		this.name = '';
		for (i = 0; i < len; i += 1) {
			[type, token] = arr[i];
			if (type !== 's') this.name += String.fromCodePoint(token);
			else this.name += token.name;
		}
	}

	// updates the states when nameArr was changed
	// removes the transition from all states that appeared in the label
	// adds the transition to all states appearing in the label
	// Remark: Can only take place while transition is active
	//         States can only be added/removed in the transition label when the transition is selected
	factorUpdate() {
		let id;
		let type;
		let token;
		const arr = this.nameArr;
		const len = arr.length;
		// eslint-disable-next-line guard-for-in, no-restricted-syntax
		for (id in this.factors) {
			this.factors[id].transitionDelete(this, 'factor');
			this.factors[id].colour = constants.stateDefaultColour;
		}
		this.factors = [];
		// eslint-disable-next-line guard-for-in, no-restricted-syntax
		for (id = 0; id < len; id += 1) {
			[type, token] = arr[id];
			if (type === 's') {
				this.factors[token.id] = token;
				token.transitionAdd(this, 'factor');
				token.colour = constants.transitionStateFactorColour;
			}
		}
	}

	/*
	 *  STRING MANIPULATION: RENAMING
	 */

	// add a token (state object, rate unicode, operator plus) to nameArr
	nameAddToken(type, el) {
		const arr = this.nameArr;
		const len = arr.length;
		const lt = len > 0 ? arr[len - 1][0] : '';
		if (type === 'o' && lt === 'o') return false;
		this.nameArr.push([type, el]);
		this.nameUpdate();
		this.factorUpdate();
		return true;
	}

	// remove the last token
	nameRemoveToken() {
		if (this.nameArr.length === 0) return false;
		this.nameArr.pop();
		this.nameUpdate();
		this.factorUpdate();
		return true;
	}

	// remove a plus at the end
	nameNormalize() {
		const arr = this.nameArr;
		const len = arr.length;
		if (len > 0 && arr[len - 1][0] === 'o') this.nameRemoveToken();
	}

	/*
	 *  DRAWING
	 */

	// draws the transition
	// we draw the line (knowing start and end points)
	// we figure out the angle and draw the arrow head
	// we compute the label position
	draw() {
		const ctx = constants.context;
		ctx.lineWidth = this.lineWidth;
		ctx.strokeStyle = this.colour;
		ctx.fillStyle = this.colour;
		ctx.font = '20px Verdana, Geneva, Tahoma, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.beginPath();
		ctx.moveTo(this.shape.source.point.x, this.shape.source.point.y);
		ctx.lineTo(this.shape.target.point.x, this.shape.target.point.y);
		ctx.stroke();
		// all data for drawing has to be precomputed!
		// arrowhead
		let dx = this.shape.target.point.x - this.shape.source.point.x;
		let dy = this.shape.target.point.y - this.shape.source.point.y;
		const length = Math.sqrt(dx * dx + dy * dy);
		dx /= length;
		dy /= length;
		ctx.beginPath();
		ctx.moveTo(this.shape.target.point.x, this.shape.target.point.y);
		ctx.lineTo(
			this.shape.target.point.x - 8 * dx + 5 * dy,
			this.shape.target.point.y - 8 * dy - 5 * dx,
		);
		ctx.lineTo(
			this.shape.target.point.x - 8 * dx - 5 * dy,
			this.shape.target.point.y - 8 * dy + 5 * dx,
		);
		ctx.fill();
		// text
		let textX = (this.shape.source.point.x + this.shape.target.point.x) / 2;
		let textY = (this.shape.source.point.y + this.shape.target.point.y) / 2;
		textX += 15 * dy;
		textY += -15 * dx;
		ctx.fillText(this.name, textX, textY);
	}
}

export default fsmTransition;
