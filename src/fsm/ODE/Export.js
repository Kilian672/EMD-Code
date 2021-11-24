/*
 * ODE/Export: converts the ode data structure (see ODE) for export to plot tab
 * The exported function is getODEs (defined last, but chronologically first)
 */

import ode from './ODE'; //import the ode data structure, obtained from ode.getODEs()

/*
 * function buildStateMap
 * Argument odeMap: the ode data structure
 * return value: the map of states
 * 
 * Description: pairs [sh,equ] in ode reflect state objects and corresponding rows/equations
 * we ignore the equations and store the state id & name
 */
function buildStateMap(odeMap) {
	const sMap = new Map();
	odeMap.forEach((equ, st) => {
		sMap.set(st.id, st.name);
	});
	return sMap;
}

/*
 * function buildRateMap
 * Argument odeMap: the ode data structure
 * return value: the set of rates
 * 
 * Description: we traverse the ode data structure
 * whenever we encounter a rate (type='r') we add the symbol to the set (if not yet included)
 */
function buildRateMap(odeMap) {
	const rMap = new Set();
	odeMap.forEach((sArr) => {
		sArr.forEach((p) => {
			p.prod.forEach((f) => {
				if (f[0] === 'r') rMap.add(String.fromCodePoint(f[1]));
			});
		});
	});
	return rMap;
}

// This is just a deep copy of the ode data structure (mapping objects to ids)
// in particular, the structure is the same
function buildEquationMap(odeMap) {
	const eMap = new Map();
	odeMap.forEach((equ, st) => {
		const equ2 = [];
		equ.forEach((sp) => {
			const sp2 = {};
			sp2.sign = sp.sign;
			sp2.prod = [];
			// stores the type, for rates the symbol and for states the id
			sp.prod.forEach((f) => {
				const f2 =
					f[0] === 'r' ? [f[0], String.fromCodePoint(f[1])] : [f[0], f[1].id];
				sp2.prod.push(f2);
			});
			equ2.push(sp2);
		});
		eMap.set(st.id, equ2);
	});
	return eMap;
}

/*
 * function getODEs
 * return value res: object with properties states, rates and equations
 *
 * Description: converts the ode data structure (ode ODE/ODE.js) into designated output format
 * First, we fetch the ode data structure
 * Then we create the map res.states, with keys state id (e.g. 's0') and state name (e.g. 'S')
 * Then we create the set res.rates, with elements being unicode symbols reflecting the rates
 * Finally, we build the equations
 */
function getODEs() {
	const res = {};
	const odeMap = ode.getODEs();
	res.states = buildStateMap(odeMap);
	res.rates = buildRateMap(odeMap);
	res.equations = buildEquationMap(odeMap);
	return res;
}

export default getODEs;
