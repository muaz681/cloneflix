'use strict';

(() => {
	const SVG = require('../src/svg'),
		addMissingAttributes = require('../src/collection').addMissingAttributes;

	const chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Testing SVG class', () => {
		it('simple SVG icon with default and custom dimensions', () => {
			let data = addMissingAttributes({
				body: '<body />',
				width: 24,
				height: 24,
			});

			let svg = new SVG(data);
			let result = svg.getSVG({});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><body /></svg>'
			);

			// Custom dimensions
			result = svg.getSVG({
				width: 48,
			});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="48" height="48" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><body /></svg>'
			);

			result = svg.getSVG({
				height: 32,
			});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="32" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><body /></svg>'
			);
		});

		it('custom colors and inline icon', () => {
			let data = addMissingAttributes({
				body: '<path d="whatever" fill="currentColor" />',
				width: 20,
				height: 24,
				inlineHeight: 28,
				inlineTop: -2,
			});

			let svg = new SVG(data);
			let result = svg.getSVG({});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0.84em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 24"><path d="whatever" fill="currentColor" /></svg>'
			);

			result = svg.getSVG({
				width: '48',
				color: 'red',
			});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="48" height="57.6" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 24"><path d="whatever" fill="red" /></svg>'
			);

			result = svg.getSVG({
				height: '100%',
				inline: 'true',
			});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="71.43%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 -2 20 28" style="vertical-align: -0.125em;"><path d="whatever" fill="currentColor" /></svg>'
			);
		});

		it('custom alignment', () => {
			let data = addMissingAttributes({
				body: '<path d="whatever" fill="currentColor" />',
				width: 20,
				height: 24,
				inlineHeight: 28,
				inlineTop: -2,
			});

			let svg = new SVG(data);
			let result = svg.getSVG({
				align: 'top',
				width: '50',
				height: '50',
			});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50" height="50" preserveAspectRatio="xMidYMin meet" viewBox="0 0 20 24"><path d="whatever" fill="currentColor" /></svg>'
			);

			result = svg.getSVG({
				align: 'left,bottom',
				width: '50',
				height: '50',
			});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50" height="50" preserveAspectRatio="xMinYMax meet" viewBox="0 0 20 24"><path d="whatever" fill="currentColor" /></svg>'
			);

			result = svg.getSVG({
				align: 'right,middle,crop',
				width: '50',
				height: '50',
			});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50" height="50" preserveAspectRatio="xMaxYMid slice" viewBox="0 0 20 24"><path d="whatever" fill="currentColor" /></svg>'
			);
		});

		it('transformations', () => {
			let data = addMissingAttributes({
				body: '<body />',
				width: 20,
				height: 24,
			});

			let svg = new SVG(data);
			let result = svg.getSVG({
				rotate: 1,
			});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1.2em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 20"><g transform="rotate(90 12 12)"><body /></g></svg>'
			);

			result = svg.getSVG({
				rotate: '180deg',
			});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0.84em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 24"><g transform="rotate(180 10 12)"><body /></g></svg>'
			);

			result = svg.getSVG({
				rotate: '3',
			});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1.2em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 20"><g transform="rotate(-90 10 10)"><body /></g></svg>'
			);

			// also test "id" - should not be in result
			result = svg.getSVG({
				rotate: '75%',
				id: 'test-id',
			});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1.2em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 20"><g transform="rotate(-90 10 10)"><body /></g></svg>'
			);

			// also test "id" - should be in result
			result = svg.getSVG(
				{
					flip: 'Horizontal',
					id: 'test-id',
				},
				true
			);
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="test-id" width="0.84em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 24"><g transform="translate(20 0) scale(-1 1)"><body /></g></svg>'
			);

			result = svg.getSVG({
				flip: 'ignored, Vertical space-works-as-comma',
			});
			expect(result).to.be.equal(
				'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0.84em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 24"><g transform="translate(0 24) scale(1 -1)"><body /></g></svg>'
			);
		});
	});
})();
