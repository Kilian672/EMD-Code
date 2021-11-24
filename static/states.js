/*****************************************************************************************************************************
 *
 * PLOT INTERFACE DEMONSTRATION
 *
 * ***************************************************************************************************************************/

/*****************************************************************************************************************************
 *
 * FINITE STATE MACHINE / INPUT PROCESSING
 *
 * No warranties, code adjustments at own risk
 *
 *****************************************************************************************************************************/

//Current System State, containes all the information we need at a given time
var fsmCSS;

//FiniteStateMachine class: wrapper class for fsm handling
class fsmFiniteStateMachine {
	/*
	 *  Event Handling
	 */

	/* Registered Event Handlers */

	static mouseDown(e) {
		e.preventDefault(); //We don't want anyone else to process our clicks, consequences only for the canvas
		if (e.button != 0) return false;
		switch (
			fsmCSS.state //distribute according to the state we're in
		) {
			case 'i':
				fsmCSS.systemStateMouseDown(e);
				break;
			case 's':
				fsmCSS.stateMouseDown(e);
				break;
			case 't':
				fsmCSS.transitionMouseDown(e);
				break;
			case 'sr':
			case 'tr':
				if (fsmCSS.renameValidate()) fsmCSS.systemStateMouseDown(e);
				break; //need to check if we're allowed to leave
			case 'sm':
			case 'tm':
				break;
			default:
				break;
		}
		fsmCSS.canvas.focus(); //hack to ensure we get the focus we deserve
		return false;
	}
	static mouseClick(e) {
		e.preventDefault();
		return false;
	}
	static contextMenu(e) {
		e.preventDefault();
		return false;
	}
	static dblClick(e) {
		//the only state where double clicks are relevant is idle
		e.preventDefault(); //We don't want anyone else to process our clicks, consequences only for the canvas
		if (fsmCSS.state != 'i') return false;
		//idle state; idleMouseDown ensures that we double clicked empty space
		var id = fsmCSS.generateFreeID('s');
		if (id.length == 0) {
			alert(
				'Only ' + fsmCSS.instancesLimit + ' states allowed, limit reached!',
			);
			return null;
		}
		fsmCSS.shapes[id] = new fsmState(id, e.offsetX, e.offsetY);
		fsmCSS.systemStateActivate('sr', fsmCSS.shapes[id]);
		fsmCSS.draw();
		return false;
	}
	static mouseUp(e) {
		e.preventDefault();
		if (e.button == 0) fsmCSS.moveStop();
		return false;
	}
	static mouseOut(e) {
		fsmCSS.moveStop();
	}
	static mouseMove(e) {
		if (fsmCSS.state.length > 1 && fsmCSS.state.substring(1, 2) == 'm') {
			fsmCSS.activeShape.move(e.offsetX, e.offsetY);
			fsmCSS.draw();
		}
	}
	//Have to use keydown, otherwise we could not catch events since keypress needs it, but then the browser gets them, too
	static keyDown(e) {
		e.preventDefault(); //keep keys
		var key = e.keycode || e.which;
		switch (
			fsmCSS.state //distribute according to the state we're in
		) {
			case 's':
				fsmCSS.stateKeyDown(e);
				break;
			case 'sr':
				fsmCSS.renameKeyDown(e, 's');
				break;
			case 't':
				fsmCSS.transitionKeyDown(e);
				break;
			case 'tr':
				fsmCSS.renameKeyDown(e, 't');
				break;
			default:
				break;
		}
		return false;
	}
	static keyUp(e) {
		var key = e.keycode || e.which;
		switch (
			fsmCSS.state //distribute according to the state we're in
		) {
			case 's':
				if (key == 17) fsmCSS.selectionTransitionTarget = false;
				break; //inline
			case 't':
				fsmCSS.transitionKeyUp(key);
				break;
			default:
				break;
		}
	}

	static focusOut(e) {}

	/* Additional Event Handlers */

	stateMouseDown(e) {
		if (this.selectionTransitionTarget) {
			var shAct = this.activeShape;
			var sh = this.identifyShape(e);
			if (sh == null || sh.id.substring(0, 1) != 's' || sh.id == shAct.id)
				return;
			shAct.deactivate();
			var id = this.generateFreeID('t');
			if (id.length == 0) {
				alert(
					'Only ' +
						fsmCSS.instancesLimit +
						' transitions allowed, limit reached!',
				);
				return;
			}
			this.shapes[id] = new fsmTransition(id, shAct, sh);
			//no object change yet, only after we have a name
			fsmCSS.systemStateActivate('tr', fsmCSS.shapes[id]);
			fsmCSS.draw();
		} else this.systemStateMouseDown(e);
	}

