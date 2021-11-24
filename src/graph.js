/* eslint-disable prefer-arrow-callback */
/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-newline */
/* global JXG */
import fsm from './fsm/FSM';
// Object that contains all global variables
const graph = {};
graph.curves = {}; // contains the (plot)-curves of the graph
graph.data = {}; // container for storing data
graph.states = {}; // contains all states
graph.rates = {}; // contains transmittion rates
graph.statesMap = {}; // maps keys fo states to indices, as ode-method only works with arrays not objects
graph.interventions = {}; // contains interventions

function graphInit() {
	// Auxilliary functions to switch from logarithmic to linear scale, will be used later
	function cutOffLog(x) {
		if(x<= graph.eps) return Math.log10(graph.eps); 
		if(x === 1) return Math.log10(1+ graph.eps);
		else{return Math.log10(x);}
	}
	function inverseCutOffLog(x) {
		if (x <=Math.log10(graph.eps)) return 0;
		return 10 ** x;
	}
	// Save Functions
	// Save will store all data in graph.data
	graph.saveStates = () => {
		// For eachs state, we need to save "key", "name" and "value"
		graph.data.states = {};
		// writing IDs and values to graph.data.states
		Object.keys(graph.states).forEach((key) => {
			graph.data.states[key] = {};
			graph.data.states[key].value = graph.states[key].getValue();
			graph.data.states[key].name = graph.states[key].name;
		});
	};
	// ----------------------------------------------------------------------------
	graph.saveInterventions = () => {
		// For each intervention, we need to save "key" and "value"
		// save interventions to graph.data.interventions
		graph.data.interventions = {};
		Object.keys(graph.interventions).forEach((key) => {
			graph.data.interventions[key] = graph.interventions[key].getValue();
		});
	};
	// ----------------------------------------------------------------------------
	graph.saveRates = () => {
		// For each transmittion rate, we need to save "key" and for each intervetion "value"
		// save rates to grah.data.rates, object of objects of numbers
		graph.data.rates = {};
		// Rates have to be saved for each intervention
		Object.keys(graph.rates).forEach((key) => {
			graph.data.rates[key] = {};
			Object.keys(graph.interventions).forEach((intervention) => {
				graph.data.rates[key][intervention] = graph.rates[key][
					intervention
				].getValue();
			});
		});
	};
	// ----------------------------------------------------------------------------
	graph.save = () => {
		// Save points, rates and interventions
		graph.saveStates();
		graph.saveRates();
		graph.saveInterventions();
	};
	// ----------------------------------------------------------------------------
	// Load functions
	// Load will restore data from graph.data to graph.states, graph.rates and graph.interventions
	graph.loadStates = () => {
		// loadStates requires loadInterventions()

		// loadStates writes from graph.data.states to graph.states and graph.statesMap
		// Remove previous points, curves and labels
		graph.statesMap = {};
		// pause board.update() for better performance
		graph.board.suspendUpdate();
		// Remove Objects from JSXGraph
		Object.values(graph.states).forEach((value) => {
			graph.board.removeObject(value.plotPoint);
			JXG.JSXGraph.freeBoard(value.board);
		});
		Object.values(graph.curves).forEach((value) => {
			graph.board.removeObject(value);
		});
		graph.board.removeObject(graph.labels);
		// resume board.update()
		graph.board.unsuspendUpdate();
		// all object in graph.state have been removed, graph.states can be reset
		graph.states = {};

		// Each graph.states contains
		// - initial values of states as points on the y-axis on graph.board
		// - a board to adjust initial values of state

		// First, create map between states and indices of array
		for (let i = 0; i < Object.keys(graph.data.states).length; i++)
			graph.statesMap[Object.keys(graph.data.states)[i]] = i;

		// Create line on y-axis that contains initial values
		const line2 = graph.board.create(
			'line',
			[() => -1 * graph.interventions.t0.getValue(), () => 1, () => 0],
			{ visible: false },
		);

		// Reset legend on left side
		// Remove old legend first
		$('#statesID').empty();
		$('#statesID').append('<table>');
		// Create new legend
		// Set legend tab as visible so that objects can be added
		document.getElementById('statesID').style.display = 'block';

		// For each state add legend to change initial value
		// that legend is made up of two divs, stateText and stateBoard
		// stateText contains text input field to set initial value of state directly
		// stateBoard contains JSXGraph object to set inital value graphically

		// forEach automatically creates a closure, in contrast to for loops
		// which need a manual closure
		Object.keys(graph.data.states).forEach((key) => {
			let x = 0;
			graph.states[key] = {};
			graph.states[key].name = graph.data.states[key].name;
			$('#statesID').append(
				'<tr><td><div class="stateName" >' +
					graph.states[key].name +
					'(0) = ' +
					'</div></td><td><div contenteditable="true" class="stateText"  id= "text' +
					key +
					'">' +
					// set inital value of state, for all values >1 set 1
					// for all values <1 and >0.0001 display with 4 digit precision
					// all smaller values display exponentially with 3 digit precision
					/*(graph.data.states[key].value >= 1
						? parseInt(1)
						: graph.data.states[key].value > 0.0001
						? graph.data.states[key].value.toFixed(4)
						: graph.data.states[key].value === 0
						? 0
						: graph.data.states[key].value.toExponential(3)) +*/
					(graph.data.states[key].value < graph.eps	
						? x.toExponential(3)									
						: graph.data.states[key].value.toExponential(3)) +
					'</div></td>' +
					'<td><div class="stateBoard" tabindex="1" id= "board' +
					key +
					'"></div></td></tr>',
			);

			// add JSXGraph board to stateBoard
			// configure board such that only scrolling with the mouse whell moves the axis
			graph.states[key].board = JXG.JSXGraph.initBoard('board' + key, {
				axis: false,
				maxboundingbox: [-Infinity, Infinity, Infinity, -Infinity],
				showCopyright: false,
				showNavigation: false,
				showInfobox: false,
				highlight: false,
				highlightInfobox: false,
				pan: { enabled: true, needshift: false },
				zoom: {
					factorX: 1.05,
					factorY: 1,
					wheel: true,
					needshift: false,
					eps: 0.01,
				},
			});

			// Creating Point on side board that displays initial values of state
			graph.states[key].point = graph.states[key].board.create(
				'point',
				[cutOffLog(graph.data.states[key].value), 0],
				{
					name: graph.data.states[key].name,
					visible: true,
					highlight: false,
					highlightInfobox: false,
					label: { offset: [0, -25] },
					color: graph.colors[graph.statesMap[key]],
					fixed: true,
					showInfobox: false,
				},
			);
			// Setting appropriate boundingbox to center point on board
			graph.states[key].board.setBoundingBox([
				cutOffLog(graph.data.states[key].value) - 2,
				0.1,
				cutOffLog(graph.data.states[key].value) + 2,
				-0.1,
			]);
			// Setting frozen=true is important, so that scrolling only moves the axis not the point
			graph.states[key].point.setAttribute({ frozen: true });

			// Creating getValue() for easy access to states value
			graph.states[key].getValue = function get() {
				return inverseCutOffLog(this.point.X());
			};

			// Create custom axis
			const Axis = graph.states[key].board.create('axis', [
				[0, 0],
				[1, 0],
			]);
			Axis.removeAllTicks();
			// Create custom ticks with loarithmic scale
			graph.states[key].board.create('ticks', [Axis, 1], {
				drawLabels: true, // Needed, and only works for equidistant ticks
				minorTicks: 0, // The NUMBER of small ticks between each Major tick
				drawZero: true,
				// implement cutoffs at 0 -> 1 and 12 -> 0
				generateLabelText: (tick, zero) => {
					if (tick.usrCoords[1] - zero.usrCoords[1] <= -12) return 0;
					return (
						'$10^{' +
						1 * Math.floor(tick.usrCoords[1] - zero.usrCoords[1]) +
						'}$'
					);
				},
			});

			// Create points on graph.board, displaying inital values
			graph.states[key].plotPoint = graph.board.create(
				'glider',
				[0, inverseCutOffLog(graph.states[key].point.X()), line2],
				{
					color: graph.colors[graph.statesMap[key]],
					name: '' + graph.data.states[key].name + '(0)',
					label: { autoPosition: true, visible: false },
					showInfobox: false,
					highlight: false,
					fixed: true,
				},
			);

			// Add function to scroll
			// scrolling changes the boundingbox, but as the point is frozen the value
			// of the point is changed, as intended
			// change in the value of the point is then transferred to text input
			graph.states[key].board.on('boundingbox', () => {
				const bb = graph.states[key].board.getBoundingBox();
				graph.states[key].board.setBoundingBox([bb[2] - 4, 0.1, bb[2], -0.1]);
				// Setting the new value to text Input
				/*if (graph.states[key].getValue() >= 1) {
					document.getElementById('text' + key).innerHTML = 1;
				} else if (graph.states[key].getValue() >= 0.0001) {
					document.getElementById('text' + key).innerHTML = graph.states[key]
						.getValue()
						.toFixed(4);
				} else if (graph.states[key].getValue() === 0) {
					document.getElementById('text' + key).innerHTML = 0;
				} else {
					document.getElementById('text' + key).innerHTML = graph.states[key]
						.getValue()
						.toExponential(3);
				}*/
				let x=0;
				if (graph.states[key].getValue() <= graph.eps) {
					document.getElementById('text' + key).innerHTML = x.toExponential(3);
				} else {
					document.getElementById('text' + key).innerHTML = graph.states[key]
						.getValue()
						.toExponential(3);
				}
				// Adjusting the point on graph.board to new value
				graph.states[key].plotPoint.setPositionDirectly(JXG.COORDS_BY_USER, [
					0,
					graph.yPost(inverseCutOffLog(graph.states[key].point.X())),
				]);
				// Plot curves with new inital values
				graph.plotCurves();
			});

			// Add function to text input
			// Text input is applied when input loses focus
			$(document).focusout('#text' + key, () => {
				// Making sure that only the right focusout-events are considered
				// chrome triggers focusout when diplay is changed to none
				if ($('#statesID').css('display') === 'block') {
					// set value of point on graph.board
					graph.states[key].plotPoint.setPositionDirectly(JXG.COORDS_BY_USER, [
						0,
						graph.yPost(parseFloat($('#text' + key).text())),
					]);
					// adjusting grahical input
					graph.states[key].board.setBoundingBox([
						cutOffLog(parseFloat($('#text' + key).text())) - 2,
						0.1,
						cutOffLog(parseFloat($('#text' + key).text())) + 2,
						-0.1,
					]);
				}
			});
		});

		// Closing </table> in above html
		$('#statesID').append('</table>');
		// Setting diplay to none for operations on transmittion rates
		document.getElementById('statesID').style.display = 'none';

		// Create a curve for each inital value
		// Remove old curves first
		graph.curves = {};
		Object.keys(graph.data.states).forEach((key) => {
			graph.curves[key] = graph.board.create('curve', [0, 0], {
				strokeColor: graph.colors[graph.statesMap[key]],
				name: '' + graph.data.states[key].name + '(t)',
				highlight: false,
			});
			//population curve
			graph.curves['n'] = graph.board.create('curve', [0, 0], {
				strokeColor: 'black',
				name: 'N(t)',
				highlight: false,
			});
		});

		// Set the legend of graph.board
		graph.setLegend();
		graph.setLegendFunction();
	};

	// ----------------------------------------------------------------------------
	graph.loadInterventions = () => {
		// Reset graph.interventionArray
		// pause update() for better performance
		graph.board.suspendUpdate();
		// remove old interventions
		Object.values(graph.interventions).forEach((intervention) => {
			// Intervention line is defined by point1 and point 2
			// these points are not automatically removed if line is removed
			// thus they have to be removed manually
			graph.board.removeObject(intervention.line.point1);
			graph.board.removeObject(intervention.line.point2);
			graph.board.removeObject(intervention.line);
			graph.board.removeObject(intervention.point);
		});
		// resume update()
		graph.board.unsuspendUpdate();
		graph.board.update();
		// objects remove, contain can be reset
		graph.interventions = {};
		// create line that will contain all intervention points
		const line1 = graph.board.create(
			'line',
			[
				[0, 0],
				[1, 0],
			],
			{ visible: false },
		);
		// empty tab that contains interventions
		$('#tabtab3ID').empty();

		// Create Intevention for each element in graph.data.interventions
		// forEach guarantees closure
		Object.keys(graph.data.interventions).forEach((key) => {
			// Reset previous intervention
			graph.interventions[key] = {};

			// Add intervention point to graph.board
			graph.interventions[key].point = graph.board.create(
				'glider',
				[graph.data.interventions[key], 0, line1],
				{
					color: 'black',
					visible: true,
					name: '$t_{' + key.substring(1) + '}$',
				},
			);

			// Add line through point
			graph.interventions[key].line = graph.board.create(
				'line',
				[
					[() => graph.interventions[key].point.X(), 0],
					[() => graph.interventions[key].point.X(), 1],
				],
				{
					color: 'lightGrey',
					visible: true,
				},
			);

			// Add onclick event to point
			// Point can be dragged, which will change value
			// click + shift opens dialogue to directly enter new value
			graph.interventions[key].point.on('up', function drag(event) {
				const thisTemp = this; // Saving 'this' so it can be accesed in the promise below
				graph.promise = graph.promise.then(() => {
					// Chaining event to promise, so that only one event can fire at a time
					if (event.shiftKey && graph.input == null) {
						// Shift key means entering coordinates direktly. graph.input checks if other direct input is active
						const bb = graph.board.getBoundingBox();
						// diplaying input box, chaining to MathJax compiler promise
						graph
							.typeset(() => {
								graph.input = graph.board.create(
									'text',
									[
										(bb[2] + bb[0]) / 2.5,
										(bb[1] + bb[3]) / 2,
										'<div id="inputID"><p>Enter Value of $t_\\\\infty$</p><br>' +
											'<input type="float" id="xValue" required value=' +
											thisTemp.X() +
											'><br><br>' +
											'<button class="button" id="Accept">Accept</button></div>',
									],
									{ fixed: true, highlight: false },
								);
							})
							// chaining the event listener
							.then(() => {
								$('#Accept').click(() => {
									// After entering value
									thisTemp.moveTo([$('#xValue').val(), 0]);
									// remove the prompt
									graph.board.removeObject(graph.input);
									graph.input = null;
									// recompute the graph and set new boundingbox
									graph.plotCurves();
								});
							});
					}

					// if no manual input of coordinates, recompute ode and set boundingbox
					graph.plotCurves();
					// return new promise, so that next event can be chained
					return new Promise(function (resolve, reject) {
						setTimeout(() => resolve(1), 100);
					});
				});
			});

			// Add Funktion for easy acces to intervention point
			graph.interventions[key].getValue = function getValue() {
				return this.point.X();
			};
			$('#tabtab3ID').append(
				'<button id = "button' +
					key +
					'">t<sub>' +
					key.substring(1) +
					'</sub></button>',
			);

			// Add functionality to button to toggle between rates/intervention
			$('#button' + key).click(() => {
				// Save active intervention for later use
				graph.activeIntervention = key;
				// toggle all buttons as inactive
				$('#tabtab3ID').children().removeClass('active');
				// toggle clicked button as active
				$('#button' + key).addClass('active');
				// Set all rate-points as invisible ans unfrozen
				// frozen = false is necessary so that changing the boundingbox
				// does not change these points
				Object.keys(graph.rates).forEach((rate) => {
					Object.keys(graph.interventions).forEach((intervention) => {
						graph.rates[rate][intervention].point.setAttribute({
							visible: false,
							frozen: false,
						});
					});
					// Move boundingbox to center around point that corresponds to active intervention
					graph.rates[rate].board.setBoundingBox([
						cutOffLog(graph.rates[rate][key].getValue()) - 2,
						0.1,
						cutOffLog(graph.rates[rate][key].getValue()) + 2,
						-0.1,
					]);
					// Set rates corresponding to active intervention as visible and frozen
					graph.rates[rate][key].point.setAttribute({
						visible: true,
						frozen: true,
					});
				});
			});
		});
		// At the start inital intervention is set as active
		graph.interventions.t0.line.setAttribute({ visible: false });
		$('#buttont0').addClass('active');
		graph.activeIntervention = 't0';
	};
	// ----------------------------------------------------------------------------
	graph.loadRates = () => {
		// loadRates requires loadInterventions()

		// Old rates have already been removed by loadInterventions
		// graph.rates can be reset
		graph.rates = {};

		// Remove Legend on left side
		$('#ratesID').empty();
		// Set initials on Legend Tab (left side)
		$('#ratesID').append('<table>');
		// To add objects, html element has to be visible
		document.getElementById('ratesID').style.display = 'block';
		// Create Legend on left side
		// for each rate two divs, rateText and rateBoard
		// rateText contains text input
		// stateText contains visual input
		// forEach guarantees closure
		Object.keys(graph.data.rates).forEach((key) => {
			graph.rates[key] = {};
			$('#ratesID').append(
				'<tr><td><div class="rateName" >' +
					key +
					'= ' +
					'</div></td><td><div contenteditable="true" class="rateText"  id= "text' +
					key +
					'">' +
					graph.data.rates[key].t0 +
					'</div></td>' +
					'<td><div class="rateBoard"  id= "board' +
					key +
					'"></div></td></tr>',
			);
			// Add JSXGraph board to rateBoard
			graph.rates[key].board = JXG.JSXGraph.initBoard('board' + key, {
				axis: false,
				maxboundingbox: [-Infinity, Infinity, Infinity, -Infinity],
				boundingbox: [-0.6, 0.1, 1, -0.1],
				showCopyright: false,
				showNavigation: false,
				showInfobox: false,
				highlight: false,
				pan: { enabled: true, needshift: false },
				zoom: {
					factorX: 1.05,
					factorY: 1,
					wheel: true,
					needshift: false,
					eps: 0.01,
				},
			});
			// Create custom axis
			const Axis = graph.rates[key].board.create('axis', [
				[0, 0],
				[1, 0],
			]);
			Axis.removeAllTicks();
			// Create custom ticks with log scale
			graph.rates[key].board.create('ticks', [Axis, 1], {
				drawLabels: true, // Needed, and only works for equidistant ticks
				minorTicks: 0, // The NUMBER of small ticks between each Major tick
				drawZero: true,
				generateLabelText: (tick, zero) => {
					if (tick.usrCoords[1] - zero.usrCoords[1] <= -12) return 0;
					return (
						'$10^{' +
						1 * Math.floor(tick.usrCoords[1] - zero.usrCoords[1]) +
						'}$'
					);
				},
			});

			// Adding intervention depending properties
			// e.g. value of rates differ with each intervention
			// forEach guarantees closure
			Object.keys(graph.data.rates[key]).forEach((intervention) => {
				// create emtpy object to be filled
				graph.rates[key][intervention] = {};

				// Creating Point for each intervention
				graph.rates[key][intervention].point = graph.rates[key].board.create(
					'point',
					[cutOffLog(graph.data.rates[key][intervention]), 0],
					{
						name: key,
						visible: false,
						label: { offset: [0, -25] },
						color: 'black',
						fixed: true,
						showInfobox: false,
						highlight: false,
					},
				);
				// Creating getValue() for easy access to states value
				graph.rates[key][intervention].getValue = function get() {
					return inverseCutOffLog(this.point.X());
				};

				// Add function to zoom
				graph.rates[key].board.on('boundingbox', () => {
					const bb = graph.rates[key].board.getBoundingBox();
					graph.rates[key].board.setBoundingBox([bb[2] - 4, 0.1, bb[2], -0.1]);
					let x=0;
					// write new value to text input
					if (graph.rates[key][graph.activeIntervention].getValue() <= graph.eps) {
						document.getElementById('text' + key).innerHTML = x.toExponential(3);
					} else {
						document.getElementById('text' + key).innerHTML = graph.rates[key][
							graph.activeIntervention
						]
							.getValue()
							.toExponential(3);
					}
					// update plot
					graph.plotCurves();
				});
				// Add function to text input
				$(document).focusout('#text' + key, () => {
					// Excluding focusout event when display = none
					if ($('#ratesID').css('display') === 'block') {
						// set boundingbox will trigger graph.plotCurves()
						graph.rates[key].board.setBoundingBox([
							cutOffLog(parseFloat($('#text' + key).text())) - 2,
							0.1,
							cutOffLog(parseFloat($('#text' + key).text())) + 2,
							-0.1,
						]);
					}
				});
			});
		});
		// Finish table environment in html code
		$('#ratesID').append('</table>');

		// At first active intervention is t0
		// Setting appropriate boundingbox for t0
		Object.keys(graph.data.rates).forEach((key) => {
			graph.rates[key].board.setBoundingBox([
				cutOffLog(graph.data.rates[key].t0) - 2,
				0.1,
				cutOffLog(graph.data.rates[key].t0) + 2,
				-0.1,
			]);
			// Show point corresponding to t0
			// frozen= true guarantees that chang of boundingbox also changes value of point
			graph.rates[key].t0.point.setAttribute({ visible: true, frozen: true });
		});
	};
}

