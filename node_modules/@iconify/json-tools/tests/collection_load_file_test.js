'use strict';

(() => {
	const Collection = require('../src/collection');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Loading from file', () => {
		it('synchronous loading', () => {
			let filename = __dirname + '/fixtures/test1.json';

			let collection = new Collection();
			expect(collection.loadFromFile(filename)).to.be.equal(true);

			expect(collection.prefix()).to.be.equal('fa');

			let items = collection.getIcons();
			expect(Object.keys(items.icons)).to.be.eql([
				'arrow-circle-left',
				'arrow-circle-up',
				'arrow-up',
				'arrow-left',
				'arrows',
				'arrows-alt',
				'arrows-h',
				'arrows-v',
				'assistive-listening-systems',
				'asterisk',
				'at',
				'audio-description',
			]);

			let icon = items.icons['arrow-circle-left'];
			expect(icon).to.be.eql({
				body:
					'<path d="M1280 832V704q0-26-19-45t-45-19H714l189-189q19-19 19-45t-19-45l-91-91q-18-18-45-18t-45 18L360 632l-91 91q-18 18-18 45t18 45l91 91 362 362q18 18 45 18t45-18l91-91q18-18 18-45t-18-45L714 896h502q26 0 45-19t19-45zm256-64q0 209-103 385.5T1153.5 1433 768 1536t-385.5-103T103 1153.5 0 768t103-385.5T382.5 103 768 0t385.5 103T1433 382.5 1536 768z" fill="currentColor"/>',
				width: 1536,
				height: 1536,
				inlineHeight: 1792,
				inlineTop: -128,
				verticalAlign: -0.143,
			});

			icon = items.aliases['arrow-right'];
			expect(icon).to.be.eql({
				parent: 'arrow-left',
				hFlip: true,
			});
		});

		it('asynchronous loading', done => {
			let filename = __dirname + '/fixtures/test1.json';

			let collection = new Collection();

			collection
				.loadFromFileAsync(filename)
				.then(collection => {
					expect(collection.prefix()).to.be.equal('fa');

					let items = collection.getIcons();
					expect(Object.keys(items.icons)).to.be.eql([
						'arrow-circle-left',
						'arrow-circle-up',
						'arrow-up',
						'arrow-left',
						'arrows',
						'arrows-alt',
						'arrows-h',
						'arrows-v',
						'assistive-listening-systems',
						'asterisk',
						'at',
						'audio-description',
					]);
					done();
				})
				.catch(err => {
					done(err ? err : 'Error loading file');
				});
		});

		it('loading iconify collection', () => {
			let collection = new Collection();
			expect(collection.loadIconifyCollection('fa-regular')).to.be.equal(true);
			expect(collection.prefix()).to.be.equal('fa-regular');
		});
	});
})();
