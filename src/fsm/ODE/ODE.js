/*
 *  ODE: updates ode data structure and frame
 *  odeMgr: relevant object that is exported in the end
 */

const odeMgr = {}; // declaration of the object, functions are added at the end
let odeHTML = {}; // the HTML div, initialized in function init (called by fsm)
let ode = {}; // the ode data structure

/*
 * function initODE
 * Argument shapes: this is the map shapes.shMap provided by Graph/Shapes.js, pairs (id,object)
 * 
 * Description: initializes the data structure ode as a map
 * Each entry of ode reflects one row (meaning one equation)
 * Keys are the shapes (the objects) that are states (first character of id is 's')
 * Values are initially empty
 */
function initODE(shapes) {
	let id;
	let sh;
	ode = new Map();
	// eslint-disable-next-line guard-for-in, no-restricted-syntax
	for ([id, sh] of shapes) {
		if (id.substring(0, 1) === 's') {
			ode.set(sh, []);
		}
	}
}

/*
 * function splitTransition
 * Argument tr: a transition object in the shapes.shMap (Graph/Shapes.js)
 * Return value trArr: array representing the transition in terms of the ode
 * 
 * Description: converts a transition object into an array trArr
 * Called by buildODE() below for transitions ([id,sh] of shapes.shMap, first character of id is 't')
 * The transition object tr provides the array tr.nameArr (the transition label per character)
 * Each entry of tr.nameArr is a pair tr.nameArr[ind]=[type,token]
 * The type specifies if the token is a state (type='s'), rate ('r'), or operator ('o', meaning '+')
 * The "transition label" is multiplied with the source state (tr.source) by default
 * 
 * Each entry of trArr is one contribution to the sum (so each entry is a product)
 * So, whenever we parse an operator ('o') we create a new entry
 * First thing we do is add the source state as first factor to the product (with its type 's')
 * If we encounter any other type ('s', 'r') we simply add it as factor to the current product
 * The token for states is the state object
 * The token for rates is the unicode (numerical)
 */

function splitTransition(tr) {
	const trArr = [];
	const len = tr.nameArr.length;
	const sst = tr.source;
	let sInd = 0;
	let ind;
	let type;
	let token;
	if (len === 0) return trArr; // not possible, but to be safe
	trArr[0] = [];
	for (ind = 0; ind < len; ind += 1) {
		[type, token] = tr.nameArr[ind];
		if (type === 'o') {
			trArr[sInd].push(['s', sst]);
			sInd += 1;
			trArr[sInd] = [];
		} else{
			if(token.radius !== 0){
				trArr[sInd].push([type, token]);
			}else{
				trArr[sInd].push(['n', token]);
			}
		} 
	}
	trArr[sInd].push(['s', sst]);
	return trArr;
}


//Nearly the same as the function splitTransition, but we don't multiply the rate with a state automically
function splitTransitionspecial(trs) {
	const trArr = [];
	const len = trs.nameArr.length;
	//const sst = trs.source;
	let sInd = 0;
	let ind;
	let type;
	let token;
	if (len === 0) return trArr; // not possible, but to be safe
	trArr[0] = [];
	for (ind = 0; ind < len; ind += 1) {
		[type, token] = trs.nameArr[ind];
		if (type === 'o') {
			//trArr[sInd].push(['s', sst]);
			sInd += 1;
			trArr[sInd] = [];
		} else{
			if(token.radius !== 0){
				trArr[sInd].push([type, token]);
			}else{
				trArr[sInd].push(['n', token]);
			}
		} 
	}
	//trArr[sInd].push(['s', sst]);
	return trArr;
}

/*
 * function addTransitionToState
 * Argument st: shape object of type state, identifying the equation/row
 * Argument tr: the converted transition obtained from splitTransition
 * Argument s: the sign
 * 
 * Description: Refer to splitTransition for the structure of tr
 * Two rows/equations are affected by one transition
 * The row/equation corresponding to the source state (sh.source).
 * where we have to subtract the terms given by tr (s=-1)
 * The row/equation corresponding to the target state (sh.target)
 * where we have to add the terms given by tr (s=+1)
 */

function addTransitionToState(st, tr, s) {
	let sInd;
	const sLen = tr.length;
	// stArr is the current sum corresponding to state st modeled as array
	const stArr = ode.get(st);
	// each entry of stArr is an object with properties "sign" and "prod"
	// sign is set according to source/target state, prod is the entry of tr
	for (sInd = 0; sInd < sLen; sInd += 1) {
		stArr.push({ sign: s, prod: tr[sInd] });
	}
}