	transitionMouseDown(e) {
		if (this.selectionTransitionTarget) {
			var sh = this.identifyShape(e);
			if (
				sh == null ||
				sh.id.substring(0, 1) != 's' ||
				sh.id == this.activeShape.source.id ||
				sh.id == this.activeShape.target.id
			)
				return;
			this.activeShape.deactivate(); //back to normal colours
			this.activeShape.setTarget(sh);
			this.activeShape.activate();
			this.odeUpdate();
			fsmCSS.draw();
		} else if (this.selectionTransitionSource) {
			var sh = this.identifyShape(e);
			if (
				sh == null ||
				sh.id.substring(0, 1) != 's' ||
				sh.id == this.activeShape.source.id ||
				sh.id == this.activeShape.target.id
			)
				return;
			this.activeShape.deactivate(); //back to normal colours
			this.activeShape.setSource(sh);
			this.activeShape.activate();
			this.odeUpdate();
			fsmCSS.draw();
		} else if (this.selectionTransitionFactor) {
			var sh = this.identifyShape(e);
			if (sh == null || sh.id.substring(0, 1) != 's') return;
			this.activeShape.deactivate(); //back to normal colours
			this.activeShape.toggleFactor(sh);
			this.activeShape.activate();
			this.odeUpdate();
			fsmCSS.draw();
		} else this.systemStateMouseDown(e);
	}

	stateKeyDown(e) {
		var key = e.keycode || e.which;
		if (key == 17) fsmCSS.selectionTransitionTarget = true;
		if (key == this.selectionKeyRename)
			this.systemStateActivate('sr', this.activeShape);
		else if (key == this.selectionKeyDelete) {
			this.stateDelete(this.activeShape);
			this.systemStateActivate('i', null);
			this.draw();
		}
	}

	transitionKeyDown(e) {
		var key = e.keycode || e.which;
		if (key == fsmCSS.selectionKeyTransitionTarget)
			fsmCSS.selectionTransitionTarget = true;
		else if (key == fsmCSS.selectionKeyTransitionSource)
			fsmCSS.selectionTransitionSource = true;
		else if (key == fsmCSS.selectionKeyTransitionFactor)
			fsmCSS.selectionTransitionFactor = true;
		else if (key == this.selectionKeyRename) {
			this.systemStateActivate('tr', this.activeShape);
		} else if (key == this.selectionKeyDelete) {
			this.transitionDelete(this.activeShape);
			this.systemStateActivate('i', null);
			this.draw();
		}
	}

	transitionKeyUp(key) {
		if (key == fsmCSS.selectionKeyTransitionTarget)
			fsmCSS.selectionTransitionTarget = false;
		else if (key == fsmCSS.selectionKeyTransitionSource)
			fsmCSS.selectionTransitionSource = false;
		else if (key == fsmCSS.selectionKeyTransitionFactor)
			fsmCSS.selectionTransitionFactor = false;
	}

