'use strict';

(() => {
	const Collection = require('../src/collection');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Loading JSON', () => {
		it('JSON with prefix', () => {
			const data = {
				prefix: 'foo',
				icons: {
					bar: {
						body: '<bar />',
						width: 20,
						height: 20,
					},
					baz: {
						body: '<baz />',
						width: 20,
						height: 20,
					},
				},
				aliases: {
					baz90: {
						parent: 'baz',
						rotate: 1,
					},
				},
			};

			let collection = new Collection();
			expect(collection.loadJSON(data)).to.be.equal(true);

			expect(collection.prefix()).to.be.equal('foo');

			let items = collection.getIcons();
			expect(items.icons.bar).to.be.eql(data.icons.bar);
		});

		it('missing prefix', () => {
			const data = {
				icons: {
					bar: {
						body: '<bar />',
						width: 20,
						height: 20,
					},
					baz: {
						body: '<baz />',
						width: 20,
						height: 20,
					},
				},
				aliases: {
					baz90: {
						parent: 'baz',
						rotate: 1,
					},
				},
			};

			let collection = new Collection();
			expect(collection.loadJSON(data)).to.be.equal(false);

			expect(collection.prefix()).to.be.equal(false);
			expect(collection.getIcons()).to.be.equal(null);
		});

		it('set prefix', () => {
			const data = {
				icons: {
					'test-foo-bar': {
						body: '<bar />',
						width: 20,
						height: 20,
					},
					'test-foo-baz': {
						body: '<baz />',
						width: 20,
						height: 20,
					},
				},
				aliases: {
					'test-foo-baz90': {
						parent: 'test-foo-baz',
						rotate: 1,
					},
				},
			};

			let collection = new Collection();
			expect(collection.loadJSON(data, 'test')).to.be.equal(true);

			expect(collection.prefix()).to.be.equal('test');

			let items = collection.getIcons();
			expect(Object.keys(items.icons)).to.be.eql(['foo-bar', 'foo-baz']);
		});

		it('wrong prefix', () => {
			const data = {
				icons: {
					'test-foo-bar': {
						body: '<bar />',
						width: 20,
						height: 20,
					},
					'test-foo-baz': {
						body: '<baz />',
						width: 20,
						height: 20,
					},
				},
				aliases: {
					'test-foo-baz90': {
						parent: 'test-foo-baz',
						rotate: 1,
					},
				},
			};

			let collection = new Collection();
			// icon names must have : after prefix that has -
			expect(collection.loadJSON(data, 'test-foo')).to.be.equal(false);
			expect(collection.prefix()).to.be.equal(false);
		});

		it('detectable prefix', () => {
			const data = {
				icons: {
					'test-foo-bar': {
						body: '<bar />',
						width: 20,
						height: 20,
					},
					'test-foo-baz': {
						body: '<baz />',
						width: 20,
						height: 20,
					},
				},
				aliases: {
					'test-foo-baz90': {
						parent: 'test-foo-baz',
						rotate: 1,
					},
				},
			};

			let collection = new Collection();
			expect(collection.loadJSON(data)).to.be.equal(true);

			expect(collection.prefix()).to.be.equal('test');
		});

		it('detectable prefix 2', () => {
			const data = {
				icons: {
					'test-foo:bar': {
						body: '<bar />',
						width: 20,
						height: 20,
					},
					'test-foo:baz': {
						body: '<baz />',
						width: 20,
						height: 20,
					},
				},
				aliases: {
					'test-foo:baz90': {
						parent: 'test-foo:baz',
						rotate: 1,
					},
				},
			};

			let collection = new Collection();
			expect(collection.loadJSON(data)).to.be.equal(true);

			expect(collection.prefix()).to.be.equal('test-foo');
		});

		it('mismatched icon', () => {
			const data = {
				icons: {
					'foo-bar': {
						body: '<bar />',
						width: 20,
						height: 20,
					},
					'bar-baz': {
						body: '<baz />',
						width: 20,
						height: 20,
					},
				},
			};

			let collection = new Collection();
			expect(collection.loadJSON(data)).to.be.equal(false);

			expect(collection.prefix()).to.be.equal(false);
		});

		it('mismatched alias', () => {
			const data = {
				icons: {
					'foo-bar': {
						body: '<bar />',
						width: 20,
						height: 20,
					},
					'foo-baz': {
						body: '<baz />',
						width: 20,
						height: 20,
					},
				},
				aliases: {
					'foo2-baz90': {
						parent: 'foo-baz',
						rotate: 1,
					},
				},
			};

			let collection = new Collection();
			expect(collection.loadJSON(data)).to.be.equal(false);

			expect(collection.prefix()).to.be.equal(false);
		});

		it('mismatched parent item', () => {
			const data = {
				icons: {
					'foo-bar:test': {
						body: '<bar />',
						width: 20,
						height: 20,
					},
					'foo-bar:baz': {
						body: '<baz />',
						width: 20,
						height: 20,
					},
				},
				aliases: {
					'foo-bar:baz90': {
						parent: 'foo-baz', // Invalid parent icon
						rotate: 1,
					},
				},
			};

			let collection = new Collection();
			expect(collection.loadJSON(data)).to.be.equal(false);

			expect(collection.prefix()).to.be.equal(false);
		});

		it('mismatched partial prefix', () => {
			const data = {
				icons: {
					'foo-bar:test': {
						body: '<bar />',
						width: 20,
						height: 20,
					},
					'foo-bar:baz': {
						body: '<baz />',
						width: 20,
						height: 20,
					},
				},
				aliases: {
					// Prefix is "foo", not "foo-bar"
					'foo-bar-baz90': {
						parent: 'foo-bar:baz',
						rotate: 1,
					},
				},
			};

			let collection = new Collection();
			expect(collection.loadJSON(data)).to.be.equal(false);

			expect(collection.prefix()).to.be.equal(false);
		});

		it('optimized collection', () => {
			const data = {
				prefix: 'foo',
				icons: {
					bar: {
						body: '<bar />',
						height: 20,
					},
					baz: {
						body: '<baz />',
					},
				},
				aliases: {
					baz90: {
						parent: 'baz',
						rotate: 1,
					},
				},
				width: 30,
				height: 40,
			};

			let collection = new Collection();
			expect(collection.loadJSON(data)).to.be.equal(true);

			expect(collection.prefix()).to.be.equal('foo');

			let items = collection.getIcons();
			expect(items.icons.bar).to.be.eql({
				body: '<bar />',
				height: 20,
			});
			expect(items.icons.baz).to.be.eql({
				body: '<baz />',
			});
		});
	});
})();
