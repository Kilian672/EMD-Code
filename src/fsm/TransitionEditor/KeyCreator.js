/*
 * Key Creator
 *
 * Responsible for creating one single key for the keyboard frame
 */

let xmlns = 'http://www.w3.org/2000/svg'; // XML namespace
let elSize = 35; // length of one square/button

// create a SVG text element with the given string and return it
function createText(txt) {
	const xmlTxt = document.createElementNS(xmlns, 'text');
	xmlTxt.setAttributeNS(null, 'x', 0.5 * elSize);
	xmlTxt.setAttributeNS(null, 'y', 0.5 * elSize);
	xmlTxt.style.textAnchor = 'middle';
	xmlTxt.style.alignmentBaseline = 'central';
	xmlTxt.style.font = '20px Verdana, Geneva, Tahoma, sans-serif';
	xmlTxt.style.fill = 'black';
	xmlTxt.style.pointerEvents = 'none';
	xmlTxt.innerHTML = txt;
	return xmlTxt;
}

// create a SVG rectangle (square) which resembles the key
function createRect() {
	const rect = document.createElementNS(xmlns, 'rect');
	// we prefer translate over fixed coordinates
	rect.setAttributeNS(null, 'x', 0);
	rect.setAttributeNS(null, 'y', 0);
	rect.setAttributeNS(null, 'width', elSize);
	rect.setAttributeNS(null, 'height', elSize);
	rect.style.strokeWidth = 1;
	rect.style.stroke = 'black';
	rect.setAttributeNS(null, 'fill', 'white');
	return rect;
}

// create key at given position with given label
function createKey(x, y, txt) {
	const key = document.createElementNS(xmlns, 'g');
	key.setAttributeNS(null, 'transform', 'translate(' + x + ',' + y + ')');
	key.appendChild(createRect());
	key.appendChild(createText(txt));
	return key;
}

const keyCreator = {};
keyCreator.setNS = (ns) => {
	xmlns = ns;
};
keyCreator.getNS = () => xmlns;
keyCreator.setKeySize = (s) => {
	elSize = s;
};
keyCreator.getKeySize = () => elSize;
keyCreator.createKey = createKey;

export default keyCreator;