	constructor() {
		//can be considered the default constructor if user input is possible but not available
		//essentially fixed
		this.stateRadius = 20;
		this.snapToPadding = 6; //px
		this.hitTargetPadding = 6; //px, buffer to assume we wanted to click current shape
		this.instancesLimit = 1000000;
		this.stateDefaultColour = 'black';
		this.stateSelectedColour = 'blue';
		this.stateTransitionFactorColour = 'red';

		this.transitionDefaultColour = 'black';
		this.transitionSelectedColour = 'blue';
		this.transitionStateFactorColour = 'red';

		this.selectionKeyRename = 45;
		this.selectionKeyDelete = 46;
		this.selectionKeyTransitionTarget = 84;
		this.selectionKeyTransitionSource = 83;
		this.selectionKeyTransitionFactor = 70;
		this.help = { i: '', s: '', sr: '', sm: '', t: '', tr: '', tm: '' };
		this.help.i =
			'Double click an empty space in the <b>Markov States</b> pane to create a state.<br>' +
			'Click an object to select it.<br>' +
			'Drag a state to improve readability.<br>';
		this.help.s =
			'Press <b>DEL</b> to delete the state.<br>' +
			'Press <b>INS</b> to rename the state.<br>' +
			'Hold <b>CTRL</b> and click a state to create a transition.<br>' +
			'Click an empty space for more options.';
		this.help.sr =
			'Press <b>CTRL</b> + <b>l</b> (latin), <b>g</b> (greek), <b>s</b> (symbol) to choose an alphabet.<br>' +
			'Enter letters (<b>a</b> or <b>A</b>) to change the name.<br>' +
			'Enter numbers (<b>1</b>, <b>2</b>, <b>12</b>) to add a subscript<br>' +
			'Delete with <b>BACKSPACE</b>, confirm with <b>ENTER</b> or click.';
		this.help.t =
			'Press <b>DEL</b> to delete the transition.<br>' +
			'Press <b>INS</b> to rename the transition.<br>' +
			'Hold <b>t</b> to choose a transition target (<b>s</b>ource, <b>f</b>actor).<br>' +
			'Click an empty space for more options.';
		this.help.tr = this.help.sr;
		this.help.sm = this.help.s;
		this.help.tm = this.help.t;

		this.symbols = {
			L: { S: null, C: null },
			G: { S: null, C: null },
			S: { S: null, C: null },
		};
		this.symbols.L.S = {
			A: 119886,
			B: 119887,
			C: 119888,
			D: 119889,
			E: 119890,
			F: 119891,
			G: 119892,
			H: 8462,
			I: 119894,
			J: 119895,
			K: 119896,
			L: 119897,
			M: 119898,
			N: 119899,
			O: 119900,
			P: 119901,
			Q: 119902,
			R: 119903,
			S: 119904,
			T: 119905,
			U: 119906,
			V: 119907,
			W: 119908,
			X: 119909,
			Y: 119910,
			Z: 119911,
			0: 8320,
			1: 8321,
			2: 8322,
			3: 8323,
			4: 8324,
			5: 8325,
			6: 8326,
			7: 8327,
			8: 8328,
			9: 8329,
		};
		this.symbols.L.C = {
			A: 119860,
			B: 119861,
			C: 119862,
			D: 119863,
			E: 119864,
			F: 119865,
			G: 119866,
			H: 119867,
			I: 119868,
			J: 119869,
			K: 119870,
			L: 119871,
			M: 119872,
			N: 119873,
			O: 119874,
			P: 119875,
			Q: 119876,
			R: 119877,
			S: 119878,
			T: 119879,
			U: 119880,
			V: 119881,
			W: 119882,
			X: 119883,
			Y: 119884,
			Z: 119885,
			0: 8320,
			1: 8321,
			2: 8322,
			3: 8323,
			4: 8324,
			5: 8325,
			6: 8326,
			7: 8327,
			8: 8328,
			9: 8329,
		};
		this.symbols.G.S = {
			A: 120572,
			B: 120573,
			C: 120585,
			D: 120575,
			E: 120576,
			F: 120593,
			G: 120574,
			H: 120578,
			I: 120580,
			J: 120589,
			K: 120581,
			L: 120582,
			M: 120583,
			N: 120584,
			O: 120586,
			P: 120587,
			Q: 120579,
			R: 120588,
			S: 120590,
			T: 120591,
			U: 120592,
			W: 120596,
			X: 120594,
			Y: 120595,
			Z: 120577,
			0: 8320,
			1: 8321,
			2: 8322,
			3: 8323,
			4: 8324,
			5: 8325,
			6: 8326,
			7: 8327,
			8: 8328,
			9: 8329,
		};
		this.symbols.G.C = {
			A: 120546,
			B: 120547,
			C: 120559,
			D: 120549,
			E: 120550,
			F: 120567,
			G: 120548,
			H: 120552,
			I: 120554,
			K: 120555,
			L: 120556,
			M: 120557,
			N: 120558,
			O: 120560,
			P: 120561,
			Q: 120553,
			R: 120562,
			S: 120564,
			T: 120565,
			U: 120566,
			W: 120570,
			X: 120568,
			Y: 120569,
			Z: 120551,
			0: 8320,
			1: 8321,
			2: 8322,
			3: 8323,
			4: 8324,
			5: 8325,
			6: 8326,
			7: 8327,
			8: 8328,
			9: 8329,
		};
		this.symbols.S.S = {
			E: 120598,
			F: 120601,
			K: 120600,
			P: 120603,
			Q: 120599,
			R: 120602,
			0: 8320,
			1: 8321,
			2: 8322,
			3: 8323,
			4: 8324,
			5: 8325,
			6: 8326,
			7: 8327,
			8: 8328,
			9: 8329,
		};
		this.symbols.S.C = {
			Q: 120563,
			0: 8320,
			1: 8321,
			2: 8322,
			3: 8323,
			4: 8324,
			5: 8325,
			6: 8326,
			7: 8327,
			8: 8328,
			9: 8329,
		};
		this.alphabet = 'L';

		//constant throughout
		this.canvas = document.getElementById('canvasID');
		this.context = this.canvas.getContext('2d');
		this.helpBox = document.getElementById('helpID');
		this.helpBox.innerHTML = this.help.i;

		this.canvas.addEventListener('mousedown', fsmFiniteStateMachine.mouseDown);
		this.canvas.addEventListener('click', fsmFiniteStateMachine.mouseClick);
		this.canvas.addEventListener('dblclick', fsmFiniteStateMachine.dblClick);
		this.canvas.addEventListener(
			'contextmenu',
			fsmFiniteStateMachine.contextMenu,
		);
		this.canvas.addEventListener('mouseup', fsmFiniteStateMachine.mouseUp);
		this.canvas.addEventListener('mousemove', fsmFiniteStateMachine.mouseMove);
		this.canvas.addEventListener('mouseout', fsmFiniteStateMachine.mouseOut);
		this.canvas.addEventListener('keydown', fsmFiniteStateMachine.keyDown);
		this.canvas.addEventListener('keyup', fsmFiniteStateMachine.keyUp);
		this.canvas.addEventListener('focusout', fsmFiniteStateMachine.focusOut);
		//this.canvas.addEventListener('focusin',fsmFiniteStateMachine.focusIn);

		//time dependent
		this.shapes = [];
		this.activeShape = null;
		this.selectionTransitionTarget = false;
		this.selectionTransitionSource = false;
		this.selectionTransitionFactor = false;
		this.state = 'i';
		this.ode = [];
		this.rateCnt = [];
		this.nameOld = '';
	}

