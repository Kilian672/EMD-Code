/* eslint-disable spaced-comment */
/* eslint-disable operator-linebreak */
import ode from './ode';
import { graph } from './graph';

function plotCurves() {
	function debounce(func, interval) {
		let lastCall = -1;
		return function () {
			clearTimeout(lastCall);
			const args = arguments;
			const self = this;
			lastCall = setTimeout(function () {
				func.apply(self, args);
			}, interval);
		};
	}
	graph.plotCurves = debounce(() => {
		//Adds Data computed by ode() to the datasets of the curves
		const data = ode();
		// Start Time
		console.time('Plot');
		Object.keys(graph.curves).forEach((key) => {
			graph.curves[key].dataX = [];
			graph.curves[key].dataY = [];
			for (let i = 0; i < 1000; i++) {
				graph.curves[key].dataX[i] =
					data[Math.floor((i * data.length) / 1000)][data[0].length - 1];
				if(key === 'n'){
					graph.curves[key].dataY[i] = graph.yPost(
						data[Math.floor((i * data.length) / 1000)][0],
					);
				}else{
				graph.curves[key].dataY[i] = graph.yPost(
					data[Math.floor((i * data.length) / 1000)][graph.statesMap[key]+1],
				);}
			}
		});
		graph.board.update();
		// Stop Time
		console.timeEnd('Plot');
	}, 20);
}

export default plotCurves;
