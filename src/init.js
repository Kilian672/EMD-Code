/* eslint-disable prefer-arrow-callback */
/* eslint-disable object-curly-newline */
/* eslint-disable operator-linebreak */
/* eslint-disable max-len */

import { graph, graphInit } from './graph';

graph.pointArray = []; // Array of Points
graph.interventionArray = []; // Array of Interventions
graph.colors = [
	'red',
	'blue',
	'green',
	'purple',
	'orange',
	'gray',
	'pink',
	'yellow',
	'teal',
	'Brown',
	'BlueViolet',
	'CadetBlue',
	'Chartreuse',
	'Chocolate',
	'CornflowerBlue',
	'Coral',
	'Crimson',
	'Cyan',
	'DarkMagenta',
	'DarkGreen',
	'Fuchsia',
	'Indigo',
	'Khaki',
	'Lime',
	'Magenta',
	'Maroon',
	'Navy',
	'Olive',
];

function initalTEnd() {
	// initializing t_\infty
	const line1 = graph.board.create(
		'line',
		[
			[0, 0],
			[1, 0],
		],
		{ visible: false },
	);
	graph.tEnd = graph.board.create('glider', [200, 0, line1], {
		name: '$t_{\\infty}$',
		color: 'black',
	});
	graph.board.setBoundingBox(
		[-graph.tEnd.X() / 10, 1200, 1.1*graph.tEnd.X(), -200],
		false,
	);
	// Adding onclick event
	graph.tEnd.on('up', function (event) {
		const thisTemp = this; // Saving this so it can be accesed in the promise below
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
							// After entering value and
							thisTemp.moveTo([$('#xValue').val(), 0]);
							// remove the prompt
							graph.board.removeObject(graph.input);
							graph.input = null;
							// recompute the graph and set new boundingbox
							graph.plotCurves();
							graph.board.setBoundingBox(
								[-graph.tEnd.X() / 10, bb[1], 1.1 * graph.tEnd.X(), bb[3]],
								false,
							);
						});
					});
			}
			// if no manual input of coordinates, recompute ode and set boundingbox
			graph.plotCurves();
			const bb = graph.board.getBoundingBox();
			graph.board.setBoundingBox(
				[-graph.tEnd.X() / 10, bb[1], 1.1 * graph.tEnd.X(), bb[3]],
				false,
			);
			// return new promise, so that next event can be chained
			return new Promise(function (resolve, reject) {
				setTimeout(() => resolve(1), 100);
			});
		});
	});
}

function removeIntervention() {
	graph.save();
	if (Object.keys(graph.data.interventions).length >= 2) {
		delete graph.data.interventions[
			't' + (Object.keys(graph.data.interventions).length - 1)
		];
		Object.keys(graph.data.rates).forEach((key) => {
			delete graph.data.rates[key][
				't' + Object.keys(graph.data.interventions).length
			];
		});
	}
	graph.load();
}