	/*
	 *
	 *  SYSTEM STATE CONTROL
	 *
	 */

	/*
	 *  SYSTEM STATE ACTIVATION: Required Actions to Enter a System State
	 */

	systemStateActivate(st, sh) {
		if (sh != null) sh.activate();
		if (this.activeShape != null) this.nameOld = this.activeShape.name;
		else this.nameOld = '';
		this.activeShape = sh;
		this.state = st;
		this.selectionTransitionFactor = false;
		this.selectionTransitionSource = false;
		this.selectionTransitionTarget = false;
		this.alphabet = 'L';
		this.helpBox.innerHTML = this.help[st];
	}

	//SYSTEM STATE MOUSE DOWN: System State Switch Triggered by Mouse Down
	systemStateMouseDown(e) {
		var sh = this.identifyShape(e);
		var shType = 'i';
		if (sh != null) {
			shType = sh.id.substring(0, 1) + 'm';
			sh.moveStart(e.offsetX, e.offsetY);
		}
		if (this.state != 'i') this.activeShape.deactivate();
		this.systemStateActivate(shType, sh);
		this.draw();
	}

	//STOP MOVING: System State Switch Triggered by Mouse Up/Out
	moveStop() {
		if (this.state.length > 1 && this.state.substring(1, 2) == 'm') {
			this.activeShape.moveStop();
			this.systemStateActivate(this.state.substring(0, 1), this.activeShape);
		}
	}

	/*
	 *  SHAPE IDENTIFICATION
	 */

	identifyShape(e) {
		var shID;
		var shType;
		for (shID in this.shapes) {
			shType = shID.substring(0, 1);
			switch (shType) {
				case 's':
					if (this.pointInState(e.offsetX, e.offsetY, this.shapes[shID]))
						return this.shapes[shID];
					break;
				case 't':
					if (this.pointInTransition(e.offsetX, e.offsetY, this.shapes[shID]))
						return this.shapes[shID];
					break;
				default:
					break;
			}
		}
		return null;
	}

	pointInState(x, y, s) {
		var ctx = this.context;
		ctx.beginPath();
		ctx.arc(s.x, s.y, this.stateRadius, 0, 2 * Math.PI);
		ctx.closePath();
		if (ctx.isPointInPath(x, y)) return true;
		return false;
	}

	pointInTransition(x, y, t) {
		var dx = t.shape.target.point.x - t.shape.source.point.x;
		var dy = t.shape.target.point.y - t.shape.source.point.y;
		var length = Math.sqrt(dx * dx + dy * dy);
		var percent =
			(dx * (x - t.shape.source.point.x) + dy * (y - t.shape.source.point.y)) /
			(length * length);
		var distance =
			(dx * (y - t.shape.source.point.y) - dy * (x - t.shape.source.point.x)) /
			length;
		return (
			percent > 0 && percent < 1 && Math.abs(distance) < fsmCSS.hitTargetPadding
		);
	}

	/*
	 *  STRING MANIPULATION: NAMES, IDS, RENAMING
	 */

