let chai = require('chai');
let parseXML = require('../parse-xml');
chai.should();

/**
	@function checkKeys
		A helper function to check if an object has a given set of keys.
	@param shouldHave [List<String>] - An array of keys the object should have.
	@param has [List<String>] - An array of keys that the object actually has.
*/
function checkKeys(shouldHave, has) {
	shouldHave.forEach((key) => {
		has.includes(key).should.be.equal(true);
	});
}

/**
	@function isEmpty
		Simply checking if an object is empty (has no keys).
	@param object [Object] - the object to check.
*/
function isEmpty(object) {
	return Object.keys(object).length === 0;
}

// Some values to test on.
// The invalid values are down below in one of the last tests.
let simpleXML = "<key>value</key>";
let simpleNestedXML = "<foo><bar>baz</bar></foo>";
let flatXML = "<email><to>Paystand</to><from>Evan</from><subject>Potential Candidates</subject><body>Evan Hughes</body></email>";
let nestedXML = "<foo><bar><baz>bah</baz></bar></foo>";

describe('parseXML', function() {
	context('for simple xml', function() {
		it('should return an object with one key and value', function(done) {
			let obj = parseXML(simpleXML);
			obj.should.be.an('object');
			checkKeys(['key'], Object.keys(obj));
			obj.key.should.be.equal('value');
			done();
		});
	});
	context('for simple nested xml', function() {
		it('should return an object within an object', function(done) {
			let obj = parseXML(simpleNestedXML);
			obj.should.be.an('object');
			checkKeys(['foo'], Object.keys(obj));
			obj.foo.should.be.an('object');
			checkKeys(['bar'], Object.keys(obj.foo));
			obj.foo.bar.should.be.equal('baz');
			done();
		});
	});
	context('for a root with multiple nodes', function() {
		it('should return an object with many keys within an object', function(done) {
			let obj = parseXML(flatXML);
			obj.should.be.an('object');
			checkKeys(['email'], Object.keys(obj));
			obj.email.should.be.an('object');
			checkKeys(['to', 'from', 'subject', 'body'], Object.keys(obj.email));
			obj.email.to.should.be.equal('Paystand');
			obj.email.from.should.be.equal('Evan');
			obj.email.subject.should.be.equal('Potential Candidates');
			obj.email.body.should.be.equal('Evan Hughes');
			done();
		});
	});
	context('for nested xml with multiple levels', function() {
		it('it should return a deeply nested object', function(done) {
			let obj = parseXML(nestedXML);
			checkKeys(['foo'], Object.keys(obj));
			obj.foo.should.be.an('object');
			checkKeys(['bar'], Object.keys(obj.foo));
			obj.foo.bar.should.be.an('object');
			checkKeys(['baz'], Object.keys(obj.foo.bar));
			obj.foo.bar.baz.should.be.a('string');
			obj.foo.bar.baz.should.be.equal('bah');
			done();
		});
	});
	context('for a root with multiple nodes that are also deeply nested', function() {
		it('I think you get the idea...', function(done) {
			let testXML = `<root>${flatXML}${nestedXML}</root>`;
			let obj = parseXML(testXML);
			checkKeys(['root'], Object.keys(obj));
			obj.root.should.be.an('object');
			checkKeys(['foo', 'email'], Object.keys(obj.root));
			obj.root.foo.should.be.an('object');
			checkKeys(['bar'], Object.keys(obj.root.foo));
			obj.root.foo.bar.should.be.an('object');
			checkKeys(['baz'], Object.keys(obj.root.foo.bar));
			obj.root.foo.bar.baz.should.be.a('string');
			obj.root.foo.bar.baz.should.be.equal('bah');
			obj.root.email.should.be.an('object');
			checkKeys(['to', 'from', 'subject', 'body'], Object.keys(obj.root.email));
			obj.root.email.to.should.be.equal('Paystand');
			obj.root.email.from.should.be.equal('Evan');
			obj.root.email.subject.should.be.equal('Potential Candidates');
			obj.root.email.body.should.be.equal('Evan Hughes');
			done();
		});
	});
	describe('For invalid XML, such as', function() {
		context('XML missing a closing tag', function() {
			it('should return an empty object', function(done) {
				let missingClosingTagXML = '<key>value';
				let badClosingTagXML = '<key>value<key>';
				let obj1 = parseXML(missingClosingTagXML);
				let obj2 = parseXML(badClosingTagXML);
				isEmpty(obj1).should.be.equal(true);
				isEmpty(obj2).should.be.equal(true);
				done();
			});
		});
		context('XML missing an opening tag', function() {
			it('should return an empty object', function(done) {
				let noOpeningTag = 'value</key>';
				let badOpeningTag = '<key/value</key>';
				let obj1 = parseXML(noOpeningTag);
				let obj2 = parseXML(badOpeningTag);
				isEmpty(obj1).should.be.equal(true);
				isEmpty(obj2).should.be.equal(true);
				done();
			});
		});
		context('XML that is poorly nested', function() {
			it('should return an empty object', function(done) {
				let poorlyNestedXML = '<foo><bar>value<baz></bar></baz></foo>';
				let obj = parseXML(poorlyNestedXML);
				isEmpty(obj).should.be.equal(true);
				done();
			});
		});
	});
});
