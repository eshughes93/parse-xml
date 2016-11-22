/**
	parse-xml.js
	Author: Evan Hughes
	Date: 2016 November 21

	This file exports a function parseXML which will return a JavaScript object
	literal representing the XML passed in.

	If the XML is invalid it will return an empty object.
*/

function parseXML(xml) {
	// At the very least it must be a length of 8, i.e. <k>v</k>
	if (!xml || xml.length < 8 || xml.charAt(0) !== '<') return {};
	try {
		return parse(xml);
	} catch (e) {
		return {};
	}
	// return parse(xml);
}

function parse(valueString) {
	if(valueString.indexOf('<') === 0) {
		let nextKey;
		try {
			nextKey = getKeyName(valueString);
		} catch (e) {
			return {};
		}
		let nextValueAndLeftovers;
		try {
			nextValueAndLeftovers = getNextValueSubstring(nextKey, valueString);
		} catch (e) {
			return {};
		}
		let {nextValue, leftovers} = nextValueAndLeftovers;
		let result = {};
		if (leftovers.length > 0) {
			result = parse(leftovers);
			// If result is an empty object then one of the previous iterations threw,
			// leaving an empty object as the result here.
			// At this point it should only happen if the keys are nested incorrectly.
			if (Object.keys(result).length === 0) throw new Error('Invalid key nesting.');
		}
		result[nextKey] = parse(nextValue);
		return result;
	} else {
		return valueString;
	}
}

function getKeyName(str) {
  let close = str.indexOf('>');
	if (close < 0) throw new Error('No valid keyname found.');
  return str.slice(1, close);
}

function getNextValueSubstring(keyName, valueString) {
  let keyOpen = `<${keyName}>`;
  let keyClose = `<\/${keyName}>`;
	let totalKeyLength = keyOpen.length + keyClose.length;
	let keyOpenIndex = valueString.indexOf(keyOpen) + keyOpen.length;
	let keyCloseIndex = valueString.indexOf(keyClose);
	if (keyOpenIndex < 0 || keyCloseIndex < 0) {
		throw new Error('No valid closing key found.');
	}
	let nextValue = valueString.slice(keyOpenIndex, keyCloseIndex);
	let leftovers = valueString.slice(keyCloseIndex + keyClose.length, valueString.length);
	return {nextValue, leftovers};
}

module.exports = parseXML;