	//ID GENERATION: generate unique ID for each shape, the type determined by the prefix
	generateFreeID(pre) {
		var i;
		var arr = this.shapes;
		var id = -1;
		var idTaken = true;
		while (id < fsmCSS.instancesLimit) {
			id++;
			idTaken = false;
			for (i in arr) {
				if (i == pre + id) idTaken = true;
			}
			if (!idTaken) return pre + id;
		}
		return '';
	}

	//required action for keyevent e & both states "sr", "tr"
	renameKeyDown(e, st) {
		var key = e.keyCode || e.which;
		var obj = this.activeShape;
		if (key == 13 && this.renameValidate()) {
			this.systemStateActivate(st, obj);
			return true;
		}
		if (e.ctrlKey) {
			key = String.fromCharCode(key);
			if (key == 'L' || key == 'G' || key == 'S') this.alphabet = key;
			return true; //the only CTRL combinations we're interested in
		}
		if (key == 8) {
			obj.nameRemoveChr();
			this.draw();
			return true;
		} //backspace, delete character
		key = String.fromCharCode(key);
		var u = this.symbols[this.alphabet][e.shiftKey ? 'C' : 'S'][key];
		if (u === undefined) return true;
		obj.nameAddChr(u);
		this.draw();
		return true;
	}

	//in both cases the rule is that name != "" and no already existing state has this name
	renameValidate() {
		var obj = this.activeShape;
		if (obj.name.length == 0) {
			alert('Please provide a name!');
			return false;
		}
		for (var id in this.shapes) {
			if (
				obj.name == this.shapes[id].name &&
				obj.id != id &&
				id.substring(0, 1) == 's'
			) {
				alert('There already exists a state with this name!');
				return false;
			}
		}
		this.objectChange(obj);
		return true;
	}

	//called when an object is successfully created or changed
	objectChange(obj) {
		var type = obj.id.substring(0, 1);
		this.odeUpdate(); //on any change we build the ode from scratch
		if (type == 's') this.stateChange(obj);
		else if (type == 't') this.transitionChange(obj);
	}

	stateChange(st) {
		var userIn;
		var tbl;
		var tblRow;
		var tblData;
		tblRow = document.getElementById('inc' + st.id);
		if (tblRow == null) {
			tbl = document.getElementById('incTableID');
			if (tbl == null) {
				tbl = document.createElement('table');
				tbl.setAttribute('id', 'incTableID');
				document.getElementById('incID').appendChild(tbl);
			}
			tblRow = document.createElement('tr');
			tblRow.setAttribute('id', 'inc' + st.id);
			tblData = document.createElement('td');
			tblData.setAttribute('id', 'incValueLabel' + st.id);
			tblData.setAttribute('align', 'right');
			tblData.innerHTML = st.name + '(0)=';
			tblRow.appendChild(tblData);
			tblData = document.createElement('td');
			tblData.setAttribute('align', 'left');
			userIn = document.createElement('input');
			userIn.setAttribute('type', 'number');
			userIn.setAttribute('min', 0);
			userIn.setAttribute('step', 0.01);
			userIn.setAttribute('class', 'incValue');
			userIn.setAttribute('value', 0);
			userIn.setAttribute('id', 'incValue' + st.id);
			tblData.appendChild(userIn);
			tblRow.appendChild(tblData);
			tbl.appendChild(tblRow);
		} else {
			tblData = document.getElementById('incValueLabel' + st.id);
			tblData.innerHTML = st.name + '(0)=';
		}
	}

	transitionChange(tr) {
		var userIn;
		var tbl;
		var tblRow;
		var tblData;
		tblRow = document.getElementById('trr' + tr.name);
		if (tblRow == null) {
			tbl = document.getElementById('trrTableID');
			if (tbl == null) {
				tbl = document.createElement('table');
				tbl.setAttribute('id', 'trrTableID');
				document.getElementById('trrID').appendChild(tbl);
			}
			tblRow = document.createElement('tr');
			tblRow.setAttribute('id', 'trr' + tr.name);
			tblData = document.createElement('td');
			tblData.setAttribute('id', 'trrValueLabel' + tr.name);
			tblData.setAttribute('align', 'right');
			tblData.innerHTML = tr.name + '=';
			tblRow.appendChild(tblData);
			tblData = document.createElement('td');
			tblData.setAttribute('align', 'left');
			userIn = document.createElement('input');
			userIn.setAttribute('type', 'number');
			userIn.setAttribute('min', 0);
			userIn.setAttribute('step', 0.01);
			userIn.setAttribute('class', 'trrValue');
			userIn.setAttribute('value', 0);
			userIn.setAttribute('id', 'trrValue' + tr.name);
			tblData.appendChild(userIn);
			tblRow.appendChild(tblData);
			tbl.appendChild(tblRow);
			this.rateCnt[tr.name] = 1;
			this.rateCnt[this.nameOld]--;
		} else if (tr.name != this.nameOld) {
			tblData = document.getElementById('trrValueLabel' + tr.name);
			tblData.innerHTML = tr.name + '=';
			this.rateCnt[this.nameOld]--;
			this.rateCnt[tr.name]++;
		}
		if (this.rateCnt[this.nameOld] <= 0) {
			tbl = document.getElementById('trrTableID');
			tblRow = document.getElementById('trr' + this.nameOld);
			tbl.removeChild(tblRow);
			delete this.rateCnt[this.nameOld];
		}
	}

