/* eslint-disable max-len */
/* eslint-disable operator-linebreak */
import { graph } from './graph';
import fsm from './fsm/FSM';
/* global JXG */
// import JXG from '../static/jsxgraphsrc';
// depends on fsmCSS.plotExport() und TransitionRatesArray, interventionArray, pointArray, JXG
function ode() {
	// Logging time to compute the ode
	console.time('Ode');
	// Reading values from model
	const odeExport = fsm.getODEs();
	const func = {};
	// number of simulated steps per time step
	graph.delta = 20;

	// Function on the righthand side of the differential equation with closure
	function createfunc(key) { 
		return function create(x, I) {
			const temparr = I.map(() => 0);
			let statecount;
			let population = 0;
			//compute the population
			odeExport.equations.forEach((sumArray, stID) => {
				population += I[graph.statesMap[stID]];
			});
			odeExport.equations.forEach((sumArray, stID) => {
				sumArray.forEach((contribution) => {
					statecount = false;
					// sign of the contribution
					let tempProd = contribution.sign > 0 ? 1 : -1;
					// The array contribution.prod containing the factors
					contribution.prod.forEach((factor) => {
						if (factor[0] === 'r') {
							tempProd *= graph.rates[factor[1]][key].getValue();
						}
						// case 'r': get rate value
						else if(factor[0] === 'n'){ //case 'n': population
							tempProd *= population;
						}
						else {			// case 's': get state value
							if(statecount){ //if statecount is true, we divide by the poppulation
								tempProd *= I[graph.statesMap[factor[1]]];
								tempProd /=population;
							}else{ //see ODE equations for details
								tempProd *= I[graph.statesMap[factor[1]]];
							}
							statecount = true;
					}
					});
					temparr[graph.statesMap[stID]] += tempProd;
				});
			});
			return temparr;
		};
	}

	// Creating Closure
	Object.keys(graph.interventions).forEach((key) => {
		func[key] = createfunc(key);
	});

	// Finding next Intervention or tEnd
	function next(key) {
		if (
			Object.keys(graph.interventions).includes(
				't' + (1 + parseInt(key.substring(1), 10)),
			)
		) {
			return graph.interventions[
				't' + (1 + parseInt(key.substring(1), 10))
			].getValue();
		}
		return graph.tEnd.X();
	}

	// Setting initial  conditions
	let data = [[]];
	odeExport.states.forEach((value, key) => {
		data[0][graph.statesMap[key]] = graph.states[key].getValue();
	});

	// Numerical Simulation 1. Step from t_0 to t_1 to t_2 to ...
	Object.keys(graph.interventions)
		.sort((a, b) => (a.substring(1) < b.substring(1) ? -1 : 1))
		.forEach((key) => {
			data = data.concat(
				JXG.Math.Numerics.rungeKutta(
					'rk4',
					data[data.length - 1],
					[graph.interventions[key].getValue(), next(key)],
					(next(key) - graph.interventions[key].getValue()) * graph.delta + 1,
					// JSX.Math.Numerics.rungeKutta counts the initial value as computed step. To do the right amout one has to do one more
					func[key],
					// Remove first element of computed array to not double the inital value
				).slice(1),
			);
		});
	// Set starting time

	// Setting x values to just computed y values of the curves
	for (let i = 0; i < data.length; i++) {
		let n = 0;
		data[i][data[data.length - 1].length] =
			graph.interventions.t0.getValue() + i / graph.delta;
		for(let j = 0; j< data[i].length-1; j++){
			n += data[i][j];
		}
		data[i].unshift(n); //first slot taken for total population
	}
	// Stop Time
	console.timeEnd('Ode');
	return data;
}

export default ode;
