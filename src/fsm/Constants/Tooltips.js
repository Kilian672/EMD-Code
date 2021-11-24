const help = {
	i: '',
	s: '',
	sr: '',
	sm: '',
	t: '',
	tr: '',
	tm: '',
};

help.i =
	'Double click an empty space in the <b>Model</b> pane to create a state.<br>' +
	'Click an object to select it.<br>' +
	'Drag a state to improve readability.<br>';
help.s =
	'Press <b>DEL</b> to delete the state.<br>' +
	'Press <b>INS</b> to rename the state.<br>' +
	'Hold <b>CTRL</b> and click a state to create a transition.<br>' +
	'Click an empty space for more options.';
help.sr =
	'Press <b>CTRL</b> + <b>l</b> (latin), <b>g</b> (greek), <b>s</b> (symbol) to choose an alphabet.<br>' +
	'Enter letters (<b>a</b> or <b>A</b>) to change the name.<br>' +
	'Enter numbers (<b>1</b>, <b>2</b>, <b>12</b>) to add a subscript<br>' +
	'Delete with <b>BACKSPACE</b>, confirm with <b>ENTER</b> or click.';
help.t =
	'Press <b>DEL</b> to delete the transition.<br>' +
	'Press <b>INS</b> to rename the transition.<br>' +
	'Hold <b>t</b> to choose a transition target (<b>s</b>ource, <b>f</b>actor).<br>' +
	'Click an empty space for more options.';
help.tr = help.sr;
help.sm = help.s;
help.tm = help.t;

export default help;