	stateDelete(sh) {
		var tbl;
		var tblRow;
		sh.deactivate();
		for (var id in sh.transitions['in']) this.transitionDelete(this.shapes[id]);
		for (var id in sh.transitions['out'])
			this.transitionDelete(this.shapes[id]);
		for (var id in sh.transitions['factor']) this.shapes[id].toggleFactor(sh);
		tbl = document.getElementById('incTableID');
		tblRow = document.getElementById('inc' + sh.id);
		tbl.removeChild(tblRow);
		delete this.shapes[sh.id];
		this.odeUpdate();
	}

	transitionDelete(tr) {
		var tbl;
		var tblRow;
		tr.delete();
		this.rateCnt[tr.name]--;
		if (this.rateCnt[tr.name] <= 0) {
			delete this.rateCnt[tr.name];
			tbl = document.getElementById('trrTableID');
			tblRow = document.getElementById('trr' + tr.name);
			tbl.removeChild(tblRow);
		}
		delete this.shapes[tr.id];
		this.odeUpdate();
	}

	buildString(a) {
		var s = '';
		for (var i = 0; i < a.length; i++) s += String.fromCodePoint(a[i]);
		return s;
	}

	/*
	 *  DRAWING
	 */

	draw() {
		var ctx = this.context;
		var can = this.canvas;
		var id;
		ctx.clearRect(0, 0, can.width, can.height);
		for (id in this.shapes) this.shapes[id].draw();
	}

	/*
	 *  ODE update: updates ode pane on user request
	 */

	odeUpdate() {
		var odeStr;
		var equStr;
		var prodStr;
		var sID;
		var tID;
		var fID;
		var sign;
		var signRequired;
		this.odeBuild();
		odeStr = '<table>';
		for (sID in this.ode) {
			equStr = "<tr><td align='right'>";
			if (this.ode[sID].state.nameArr.length > 1)
				equStr =
					equStr +
					'(' +
					this.ode[sID].state.name +
					')' +
					String.fromCodePoint(8339);
			else
				equStr = equStr + this.ode[sID].state.name + String.fromCodePoint(8339);
			equStr =
				equStr +
				"</td><td align='center'>=</td><td align='left'><div class='odeEquation'>";
			signRequired = false;
			for (tID in this.ode[sID].sum) {
				sign = '';
				if (this.ode[sID].sum[tID].sign < 0) sign = '–';
				else if (signRequired) sign = '+';
				prodStr = sign + this.ode[sID].sum[tID].coeff.name;
				for (fID in this.ode[sID].sum[tID].prod) {
					prodStr = prodStr + this.ode[sID].sum[tID].prod[fID].name;
				}
				equStr = equStr + prodStr;
				signRequired = true;
			}
			if (!signRequired) equStr = equStr + '0';
			equStr = equStr + '</div></td></tr>';
			odeStr = odeStr + equStr;
		}
		odeStr = odeStr + '</table>';
		document.getElementById('odeID').innerHTML = odeStr;
	}