// Combine previous function to one load() function
// ----------------------------------------------------------------------------
graph.load = () => {
	// To load the modules, the respective tabs have to be visible
	$('#ratesID').show();
	$('#tab3ID').show();
	$('#statesID').hide();
	graph.loadInterventions();
	$('#ratesID').hide();
	$('#tab3ID').hide();
	$('#statesID').show();
	graph.loadStates();
	$('#ratesID').show();
	$('#tab3ID').show();
	$('#statesID').hide();
	graph.loadRates();
	// Reset to standard view
	$('#ratesID').hide();
	$('#tab3ID').hide();
	$('#statesID').show();
	$('#Values').addClass('active');
	$('#Rates').removeClass('active');
};

// ----------------------------------------------------------------------------
// Built Add and Remove function from save and load

graph.update = () => {
	// Update works by saving all data, then checking if the model has been altered and modifing graph.data
	// accordingly, afterward load modified graph.data

	// Save to graph.data
	graph.save();
	// Load new model with fsm.getODEs
	const odeExport = fsm.getODEs();
	// Compare graph.states to odeExport to determine wheter states have benn added, altered or removed
	odeExport.states.forEach((value, key) => {
		// check if new state has been added
		if (!Object.keys(graph.data.states).includes(key)) {
			graph.data.states[key] = {};
			graph.data.states[key].name = value;
			graph.data.states[key].value = 0;
			// check if state has been altered
		} else if (graph.data.states[key].name !== value) {
			graph.data.states[key].name = value;
		}
	});
	// check if state has benn removed
	Object.keys(graph.data.states).forEach((key) => {
		if (!odeExport.states.has(key)) delete graph.data.states[key];
	});
	// Check wheter rates haven been added or removed
	odeExport.rates.forEach((key) => {
		// check if rate has benn added
		if (!Object.keys(graph.data.rates).includes(key)) {
			graph.data.rates[key] = {};
			Object.keys(graph.data.interventions).forEach((intervention) => {
				graph.data.rates[key][intervention] = 0.1;
			});
		}
	});
	// check if rates have been removed
	Object.keys(graph.data.rates).forEach((key) => {
		if (!odeExport.rates.has(key)) delete graph.data.rates[key];
	});
	// Load modified graph.states
	graph.load();
	// Plot new curves
	graph.plotCurves();
};