graph.setLegend = () => {
	// Sets the legend of the plot
	// Legend has custom sliders. To get these sliders to work we create a css file and append it to the head
	let classes = ''; // Contains the css
	let labels = '<br>'; // Contains the html

	// Css of sliders
	classes +=
		' .switch { position: relative; display: inline-block; width: 30px; height: 18px;}';
	/* Hide default HTML checkbox */
	classes += '.switch input {opacity: 0;width: 0;height: 0;}';
	/* The slider */
	//special init for the key 'n', the population curve
		classes +=
			'.slider' +
			'n' +
			' {position: absolute; cursor: pointer;top: 0;left: 0;right: 0;bottom: 0;background-color: #ccc;-webkit-transition: 0.4s;transition: 0.4s;}';
		classes +=
			'.slider' +
			'n' +
			':before {position: absolute;content: ""; height: 13px; width: 13px; left: 2px;bottom: 2px; background-color: white;-webkit-transition: 0.4s;transition: 0.4s;}';
		classes +=
			'input:checked + .slider' +
			'n' +
			' {background-color:';
		classes += 'black';
		classes +=	';}';
		classes +=
			'input:focus + .slider' +
			'n' +
			' {box-shadow: 0 0 1px ' +
			'grey' +
			';}';
		classes +=
			'input:checked + .slider' +
			'n' +
			':before {-webkit-transform: translateX(13px); -ms-transform: translateX(13px); transform: translateX(13px);}';
		/* Rounded sliders */
		classes += '.slider' + 'n' + '.round {border-radius: 17px;}';
		classes += '.slider' + 'n' + '.round:before {border-radius: 50%;}';

		// Html of sliders
		labels += '<label class="switch">';
		labels +=
			'<input type="checkbox" id="check' +
			'n' +
			'" name="check' +
			'n' +
			'" checked>' +
			' ' +
			'n'; //  Name of the Curve
		labels +=
			'<span class="slider' +
			'n' +
			' round"></span></label><span> ' ;
			labels +=  'N';
			labels += '(t)' + //  Name of the Curve
			'  &nbsp&nbsp</span><br>';
	//------------------------------------------------
	Object.keys(graph.curves).forEach((key) => {
		if(key !== 'n'){
		classes +=
			'.slider' +
			key +
			' {position: absolute; cursor: pointer;top: 0;left: 0;right: 0;bottom: 0;background-color: #ccc;-webkit-transition: 0.4s;transition: 0.4s;}';
		classes +=
			'.slider' +
			key +
			':before {position: absolute;content: ""; height: 13px; width: 13px; left: 2px;bottom: 2px; background-color: white;-webkit-transition: 0.4s;transition: 0.4s;}';
		classes +=
			'input:checked + .slider' +
			key +
			' {background-color:';
		classes += key === 'n' ? 'black' : graph.colors[graph.statesMap[key]]  ;
		classes +=	';}';
		classes +=
			'input:focus + .slider' +
			key +
			' {box-shadow: 0 0 1px ' +
			graph.colors[graph.statesMap[key]] +
			';}';
		classes +=
			'input:checked + .slider' +
			key +
			':before {-webkit-transform: translateX(13px); -ms-transform: translateX(13px); transform: translateX(13px);}';
		/* Rounded sliders */
		classes += '.slider' + key + '.round {border-radius: 17px;}';
		classes += '.slider' + key + '.round:before {border-radius: 50%;}';

		// Html of sliders
		labels += '<label class="switch">';
		labels +=
			'<input type="checkbox" id="check' +
			key +
			'" name="check' +
			key +
			'" checked>' +
			' ' +
			key; //  Name of the Curve
		labels +=
			'<span class="slider' +
			key +
			' round"></span></label><span> ' ;
			labels += key === 'n' ? 'N': graph.states[key].name ; //specialcourve with key 'n'
			labels += '(t)' + //  Name of the Curve
			'  &nbsp&nbsp</span><br>';
	}});
	// Creating css style and appending to head
	const style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = classes;
	document.getElementsByTagName('head')[0].appendChild(style);

	// Setting the legend on the right position
	const bb = graph.board.getBoundingBox();
	graph.labels = graph.board.create(
		'text',
		[
			bb[2],
			(bb[1] + bb[3]) *
				(1 / 2 + 0.05 + Object.keys(graph.curves).length * 0.03),
			labels,
		],
		{
			frozen: true,
			fontSize: 18,
			fixed: true,
			visible: true,
			anchorX: 'right',
			anchorY: 'top',
			highlight: false,
		},
	);
};

graph.setLegendFunction = () => {
	// Adds function to Legend Buttons
	Object.keys(graph.curves).forEach((key) => {
		$('#check' + key).on('click', function check() {
			if (this.checked) {
				graph.curves[key].setAttribute({ visible: true });
			} else {
				graph.curves[key].setAttribute({ visible: false });
			}
		});
	});
};

function init() {
	initalTEnd();
	graphInit();
	// Setting the right values so that graph.load() initializes the points, rates and interventions
	graph.data.states = {};
	graph.data.states.s0 = {};
	graph.data.states.s0.name = 'S';
	graph.data.states.s0.value = 1000;
	graph.data.interventions = {};
	graph.data.interventions.t0 = 0;
	graph.data.rates = {};
	graph.load();
}

// On change of y axis to log the points need to be moved to the right positions
function movePointArrayY() {
	Object.keys(graph.states).forEach((key) => {
		graph.states[key].plotPoint.moveTo([
			graph.states[key].plotPoint.X(),
			graph.move(graph.states[key].plotPoint.Y()),
		]);
	});
}

export { init, movePointArrayY, removeIntervention };