	odeBuild() {
		var id;
		var t;
		var fID;
		this.ode = [];
		for (id in this.shapes) {
			if (id.substring(0, 1) == 's') {
				this.ode[id] = { state: this.shapes[id], sum: [] };
			}
		}
		for (id in this.shapes) {
			if (id.substring(0, 1) == 't') {
				t = this.shapes[id];
				this.ode[t.source.id].sum[t.id] = { coeff: t, sign: -1, prod: [] };
				for (fID in t.factors)
					this.ode[t.source.id].sum[t.id].prod[fID] = t.factors[fID];
				this.ode[t.target.id].sum[t.id] = { coeff: t, sign: 1, prod: [] };
				for (fID in t.factors)
					this.ode[t.target.id].sum[t.id].prod[fID] = t.factors[fID];
			}
		}
	}
	plotExport() {
		var plotData = [];
		var stID;
		var trID;
		var facID;
		var fctInd;
		var sumInd;
		var prodInd;
		var indLookup = [];
		var equ;
		var sum;
		var prod;
		var factors;
		var coeffName;
		var coeffHTML;
		var initHTML;
		fctInd = 0;
		for (stID in this.ode) {
			indLookup[stID] = fctInd;
			fctInd++;
		}
		plotData['fctNames'] = [];
		plotData['fctInit'] = [];
		plotData['derivatives'] = [];
		for (stID in this.ode) {
			fctInd = indLookup[stID];
			equ = this.ode[stID];
			sum = equ['sum'];
			//TODO: we add a live inc col with >=0 & sum=1 values, then read these here
			initHTML = document.getElementById('incValue' + stID);
			plotData['fctNames'][fctInd] = equ['state'].name;
			plotData['fctInit'][fctInd] = 0; //initHTML.valueAsNumber;
			plotData['derivatives'][fctInd] = [];
			sumInd = 0;
			for (trID in sum) {
				prod = sum[trID];
				factors = prod['prod'];
				coeffName = prod['coeff'].name;
				coeffHTML = document.getElementById('trrValue' + coeffName);
				plotData['derivatives'][fctInd][sumInd] = [];
				plotData['derivatives'][fctInd][sumInd][0] = [prod['sign'], coeffName];
				prodInd = 1;
				for (facID in factors) {
					plotData['derivatives'][fctInd][sumInd][prodInd] = indLookup[facID]; //facID==factors[facID].id
					prodInd++;
				}
				sumInd++;
			}
		}
		return plotData;
	}
}

/*
 *
 *  STATE CLASS
 *
 */

class fsmState {
	constructor(id, x, y) {
		x = Math.min(x, fsmCSS.canvas.width - fsmCSS.stateRadius);
		x = Math.max(x, fsmCSS.stateRadius);
		y = Math.min(y, fsmCSS.canvas.height - fsmCSS.stateRadius);
		y = Math.max(y, fsmCSS.stateRadius);
		this.x = x;
		this.y = y;
		this.moveOffsetX = 0;
		this.moveOffsetY = 0;
		this.id = id;
		this.nameArr = []; //javascript is not too good at handling unicode
		this.name = '';
		this.data = [];
		this.colour = fsmCSS.stateDefaultColour;
		this.lineWidth = 1; //add flexibility
		this.transitions = { in: [], out: [], factor: [] };
	}

	transitionAdd(t, typ) {
		this.transitions[typ][t.id] = t;
	}

	transitionDelete(t, typ) {
		delete this.transitions[typ][t.id];
	}

	/*
	 *  DE-ACTIVATION
	 */

	//activates the state: assigns proper colours to components involved
	activate() {
		this.colour = fsmCSS.stateSelectedColour;
		for (var id in this.transitions['factor']) {
			this.transitions['factor'][id].colour =
				fsmCSS.stateTransitionFactorColour;
		}
	}
	//deactivates state: assigns default colours to components involved
	deactivate() {
		this.colour = fsmCSS.stateDefaultColour;
		for (var id in this.transitions['factor']) {
			this.transitions['factor'][id].colour = fsmCSS.transitionDefaultColour;
		}
	}

	/*
	 *  MOVING
	 */

	moveStart(xm, ym) {
		this.moveOffsetX = xm - this.x;
		this.moveOffsetY = ym - this.y;
	}

	move(xm, ym) {
		this.x = xm - this.moveOffsetX;
		this.y = ym - this.moveOffsetY;
		this.x = Math.min(this.x, fsmCSS.canvas.width - fsmCSS.stateRadius);
		this.x = Math.max(this.x, fsmCSS.stateRadius);
		this.y = Math.min(this.y, fsmCSS.canvas.height - fsmCSS.stateRadius);
		this.y = Math.max(this.y, fsmCSS.stateRadius);
		//handling of transitions
		for (var id in this.transitions['in'])
			this.transitions['in'][id].updateShape();
		for (var id in this.transitions['out'])
			this.transitions['out'][id].updateShape();
	}

	moveStop() {
		this.moveOffsetX = 0;
		this.moveOffsetY = 0;
	}

	/*
	 *  STRING MANIPULATION: RENAMING
	 */

	nameAddChr(c) {
		this.nameArr.push(c);
		this.name = this.name + String.fromCodePoint(c);
	}

	nameRemoveChr() {
		if (this.nameArr.length == 0) return null;
		this.nameArr.pop();
		this.name = fsmCSS.buildString(this.nameArr);
	}

	/*
	 *  DRAWING
	 */

