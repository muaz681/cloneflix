'use strict';

(() => {
	const Collection = require('../src/collection');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('JSON optimization', () => {
		it('optimizing FontAwesome JSON', () => {
			// Get data from test1.json
			let original = fs.readFileSync(
					__dirname + '/fixtures/test1.json',
					'utf8'
				),
				preOptimized = fs.readFileSync(
					__dirname + '/fixtures/test1-optimized.json',
					'utf8'
				);

			original = JSON.parse(original);
			preOptimized = JSON.parse(preOptimized);

			// Optimize it
			let optimized = JSON.parse(JSON.stringify(original));
			Collection.optimize(optimized);

			expect(optimized).to.not.be.eql(original);
			expect(optimized).to.be.eql(preOptimized);

			// Test verticalAlign
			expect(optimized.verticalAlign).to.be.equal(-0.143);
			expect(optimized.icons['audio-description'].verticalAlign).to.be.equal(
				void 0
			);

			// Test width
			expect(optimized.width).to.be.equal(1536);
			expect(optimized.icons['arrow-circle-left'].width).to.be.equal(void 0);
			expect(optimized.icons['arrow-up'].width).to.not.be.equal(void 0);

			// Test if height is set and test each item
			expect(optimized.height).to.be.equal(1536);
			Object.keys(optimized.icons).forEach(key => {
				expect(
					optimized.icons[key].height === void 0 ||
						optimized.icons[key].height !== 1536
				).to.be.equal(true);
			});

			// De-optimize it
			let final = JSON.parse(JSON.stringify(optimized));
			Collection.deOptimize(final);

			expect(final).to.not.be.eql(optimized);
			expect(final).to.be.eql(original);
		});

		it('optimizing incomplete JSON', () => {
			let original = {
				prefix: 'test',
				icons: {
					foo: {
						body: '<path />',
						width: 1024,
						height: 512,
						verticalAlign: -0.125,
					},
					bar: {
						body: '<path />',
						width: 1024,
						height: 128,
						verticalAlign: -0.15,
					},
					baz: {
						body: '<path />',
						// missing width
						height: 128,
						verticalAlign: -0.12,
					},
				},
			};

			// Optimize it
			let optimized = JSON.parse(JSON.stringify(original));
			Collection.optimize(optimized);

			expect(optimized).to.be.eql({
				prefix: 'test',
				icons: {
					foo: {
						body: '<path />',
						width: 1024,
						height: 512,
						verticalAlign: -0.125,
					},
					bar: {
						body: '<path />',
						width: 1024,
						verticalAlign: -0.15,
					},
					baz: {
						body: '<path />',
						verticalAlign: -0.12,
					},
				},
				height: 128,
			});

			let final = JSON.parse(JSON.stringify(optimized));
			Collection.deOptimize(final);

			expect(final).to.be.eql(original);
		});
	});
})();
