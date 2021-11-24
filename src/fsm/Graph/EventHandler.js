/*
 * Technical Event Handler for the Canvas
 * The only thing that comes in here is stuff like
 * Prevent bubbling
 * Map mousedown + button=0 to left mouse down
 * Map several input events to the same event (like point and touch devices)
 * Filter out events that just shouldn't bubble
 */

let listener = {};
let canvas = {};

function mouseDown(e) {
	e.preventDefault(); // Don't want anyone else to process clicks, consequences only for the canvas
	if (e.button !== 0) return false;
	listener.mouseDown(e);
	canvas.focus(); // hack to ensure we get the focus we deserve
	return false;
}
function mouseClick(e) {
	e.preventDefault();
	// not used, only prevented, handled through mousedown
	return false;
}
function contextMenu(e) {
	e.preventDefault();
	// not used, only prevented
	return false;
}
function dblClick(e) {
	e.preventDefault(); // Don't want anyone else to process clicks, consequences only for the canvas
	listener.dblClick(e);
	return false;
}
function mouseUp(e) {
	e.preventDefault();
	if (e.button === 0) listener.mouseCancel(e);
	return false;
}
function mouseOut(e) {
	listener.mouseCancel(e);
}
function mouseMove(e) {
	listener.mouseMove(e);
}
// Must use keydown, otherwise cant catch event since keypress needs it, but then browser gets them
function keyDown(e) {
	e.preventDefault(); // keep keys
	listener.keyDown(e);
	return false;
}
function keyUp(e) {
	listener.keyUp(e);
}


// called by event manager
// first argument is the canvas, which triggers the events
// second argument is the eventMgr eMgr to process/manage the events (and delegate them)
function initCanvasEvents(c, l) {
	canvas = c;
	listener = l;
	canvas.addEventListener('mousedown', mouseDown);
	canvas.addEventListener('click', mouseClick);
	canvas.addEventListener('dblclick', dblClick);
	canvas.addEventListener('contextmenu', contextMenu);
	canvas.addEventListener('mousemove', mouseMove);
	canvas.addEventListener('mouseup', mouseUp);
	canvas.addEventListener('mouseout', mouseOut);
	canvas.addEventListener('keydown', keyDown);
	canvas.addEventListener('keyup', keyUp);
}

export default initCanvasEvents;
