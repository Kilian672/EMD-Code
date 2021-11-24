import { initalBoard, graph } from './graph';
import { init as initi } from './init';
import events from './events';
import plotCurves from './plot';
import fsm from './fsm/FSM'; // Entry point for everything related to the tab "The Model"

function initial() {
	// initializing all components
	initalBoard();
	plotCurves();
	initi();
	events();
	graph.plotCurves();
}

function initClickFunction() {
	$('#Designer').click(() => {
		$('#fsmID').show();
		$('#odeID').show();
		$('#inID').show();
		$('#plotID').hide();
		$('#tab2ID').hide();
		$('#statesID').hide();
		$('#ratesID').hide();
		$('#tab3ID').hide();
		$('#GraphButtons').hide();
		$('#Simulator').removeClass('active');
		$('#Designer').addClass('active');
	});
	$('#Simulator').click(() => {
		$('#fsmID').hide();
		$('#odeID').hide();
		$('#inID').hide();
		$('#plotID').show();
		$('#tab2ID').show();
		$('#GraphButtons').show();
		$('#Simulator').addClass('active');
		$('#Designer').removeClass('active');
		Object.values(graph.rates).forEach((value) => {
			value.board.update();
		});
		// update rate Board
	});
	$('#Rates').click(() => {
		$('#ratesID').show();
		$('#tab3ID').show();
		$('#statesID').hide();
		$('#Rates').addClass('active');
		$('#Values').removeClass('active');
		Object.values(graph.rates).forEach((value) => {
			value.board.update();
		});
	});
	$('#Values').click(() => {
		$('#ratesID').hide();
		$('#tab3ID').hide();
		$('#statesID').show();
		$('#Values').addClass('active');
		$('#Rates').removeClass('active');
		Object.values(graph.states).forEach((value) => {
			value.board.update();
		});
	});
}

// Event handler at the beginning used to initialize fsmCSS
function init() {
	initClickFunction();
	document.getElementById('Designer').click();
	fsm.init(); // initializes all components for the tab "The Model"
	document.getElementById('Simulator').click();
	document.getElementById('Rates').click();
	$('#Simulator').click((evt) => {
		$('#fsmID').hide();
		$('#odeID').hide();
		$('#inID').hide();
		$('#plotID').show();
		$('#tab2ID').show();
		$('#GraphButtons').show();
		$('#Simulator').addClass('active');
		$('#Designer').removeClass('active');
		if (Object.keys(graph).length !== 0) graph.update();
		document.getElementById('Rates').click();
	});
	initial();
	document.getElementById('Designer').click();
}
// Script Execution: Wait for the page (precisely: DOM structure) to be loaded
document.addEventListener('DOMContentLoaded', () => {
	init();
});