// ---------------------------------------------------------------------------
function initailAxes() {
	// Creating custom axes
	// these points will define the position of the axis
	const xAxPt0 = graph.board.create('point', [0, 0], {
		needsRegularUpdate: false,
		visible: false,
	});
	const xAxPt1 = graph.board.create('point', [1, 0], {
		needsRegularUpdate: false,
		visible: false,
	});
	// Axis
	const xaxis = graph.board.create('axis', [xAxPt0, xAxPt1], {
		needsRegularUpdate: false,
		name: '$t$',
		withLabel: true,
		label: {
			position: 'rt',
			offset: [-5, 8],
		},
	});
	xaxis.removeAllTicks();
	// Custom ticks
	const xAxTicks = graph.board.create('ticks', [xaxis, 1], {
		offset: [-10, -10],
		precision: 5, // (in pixels)}
		minorTicks: 0,
		drawLabels: true,
		grid: true,
		majorHeight: -1,
		strokeColor: '#ccc',
	});
	let xTicks;
	let yTicks;
	let bb;
	xAxTicks.ticksFunction = () => xTicks;
	graph.board.fullUpdate(); // full update is required
	let coords = [];
	const xPt0 = (offset) => {
		coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [0, offset], graph.board);
		return coords.usrCoords;
	};
	const xPt1 = (offset) => {
		coords = new JXG.Coords(
			JXG.COORDS_BY_SCREEN,
			[graph.board.canvasWidth, offset],
			graph.board,
		);
		return coords.usrCoords;
	};
	// Points for second axis
	const yAxPt0 = graph.board.create('point', [0, 0], {
		needsRegularUpdate: false,
		visible: false,
	});
	const yAxPt1 = graph.board.create('point', [0, 1], {
		needsRegularUpdate: false,
		visible: false,
	});
	// Second axis
	const yaxis = graph.board.create('axis', [yAxPt0, yAxPt1], {
		needsRegularUpdate: false,
		withLabel: true,
		label: {
			position: 'rt',
			offset: [-5, 8],
		},
	});
	yaxis.removeAllTicks();
	const yAxTicks = graph.board.create('ticks', [yaxis, 1], {
		strokeColor: '#ccc',
		label: { offset: [10, 0] },
		precision: 8,
		minorTicks: 0,
		drawLabels: true,
		drawZero: false,
		majorHeight: -1,
	});
	yAxTicks.ticksFunction = () => yTicks;
	graph.board.fullUpdate();
	const yPt0 = (offset) => {
		coords = new JXG.Coords(
			JXG.COORDS_BY_SCREEN, [offset, graph.board.canvasHeight], graph.board,
		);
		return coords.usrCoords;
	};
	const yPt1 = (offset) => {
		coords = new JXG.Coords(JXG.COORDS_BY_SCREEN, [offset, 0], graph.board);
		return coords.usrCoords;
	};
	// Setting ticks according to boudningbox. When zooming in number of ticks should increase
	const setTicks = function () {
		bb = graph.board.getBoundingBox();
		const xTicksVal = 10 ** Math.floor(Math.log10(0.6 * (bb[2] - bb[0])));
		if ((bb[2] - bb[0]) / xTicksVal > 5) {
			xTicks = xTicksVal;
		} else {
			xTicks = 0.5 * xTicksVal;
		}
		const yTicksVal = 10 ** Math.floor(Math.log10(0.6 * (bb[1] - bb[3])));
		if ((bb[1] - bb[3]) / yTicksVal > 5) {
			yTicks = yTicksVal;
		} else {
			yTicks = 0.5 * yTicksVal;
		}
		graph.board.fullUpdate(); // full update is required
	};
	setTicks();

	const origPt = graph.board.create('point', [0, 0], { visible: false });
	graph.upperAxis = 30;
	graph.lowerAxis = graph.board.canvasHeight - 30;
	/*graph.board.on('boundingbox', () => {
		console.time('Axis');
		bb = graph.board.getBoundingBox();
		const mycoordsY = new JXG.Coords(
			JXG.COORDS_BY_USER,
			[0, origPt.Y()],
			graph.board,
		);
		const yPixels = mycoordsY.scrCoords[2];

		const mycoordsX = new JXG.Coords(
			JXG.COORDS_BY_USER,
			[0, origPt.X()],
			graph.board,
		);
		const xPixels = mycoordsX.scrCoords[1];
		if (yPixels <= 10) {
			xaxis.point1.setAttribute({ frozen: true });
			xaxis.point2.setAttribute({ frozen: true });
			xAxTicks.visProp.label.offset = [-10, -10];
		} else if (yPixels > graph.board.canvasHeight - 10) {
			xAxPt0.moveTo(xPt0(graph.board.canvasHeight - 10), 0);
			xAxPt1.moveTo(xPt1(graph.board.canvasHeight - 10), 0);
			xaxis.point1.setAttribute({ frozen: true });
			xaxis.point2.setAttribute({ frozen: true });
			xAxTicks.visProp.label.offset = [-10, 9];
		} else {
			xaxis.point1.setAttribute({ frozen: false });
			xaxis.point2.setAttribute({ frozen: false });
			xAxPt0.moveTo([0, graph.yPost(0)], 0);
			xAxPt1.moveTo([1, graph.yPost(0)], 0);
			xAxPt0.moveTo([0, 0], 0);
			xAxPt1.moveTo([1, 0], 0);
			xAxTicks.visProp.label.offset = [-10, -10];
		}
		if (xPixels < 10) {
			yAxPt0.moveTo(yPt0(10), 0);
			yAxPt1.moveTo(yPt1(10), 0);
			yaxis.point1.setAttribute({ frozen: true });
			yaxis.point2.setAttribute({ frozen: true });
			yAxTicks.visProp.label.offset = [7, 0];
		} else if (xPixels > graph.board.canvasWidth - 10) {
			yaxis.point1.setAttribute({ frozen: true });
			yaxis.point2.setAttribute({ frozen: true });
			yAxTicks.visProp.label.offset = [-28, 0];
			yAxTicks.visProp.label.align = 'right';
		} else {
			yaxis.point1.setAttribute({ frozen: false });
			yaxis.point2.setAttribute({ frozen: false });
			yAxPt0.moveTo([0, 0], 0);
			yAxPt1.moveTo([0, 1], 0);
		}
		setTicks();
		console.timeEnd('Axis');
	});*/
	graph.boardRestriction = true;
	graph.yLogFunc = function yLogFunc() {
		console.time('yLog');
		if (this.checked) {
			graph.board.setBoundingBox(
				[
					-graph.tEnd.X() / 10,
					10,
					1.1 * graph.tEnd.X(),
					-Math.log10(1 / graph.eps) - 1,
				],
				false,
			);
			//window.MathJax.Hub.processSectionDelay = 0;
			//yaxis.defaultTicks.useMathJax = true;
			yAxTicks.generateLabelText = (tick, zero) => {
				if (
					tick.usrCoords[2] - zero.usrCoords[2] <
					-Math.log10(1 / graph.eps)
				) {
					return '';
				}
				if (
					tick.usrCoords[2] - zero.usrCoords[2] <
					-Math.log10(1 / graph.eps) + 1
				) {
					return '0';
				}

				return (
					'$10^{' + Math.floor(tick.usrCoords[2] - zero.usrCoords[2]) + '}$'
				); //(10 ** (tick.usrCoords[2] - zero.usrCoords[2])).toExponential(0);
			};
			//graph.board.update();
			graph.yPre = (x) => {
				if (x > Math.log10(graph.eps)) return 10 ** x;
				return 0;
			};
			graph.yPost = (x) => {
				if (Math.abs(x) > graph.eps) return Math.log10(Math.abs(x));
				return Math.log10(graph.eps);
			};
			graph.move = (x) => {
				if (x > graph.eps) return Math.log10(x);
				return Math.log10(graph.eps);
			};
			graph.boardRestriction = false;
			graph.board.highlightInfobox = function (x, y, el) {
				if (y <= -Math.log10(1 / graph.eps)) {
					graph.board.infobox.setText(' (' + x + ',0)');
				} else {
					graph.board.infobox.setText(
						' (' +
							x +
							' , $' +
							(((() => 10 ** y * 10 ** Math.ceil(-y - 1))() % 1) * 10).toFixed(
								2,
							) +
							'\\cdot 10^{' +
							Math.ceil(-y) +
							'}$)', //(10 ** y).toExponential(2) + ')',
					);
				}
			};
		} else {
			graph.board.setBoundingBox(
				[-graph.tEnd.X() / 10, 1200, 1.1* graph.tEnd.X(), -200], 
				false,
			);
			yAxTicks.generateLabelText = function (tick, zero) {
				return (tick.usrCoords[2] - zero.usrCoords[2]); 
			};
			graph.yPost = (x) => x;
			graph.yPre = (x) => x;
			graph.move = (x) => {
				if (x > Math.log10(graph.eps)) return 10 ** x;
				return 0;
			};
			graph.boardRestriction = true;
			graph.board.highlightInfobox = function (x, y, el) {
				graph.board.infobox.setText('(' + x + ', ' + y + ')');
			};
		}
		(() => {
			graph.board.fullUpdate();
		})();
		setTicks();
		console.timeEnd('yLog');
	};

	// Initializing LaTeX Compiler MathJax 3
	window.MathJax = {
		tex: {
			inlineMath: [
				['$', '$'],
				['\\(', '\\)'],
			],
		},
		jax: ['input/TeX', 'output/HTML-CSS'],

		svg: {
			fontCache: 'global',
		},
		startup: {
			promise: new Promise(function (resolve, reject) {
				setTimeout(() => resolve(1), 100);
			}),
		},
	};

	// Including mathJax js source
	(() => {
		const script = document.createElement('script');
		script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
		script.async = true;
		document.head.appendChild(script);
	})();

	// Setting up global promise at which all events will be chained
	graph.promise = new Promise((resolve, reject) => {
		//	console.log('startup Promise');
		setTimeout(() => resolve(1), 100);
	});
	// Function that chain all mathJax text to promise to be compiled one after the other
	graph.typeset = function typeset(code) {
		window.MathJax.startup.promise = window.MathJax.startup.promise
			.then(() => {
				code();
				return window.MathJax.typesetPromise();
			})
			.catch((err) => console.log('Typeset failed: ' + err.message));
		return window.MathJax.startup.promise;
	};
	// Global presicion of computation
	graph.eps = 10 ** -12;

	// Initializing functions used to switch to and from logaritmic scale
	graph.yPre = (x) => x;
	graph.yPost = (x) => x;
	graph.move = (x) => {
		if (x > Math.log10(graph.eps)) return 10 ** x;
		return 0;
	};

	// Set help messages
	$('#plotID').mouseenter(() => {
		graph.helpID = $('#helpID').html();
		$('#helpID').html(
			'Scroll to zoom in and out. Hold <b>SHIFT</b> to pan.<br>' +
				'To change interventions either drag them or hold <b>SHIFT</b> and click to enter coordinates directly. <br>' +
				'Press <b>+</b> button to add an intervention and press <b>&#8211</b> button to remove last intervention.' +
				'Switch <b>Log</b> checkbox to switch y-axis to logarithmic scale.<br>' +
				'Press any checkbox in the <b>legend</b> to hide corresponding function graph.<br>',
		);
	});
	$('#plotID').mouseleave(() => {
		$('#helpID').html(graph.helpID);
	});
	$('#ratesID').mouseenter(() => {
		graph.helpID = $('#helpID').html();
		$('#helpID').html(
			'Values can be adjusted by either directly changing the numerical value or by scrolling/ dragging the graph .<br>' +
				'Click on intervention tab to view corresponding rates .<br>',
		);
	});
	$('#ratesID').mouseleave(() => {
		$('#helpID').html(graph.helpID);
	});
	$('#statesID').mouseenter(() => {
		graph.helpID = $('#helpID').html();
		$('#helpID').html(
			'Values can be adjusted by either directly changing the numerical value or by scrolling/ dragging the graph .<br>',
		);
	});
	$('#statesID').mouseleave(() => {
		$('#helpID').html(graph.helpID);
	});

	// Adding Buttoms for Log and
	$('#GraphButtons').html(
		'<span float="right" class="slider-checkbox"><input type="checkbox" id="logY" /><label class="label" for="logY"></label><button class="button" id="button">+</button>&nbsp<button class="button" id="button2">&#8211</button>',
	);
}
// ----------------------------------------------------------------------------
// Initializing the JSX Graph Board
function initalBoard() {
	const graphOptions = {
		board: {
			showNavigation: false,
			showCopyright: false,
			useMathJax: true,
		},
	};
	JXG.Options = JXG.merge(JXG.Options, graphOptions);
	JXG.Options.text.useMathJax = true;

	// Create board on which to plot
	graph.board = JXG.JSXGraph.initBoard('plotID', {
		boundingbox: [-20, 1200, 220, -200],  
		axis: false,
		keepaspectratio: false,
		showCopyright: false,
		showNavigation: false,
		zoom: {
			factorX: 1.25,
			factorY: 1.25,
			wheel: true,
			needshift: false,
			eps: 0.1,
		},
	});
	// Initalizing axes
	initailAxes();
}

export { graph, initalBoard, graphInit };