	draw() {
		var ctx = fsmCSS.context;
		ctx.lineWidth = this.lineWidth;
		ctx.strokeStyle = this.colour;
		ctx.fillStyle = this.colour;
		ctx.font = '20px Verdana, Geneva, Tahoma, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.beginPath();
		ctx.arc(this.x, this.y, fsmCSS.stateRadius, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.fillText(this.name, this.x, this.y);
	}

	closestPointOnCircle(x, y) {
		var dx = x - this.x;
		var dy = y - this.y;
		var scale = Math.sqrt(dx * dx + dy * dy);
		return {
			x: this.x + (dx * fsmCSS.stateRadius) / scale,
			y: this.y + (dy * fsmCSS.stateRadius) / scale,
		};
	}
}

/*
 *
 *  TRANSITION CLASS
 *
 */

class fsmTransition {
	constructor(id, s, t) {
		this.id = id;
		this.nameArr = []; //javascript is not too good at handling unicode
		this.name = '';
		this.data = [];
		this.colour = fsmCSS.transitionDefaultColour;
		this.lineWidth = 1;
		this.shape = {
			source: { point: { x: 0, y: 0 } },
			target: { point: { x: 0, y: 0 } },
		};
		this.factors = [];
		s.transitionAdd(this, 'out');
		s.transitionAdd(this, 'factor');
		t.transitionAdd(this, 'in');
		this.source = s;
		this.target = t;
		this.factors[s.id] = s;
		this.updateShape();
	}

	delete() {
		this.deactivate();
		this.source.transitionDelete(this, 'out');
		this.target.transitionDelete(this, 'in');
		for (var id in this.factors)
			this.factors[id].transitionDelete(this, 'factor');
	}

	setTarget(t) {
		this.target.transitionDelete(this, 'in');
		this.target = t;
		t.transitionAdd(this, 'in');
		this.updateShape();
	}
	setSource(s) {
		this.source.transitionDelete(this, 'out');
		this.source = s;
		s.transitionAdd(this, 'out');
		this.updateShape();
	}
	toggleFactor(f) {
		var sh = this.factors[f.id];
		if (sh === undefined) {
			this.factors[f.id] = f;
			f.transitionAdd(this, 'factor');
		} else {
			delete this.factors[f.id];
			f.transitionDelete(this, 'factor');
		}
	}

	/*
	 *  DE-ACTIVATION
	 */

	//activates the state: assigns proper colours to components involved
	activate() {
		this.colour = fsmCSS.transitionSelectedColour;
		for (var id in this.factors)
			this.factors[id].colour = fsmCSS.transitionStateFactorColour;
	}
	//deactivates state: assigns default colours to components involved
	deactivate() {
		this.colour = fsmCSS.transitionDefaultColour;
		for (var id in this.factors)
			this.factors[id].colour = fsmCSS.stateDefaultColour;
	}

	/*
	 *  MOVING
	 */

	moveStart(xm, ym) {}

	move(x, y) {}

	moveStop() {}

	/*
	 *  UPDATE SHAPE (the object to be drawn)
	 */

	updateShape() {
		var midX = (this.source.x + this.target.x) / 2;
		var midY = (this.source.y + this.target.y) / 2;
		this.shape.source.point = this.source.closestPointOnCircle(midX, midY);
		this.shape.target.point = this.target.closestPointOnCircle(midX, midY);
	}

	/*
	 *  STRING MANIPULATION: RENAMING
	 */

	nameAddChr(c) {
		this.nameArr.push(c);
		this.name = this.name + String.fromCodePoint(c);
	}

	nameRemoveChr() {
		if (this.nameArr.length == 0) return null;
		this.nameArr.pop();
		this.name = fsmCSS.buildString(this.nameArr);
	}

	/*
	 *  DRAWING
	 */

	draw() {
		var ctx = fsmCSS.context;
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
		//all data for drawing has to be precomputed!
		//arrowhead
		var dx = this.shape.target.point.x - this.shape.source.point.x;
		var dy = this.shape.target.point.y - this.shape.source.point.y;
		var length = Math.sqrt(dx * dx + dy * dy);
		dx = dx / length;
		dy = dy / length;
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
		//text
		var textX = (this.shape.source.point.x + this.shape.target.point.x) / 2;
		var textY = (this.shape.source.point.y + this.shape.target.point.y) / 2;
		textX += 15 * dy;
		textY += -15 * dx;
		ctx.fillText(this.name, textX, textY);
	}
}

//Event handler at the beginning used to initialize fsmCSS
function fsmInit() {
	fsmCSS = new fsmFiniteStateMachine();
}
//Script Execution: Wait for the page (precisely: DOM structure) to be loaded, tell us to go live then
document.addEventListener('DOMContentLoaded', function (e) {
	fsmInit();
});
