/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable operator-linebreak */
import { movePointArrayY, removeIntervention } from './init';
import { graph } from './graph';

function buttons() {
	// adding onclick events for buttons
	$('#button').click(() => {
		// Adds intervention
		// Start time
		console.time('addIntervention');
		graph.save(); // Saves values to graph.data
		// Modifying values in graph.data so that intervention is added
		// Adding intervention (name + value)
		graph.data.interventions[
			't' + Object.keys(graph.data.interventions).length 
		] =
			graph.data.interventions[
				't' + (Object.keys(graph.data.interventions).length - 1)
			] + 10;
		// Adding rates for new intervention
		Object.keys(graph.data.rates).forEach((key) => {
			graph.data.rates[key]['t' + Object.keys(graph.data.rates[key]).length] =
				graph.data.rates[key][
					't' + (Object.keys(graph.data.rates[key]).length - 1)
				];
		});
		// load graph.data
		graph.load();

		// End time
		console.timeEnd('addIntervention');
		graph.plotCurves();
	});
	$('#button2').click(() => {
		console.time('removeIntervention');
		removeIntervention();
		console.timeEnd('removeIntervention');
		graph.plotCurves();
	});
	$('#logY').change(function () {
		// change scale of a axis to logarithmic
		// function requires 'this' so that check if button is checked/unchecked can happen
		graph.yLogFunc.call(this);
		// move point to new position
		movePointArrayY();
		// plot in new scale
		graph.plotCurves();
	});
}

function events() {
	buttons();
}

export default events;
