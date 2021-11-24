/*
 * This file only serves as demonstration.
 */

import fsm from './fsm/FSM';

let cont = null;

/*
 *
 * Minimum Working Example
 *
 */
function update() {
	const ode = fsm.getODEs();
	let str = 'Click this pane to update ODEs.<br />';
	// The map containing the state ids as keys and names as values
	ode.states.forEach((value, key) => {
		str += '(' + key + ',' + value + ') ';
	});
	str += '<br />';
	// The set containing the rate names
	ode.rates.forEach((value) => {
		str += value + ' ';
	});
	str += '<br />';
	// The object containing the equations
	// Level 1: A map with the state ids as keys and arrays as values
	// Level 2: Array describing the sum, elements are contributions to sum
	// Level 3: Contributions to sum are objects with properties "sign" (+-1) and "prod"
	// Level 4: Property "prod" is an array modelling the product, elements are factors
	// Level 5: Each Factor is array f with type f[0] ("r"/"s") and value f[1] (rate name/state id)
	ode.equations.forEach((sumArray, stID) => {
		str += stID + ': ';
		let sStr = '';
		sumArray.forEach((contribution) => {
			// sign of the contribution
			let pStr = contribution.sign > 0 ? '+' : '-';
			// The array contribution.prod containing the factors
			contribution.prod.forEach((factor) => {
				if (factor[0] === 'r') pStr += factor[1];
				else pStr += ode.states.get(factor[1]); // case 's': let's take the name for the id
			});
			sStr += pStr;
		});
		if (sStr === '') str += '0';
		else str += sStr;
		str += '<br />';
	});
	cont.innerHTML = str;
}

const example = {};

example.init = () => {
	cont = document.getElementById('exampleID');
	cont.addEventListener('mousedown', update);
};
export default example;
