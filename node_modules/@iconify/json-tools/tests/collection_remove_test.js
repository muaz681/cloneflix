'use strict';

(() => {
	const Collection = require('../src/collection');

	const fs = require('fs'),
		chai = require('chai'),
		expect = chai.expect,
		should = chai.should();

	describe('Removing icons, listing icons, checking if icon exists', () => {
		it('collection with aliases', () => {
			let filename = __dirname + '/fixtures/test1.json';

			let collection = new Collection();
			collection.loadFromFile(filename);

			// Check original icons list without aliases
			// This test also tests listIcons() and iconExists()
			let icons = collection.listIcons(false);
			expect(icons).to.be.eql([
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

			// Check original icons list with aliases
			icons = collection.listIcons(true);
			expect(icons).to.be.eql([
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
				'arrow-circle-right',
				'arrow-down',
				'arrow-right',
			]);

			// Test removal of 'arrows'
			expect(collection.iconExists('arrows')).to.be.equal(true);
			collection.removeIcon('arrows');
			expect(collection.iconExists('arrows')).to.be.equal(false);

			icons = collection.listIcons(false);
			expect(icons).to.be.eql([
				'arrow-circle-left',
				'arrow-circle-up',
				'arrow-up',
				'arrow-left',
				'arrows-alt',
				'arrows-h',
				'arrows-v',
				'assistive-listening-systems',
				'asterisk',
				'at',
				'audio-description',
			]);

			// Test removal of 'arrow-up' without checking aliases
			expect(collection.iconExists('arrow-up')).to.be.equal(true);
			collection.removeIcon('arrow-up', false);
			expect(collection.iconExists('arrow-up')).to.be.equal(false);

			icons = collection.listIcons(true);
			expect(icons).to.be.eql([
				'arrow-circle-left',
				'arrow-circle-up',
				'arrow-left',
				'arrows-alt',
				'arrows-h',
				'arrows-v',
				'assistive-listening-systems',
				'asterisk',
				'at',
				'audio-description',
				'arrow-circle-right',
				'arrow-down',
				'arrow-right',
			]);

			// Test if 'arrow-down' exists and try to get its data
			expect(collection.iconExists('arrow-down')).to.be.equal(true);
			expect(collection.getIconData('arrow-down')).to.be.equal(null);

			// Test removal of 'arrow-left' and its aliases
			expect(collection.iconExists('arrow-left')).to.be.equal(true);
			expect(collection.iconExists('arrow-right')).to.be.equal(true);
			collection.removeIcon('arrow-left');
			expect(collection.iconExists('arrow-left')).to.be.equal(false);
			expect(collection.iconExists('arrow-right')).to.be.equal(false);

			icons = collection.listIcons(true);
			expect(icons).to.be.eql([
				'arrow-circle-left',
				'arrow-circle-up',
				'arrows-alt',
				'arrows-h',
				'arrows-v',
				'assistive-listening-systems',
				'asterisk',
				'at',
				'audio-description',
				'arrow-circle-right',
				'arrow-down',
			]);

			// Remove icon that does not exist
			collection.removeIcon('foo');
			icons = collection.listIcons(true);
			expect(icons).to.be.eql([
				'arrow-circle-left',
				'arrow-circle-up',
				'arrows-alt',
				'arrows-h',
				'arrows-v',
				'assistive-listening-systems',
				'asterisk',
				'at',
				'audio-description',
				'arrow-circle-right',
				'arrow-down',
			]);
		});

		it('collection without aliases', () => {
			let filename = __dirname + '/fixtures/test1.json',
				json = JSON.parse(fs.readFileSync(filename, 'utf8'));

			delete json.aliases;

			let collection = new Collection();
			collection.loadJSON(json);

			// Check original icons list without aliases
			// This test also tests listIcons() and iconExists()
			let icons = collection.listIcons(false);
			expect(icons).to.be.eql([
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

			// Check with aliases
			icons = collection.listIcons(true);
			expect(icons).to.be.eql([
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

			// Remove 'at'
			expect(collection.iconExists('at')).to.be.equal(true);
			collection.removeIcon('at');
			expect(collection.iconExists('at')).to.be.equal(false);

			icons = collection.listIcons(true);
			expect(icons).to.be.eql([
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
				'audio-description',
			]);

			// Get JSON. It should match original without 'at' icon
			json = JSON.parse(JSON.stringify(json));
			delete json.icons.at;
			let data = collection.getIcons();
			expect(data).to.be.eql(json);
		});
	});
})();