/*
 * function odeBuild
 * Argument shapes: shapes.shMap in Graph/Shapes.js
 * Description: Creates the ode data structure from scratch
 * ode is a map, pairs [key,value]
 * key is an object, namely a state in the shapes.shMap map
 * value is an array representing a sum
 * each entry value[id] of value is an object with properties sign and prod
 * sign is the sign of the contribution to the sum
 * prod is an array representing a product
 * each entry of prod[id] of prod is a pair [type,token]
 * type is 's' for state or 'r' for rate
 * token is a (unicode) symbol
 * 
 * initODE is called to initialize the ode map with all existing states as keys, empty values
 * Then all transitions are parsed by splitTransition to obtain an array representing a sum
 * addTransitionToState adds the contribution to the source & target state row/equation
 */

odeMgr.odeBuild = (shapes) => {
	let id;
	let sh;
	let trArr;
	initODE(shapes);
	// eslint-disable-next-line guard-for-in, no-restricted-syntax
	for ([id, sh] of shapes) {
		if (id.substring(0, 1) === 't') {
			if(sh.type !== undefined){
				trArr = splitTransitionspecial(sh);
				if(sh.type === 'in'){
					addTransitionToState(sh.target, trArr, +1);
				}else{
					addTransitionToState(sh.source, trArr, -1);
				}
			}   
			else {
				trArr = splitTransition(sh);
				addTransitionToState(sh.source, trArr, -1);
				addTransitionToState(sh.target, trArr, +1);
			}
		}
	}
};

/*
 * function update
 * Argument shapes: shapes.shMap in Graph/Shapes.js
 * 
 * Description: builds the ode data structure from scratch and updates ode frame
 * Calls odeBuild to build the ode map (described there)
 * Based on the ode data structure the HTML code for the ode frame is created from scratch
 * The HTML structure is a table, in the end the innerHTML of the div is overwritten with the new table
 * Construction of the table is straightforward
 */

odeMgr.update = (shapes) => {
	let odeStr;
	let equStr;
	let prodStr;
	let st;
	let sArr;
	let sLen;
	let sInd;
	let pArr;
	let pLen;
	let pInd;
	let type;
	let fac;
	let signRequired;
	let codefornumber = 0; 
	let statescount = 0; 
	let populationStr = []; 
	const dx = String.fromCodePoint(8339); // the unicode subscript x to indicate the derivative
	odeMgr.odeBuild(shapes);
	odeStr = '<table>';
	// eslint-disable-next-line guard-for-in, no-restricted-syntax
	for ([st, sArr] of ode) {
		if(st.name !== 'N'){ 
		populationStr.push(st.name); //we save the states in an array
		equStr = "<tr><td align='right'>";
		if (st.nameArr.length > 1) {
			equStr = equStr + '(' + st.name + ')' + dx;
		} else equStr = equStr + st.name + dx;
		equStr += '</td>';
		equStr += "<td align='center'>=</td>";
		equStr += "<td align='left'><div class='odeEquation'>";
		sLen = sArr.length;
		signRequired = false;
		// eslint-disable-next-line guard-for-in, no-restricted-syntax
		for (sInd = 0; sInd < sLen; sInd += 1) {
			statescount = 0; //reset the statescount
			if (sArr[sInd].sign < 0) prodStr = '–';
			else if (signRequired) prodStr = '+';
			else prodStr = '';
			pArr = sArr[sInd].prod;
			pLen = pArr.length;
			// eslint-disable-next-line guard-for-in, no-restricted-syntax
			for (pInd = 0; pInd < pLen; pInd += 1) {
				[type, fac] = pArr[pInd];
				// here, we identify the strings, for states it's the state.name
				// for rates it is the symbol corresponding to the unicode
				if(type === 's'){
					fac = fac.name;
					statescount ++;
				}else if(type ==='n'){
					fac = fac.name;
				}else fac = String.fromCodePoint(fac);
				prodStr += fac;
			}
			if(statescount > 1){ //if statescount > 1, we need some normalization terms
				prodStr += 'N';
				prodStr += String.fromCodePoint(8315);
				statescount--;
				switch(statescount){
					case 1:
						codefornumber = 185;
						break;
					case 2:
						codefornumber = 178;
						break;
					case 3:
						codefornumber = 179;
						break;
					default:
						codefornumber = 8304 + statescount;
						break;
				}
				prodStr += String.fromCodePoint(codefornumber);
			}
			equStr += prodStr;
			signRequired = true;
		}
		if (!signRequired) equStr += '0';
		equStr += '</div></td></tr>';
		odeStr += equStr;
	}}
	equStr = "<tr><td align='right'>N</td><td align='center'>=</td><td align='left'><div class='odeEquation'>";
	for(let i=0; i<populationStr.length;i++){
		if(i > 0) equStr += '+';
		equStr += populationStr[i];
	}
	equStr += '</div></td></tr>';
	odeStr += equStr;
	odeStr += '</table>';
	odeHTML.innerHTML = odeStr;
};

// called by FSM.init to provide the HTML container
odeMgr.init = (cont) => {
	odeHTML = cont;
};

// getter for the ode data structure
odeMgr.getODEs = () => ode;

export default odeMgr;
