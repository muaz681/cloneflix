'use strict';

(() => {
	const Collection = require('../src/collection');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Adding new icons', () => {
		it('adding icons', () => {
			let collection = new Collection();

			// Add item without prefix
			expect(
				collection.addIcon('foo', {
					body: '<foo />',
				})
			).to.be.equal(false);
			expect(collection.iconExists('foo')).to.be.equal(false);

			// Set prefix and try again
			collection = new Collection('test-prefix');
			expect(
				collection.addIcon('foo', {
					body: '<foo />',
				})
			).to.be.equal(true);
			expect(collection.iconExists('foo')).to.be.equal(true);

			// Add few more icons
			expect(
				collection.addIcon('bar', {
					body: '<bar />',
				})
			).to.be.equal(true);
			expect(
				collection.addIcon('baz', {
					body: '<baz />',
					char: 'f0a0',
				})
			).to.be.equal(true);

			// Add aliases
			expect(
				collection.addAlias('bar2', 'bar', {
					rotate: 1,
				})
			).to.be.equal(true);
			expect(
				collection.addAlias('bar3', 'bar2', {
					hFlip: true,
					char: 'f0a1',
				})
			).to.be.equal(true);
			expect(
				collection.addAlias('foo2', 'foo1', {
					hFlip: true,
					char: 'f0a2',
				})
			).to.be.equal(false);

			// Test reserved word
			expect(
				collection.addAlias('constructor', 'foo', {
					vFlip: true,
				})
			).to.be.equal(true);

			// Get JSON data
			expect(collection.getIcons()).to.be.eql({
				prefix: 'test-prefix',
				icons: {
					foo: {
						body: '<foo />',
					},
					bar: {
						body: '<bar />',
					},
					baz: {
						body: '<baz />',
					},
				},
				aliases: {
					bar2: {
						parent: 'bar',
						rotate: 1,
					},
					bar3: {
						parent: 'bar2',
						hFlip: true,
					},
					constructor: {
						parent: 'foo',
						vFlip: true,
					},
				},
				chars: {
					f0a0: 'baz',
					f0a1: 'bar3',
				},
			});

			// Get everything except 'foo'
			expect(collection.getIcons(['bar3', 'baz'])).to.be.eql({
				prefix: 'test-prefix',
				icons: {
					bar: {
						body: '<bar />',
					},
					baz: {
						body: '<baz />',
					},
				},
				aliases: {
					bar2: {
						parent: 'bar',
						rotate: 1,
					},
					bar3: {
						parent: 'bar2',
						hFlip: true,
					},
				},
			});
		});
	});
})();
