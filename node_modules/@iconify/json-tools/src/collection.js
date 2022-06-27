/**
 * This file is part of the @iconify/json-tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const fs = require('fs');
const normalize = require('./normalize');

const optimizeProps = [
	'width',
	'height',
	'top',
	'left',
	'inlineHeight',
	'inlineTop',
	'verticalAlign',
];

/**
 * Default options for scriptify()
 */
const defaultScriptifyOptions = {
	// Array of icons to get
	icons: null,

	// JavaScript callback function.
	callback: 'Iconify.addCollection',

	// True if result should be optimized for smaller file size
	optimize: false,

	// True if result should be pretty for easy reading
	pretty: false,
};

/**
 * Class to represent one collection of icons
 *
 * This class is used instead of Collection class when there is no need to parse each icon
 */
class Collection {
	/**
	 * Constructor
	 *
	 * @param {string} [prefix] Optional prefix
	 */
	constructor(prefix) {
		this.items =
			typeof prefix === 'string'
				? {
						prefix: prefix,
						icons: Object.create(null),
				  }
				: null;
	}

	/**
	 * Get prefix
	 *
	 * @returns {string|false}
	 */
	prefix() {
		return this.items === null ? false : this.items.prefix;
	}

	/**
	 * De-optimize JSON data
	 *
	 * @param data
	 */
	static deOptimize(data) {
		Object.keys(data).forEach((prop) => {
			switch (typeof data[prop]) {
				case 'number':
				case 'boolean':
					let value = data[prop];
					Object.keys(data.icons).forEach((key) => {
						if (data.icons[key][prop] === void 0) {
							data.icons[key][prop] = value;
						}
					});
					delete data[prop];
			}
		});
	}

	/**
	 * Optimize collection items by moving common values to root object
	 *
	 * @param {object} json Icons
	 * @param {Array} [props] Properties to optimize, null if default list should be used
	 */
	static optimize(json, props) {
		let icons = Object.keys(json.icons);

		props = props ? props : optimizeProps;

		// Delete empty aliases list
		if (json.aliases !== void 0 && !Object.keys(json.aliases).length) {
			delete json.aliases;
		}

		// Check all attributes
		props.forEach((prop) => {
			let maxCount = 0,
				maxValue = false,
				counters = Object.create(null);

			for (let i = 0; i < icons.length; i++) {
				let item = json.icons[icons[i]];

				if (item[prop] === void 0) {
					return;
				}

				let value = item[prop];

				if (!maxCount) {
					// First item
					maxCount = 1;
					maxValue = value;
					counters[value] = 1;
					continue;
				}

				if (counters[value] === void 0) {
					// First entry for new value
					counters[value] = 1;
					continue;
				}

				counters[value]++;
				if (counters[value] > maxCount) {
					maxCount = counters[value];
					maxValue = value;
				}
			}

			if (maxCount > 1) {
				// Remove duplicate values
				json[prop] = maxValue;
				icons.forEach((key) => {
					if (json.icons[key][prop] === maxValue) {
						delete json.icons[key][prop];
					}
				});
			}
		});
	}

	/**
	 * Load collection from file asynchronously
	 *
	 * @param {string} file File to load from
	 * @param {string} [defaultPrefix] Default prefix if collection does not have one
	 * @returns {Promise}
	 */
	loadFromFileAsync(file, defaultPrefix) {
		return new Promise((fulfill, reject) => {
			// Get default prefix from filename
			defaultPrefix =
				defaultPrefix === void 0
					? file.split(/[\\/]/).pop().split('.').shift()
					: defaultPrefix;

			// Load file
			fs.readFile(file, 'utf8', (err, data) => {
				if (err) {
					reject(err);
				} else {
					if (this.loadJSON(data, defaultPrefix)) {
						fulfill(this);
					} else {
						reject();
					}
				}
			});
		});
	}

	/**
	 * Load collection from file synchronously
	 *
	 * @param {string} file File to load from
	 * @param {string} [defaultPrefix] Default prefix if collection does not have one
	 * @returns {boolean}
	 */
	loadFromFile(file, defaultPrefix) {
		try {
			// Get default prefix from filename
			defaultPrefix =
				defaultPrefix === void 0
					? file.split(/[\\/]/).pop().split('.').shift()
					: defaultPrefix;

			// Load file
			let data = fs.readFileSync(file, 'utf8');
			return this.loadJSON(data, defaultPrefix);
		} catch (err) {
			return false;
		}
	}

	/**
	 * Load from JSON data
	 *
	 * @param {string|object} data
	 * @param {string} [defaultPrefix]
	 * @returns {boolean}
	 */
	loadJSON(data, defaultPrefix) {
		if (typeof data === 'string') {
			try {
				data = JSON.parse(data);
			} catch (err) {
				return false;
			}
		}

		// Validate
		if (typeof data !== 'object' || data.icons === void 0) {
			return false;
		}

		// Collection does not have prefix - attempt to detect it
		// All icons in collection must have same prefix and its preferred if prefix is set
		if (data.prefix === void 0 || data.prefix === '') {
			let prefix;
			if (defaultPrefix === void 0) {
				// Get prefix from first icon
				let keys = Object.keys(data.icons);
				if (!keys.length) {
					return false;
				}

				let key = keys[0],
					parts = key.split(':');

				if (parts.length === 2) {
					prefix = parts[0];
				} else {
					parts = key.split('-');
					if (parts.length < 2) {
						return false;
					}
					prefix = parts[0];
				}
			} else {
				prefix = defaultPrefix;
			}

			let prefixLength = prefix.length,
				sliceLength = prefixLength + 1,
				test1 = prefix + ':',
				test2 = prefix.indexOf('-') !== -1 ? null : prefix + '-';

			// Remove prefix from all icons and aliases
			for (let prop of ['icons', 'aliases']) {
				if (data[prop] === void 0) {
					continue;
				}
				let newItems = Object.create(null),
					keys = Object.keys(data[prop]);

				for (let key of keys) {
					// Verify that icon has correct prefix, return false on error
					let item = data[prop][key],
						test = key.slice(0, sliceLength);

					if (test !== test1 && test !== test2) {
						return false;
					}

					let newKey = key.slice(sliceLength);
					if (data[prop][key].parent !== void 0) {
						// Verify that parent icon has correct prefix, return false on error
						let parent = item.parent,
							test = parent.slice(0, sliceLength);

						if (test !== test1 && test !== test2) {
							return false;
						}
						item.parent = parent.slice(sliceLength);
					}
					newItems[newKey] = item;
				}
				data[prop] = newItems;
			}

			// Remove prefix from characters
			if (data.chars !== void 0) {
				let keys = Object.keys(data.chars);
				for (let char in keys) {
					let item = data.chars[char],
						test = item.slice(0, sliceLength);

					if (test !== test1 && test !== test2) {
						return false;
					}

					data.chars[char] = item.slice(sliceLength);
				}
			}

			data.prefix = prefix;
		}

		// Success
		this.items = data;
		return true;
	}

	/**
	 * Get filename for Iconify collection.
	 * If directory is not specified, make sure @iconify/json package is installed.
	 *
	 * @param {string} name Collection prefix
	 * @param {string} [dir] Directory of @iconify/json repository
	 */
	static findIconifyCollection(name, dir) {
		if (dir === void 0 || dir === null) {
			// Get directory from @iconify/json
			const icons = require('@iconify/json');
			dir = icons.rootDir();
		}

		return dir + '/json/' + name + '.json';
	}

	/**
	 * Load Iconify collection.
	 * If directory is not specified, make sure @iconify/json package is installed.
	 *
	 * @param {string} name Collection prefix
	 * @param {string} [dir] Directory of @iconify/json repository
	 * @returns {boolean}
	 */
	loadIconifyCollection(name, dir) {
		let filename = Collection.findIconifyCollection(name, dir);
		return this.loadFromFile(filename);
	}

	/**
	 * Get icons data (ready to be saved as JSON)
	 *
	 * @param {Array|null} [icons]
	 * @param {boolean} [notFound] True if "not_found" field should be added for missing icons
	 * @returns {object|null}
	 */
	getIcons(icons, notFound) {
		if (this.items === null) {
			return null;
		}

		let result;
		if (icons === null || icons === void 0) {
			result = this.items;
		} else {
			this._result = {
				prefix: this.items.prefix,
				icons: Object.create(null),
				aliases: Object.create(null),
			};
			this._addDefaultValues(this._result);

			icons.forEach((icon) => {
				if (!this._copy(icon, 0) && notFound) {
					if (this._result.not_found === void 0) {
						this._result.not_found = [];
					}
					this._result.not_found.push(icon);
				}
			});
			result = this._result;
		}

		return result;
	}

	/**
	 * Copy icon. Internal function used by getIcons()
	 *
	 * @param {string} name
	 * @param {number} iteration
	 * @returns {boolean}
	 * @private
	 */
	_copy(name, iteration) {
		if (
			iteration > 5 ||
			this._result.icons[name] !== void 0 ||
			this._result.aliases[name] !== void 0
		) {
			return true;
		}

		// Icon
		if (this.items.icons[name] !== void 0) {
			this._result.icons[name] = this.items.icons[name];
			return true;
		}

		// Alias
		if (this.items.aliases && this.items.aliases[name] !== void 0) {
			if (!this._copy(this.items.aliases[name].parent, iteration + 1)) {
				return false;
			}
			this._result.aliases[name] = this.items.aliases[name];
			return true;
		}

		// Character - return as alias
		if (this.items.chars !== void 0 && this.items.chars[name] !== void 0) {
			if (!this._copy(this.items.chars[name], iteration + 1)) {
				return false;
			}
			this._result.aliases[name] = {
				parent: this.items.chars[name],
			};
			return true;
		}

		// Not found
		return false;
	}

	/**
	 * Add default values for icon or collection.
	 *
	 * @param {object} data
	 * @private
	 */
	_addDefaultValues(data) {
		Object.keys(this.items).forEach((key) => {
			if (
				data[key] === void 0 &&
				(typeof this.items[key] === 'boolean' ||
					typeof this.items[key] === 'number')
			) {
				data[key] = this.items[key];
			}
		});
	}

	/**
	 * Get icon data for SVG
	 * This function assumes collection has been loaded. Verification should be done during loading
	 *
	 * @param {string} name
	 * @param {boolean} [normalized] False if optional data can be skipped (true by default)
	 * @returns {object|null}
	 */
	getIconData(name, normalized) {
		if (this.items.icons[name] !== void 0) {
			let data = Object.assign(Object.create(null), this.items.icons[name]);
			this._addDefaultValues(data);
			return normalized === false ? data : normalize(data);
		}

		// Alias
		if (this.items.aliases === void 0 || this.items.aliases[name] === void 0) {
			// Character
			if (this.items.chars !== void 0 && this.items.chars[name] !== void 0) {
				return this.getIconData(this.items.chars[name], normalized);
			}
			return null;
		}
		this._result = Object.assign(Object.create(null), this.items.aliases[name]);

		let parent = this.items.aliases[name].parent,
			iteration = 0;

		while (iteration < 5) {
			if (this.items.icons[parent] !== void 0) {
				// Merge with icon
				let icon = Object.assign(Object.create(null), this.items.icons[parent]);
				this._addDefaultValues(icon);
				this._mergeIcon(icon);
				return normalized === false ? this._result : normalize(this._result);
			}

			if (this.items.aliases[parent] === void 0) {
				return null;
			}
			this._mergeIcon(this.items.aliases[parent]);
			parent = this.items.aliases[parent].parent;
			iteration++;
		}
		return null;
	}

	/**
	 * Merge icon data with this._result. Internal function used by getIconData()
	 *
	 * @param {object} data
	 * @private
	 */
	_mergeIcon(data) {
		Object.keys(data).forEach((key) => {
			if (this._result[key] === void 0) {
				this._result[key] = data[key];
				return;
			}
			// Merge transformations, ignore the rest because alias overwrites parent items's attributes
			switch (key) {
				case 'rotate':
					this._result.rotate += data.rotate;
					break;

				case 'hFlip':
				case 'vFlip':
					this._result[key] = this._result[key] !== data[key];
			}
		});
	}

	/**
	 * Add missing properties to icon
	 *
	 * @param {object} data
	 * @returns {object}
	 */
	static addMissingAttributes(data) {
		return normalize(data);
	}

	/**
	 * Check if icon exists
	 *
	 * @param {string} name
	 * @returns {boolean}
	 */
	iconExists(name) {
		return this.items === null
			? false
			: this.items.icons[name] !== void 0 ||
					(this.items.aliases !== void 0 &&
						this.items.aliases[name] !== void 0);
	}

	/**
	 * Get list of icons
	 *
	 * @param {boolean} [includeAliases]
	 * @returns {Array}
	 */
	listIcons(includeAliases) {
		if (this.items === null) {
			return [];
		}

		let result = Object.keys(this.items.icons);
		if (includeAliases && this.items.aliases !== void 0) {
			result = result.concat(Object.keys(this.items.aliases));
		}

		return result;
	}

	/**
	 * Remove icon
	 *
	 * @param {string} icon
	 * @param {boolean} [checkAliases]
	 */
	removeIcon(icon, checkAliases) {
		if (this.items === null) {
			return;
		}

		// Remove icon
		if (this.items.icons[icon] !== void 0) {
			delete this.items.icons[icon];
		} else if (
			this.items.aliases !== void 0 &&
			this.items.aliases[icon] !== void 0
		) {
			delete this.items.aliases[icon];
		} else {
			return;
		}

		// Check aliases
		if (checkAliases !== false && this.items.aliases !== void 0) {
			let list = [];
			Object.keys(this.items.aliases).forEach((key) => {
				if (this.items.aliases[key].parent === icon) {
					list.push(key);
				}
			});
			for (let key of list) {
				this.removeIcon(key, true);
			}
		}
	}

	/**
	 * Add icon to collection
	 *
	 * @param {string} name Icon name
	 * @param {object} data Icon data
	 * @returns {boolean}
	 */
	addIcon(name, data) {
		if (typeof data !== 'object' || data.body === void 0) {
			return false;
		}
		return this._add(name, Object.assign(Object.create(null), data), false);
	}

	/**
	 * Add alias to collection
	 *
	 * @param {string} name Icon name
	 * @param {string} parent Parent icon name
	 * @param {object} [data] Icon data
	 * @returns {boolean}
	 */
	addAlias(name, parent, data) {
		if (data === void 0) {
			data = Object.create(null);
		}
		if (typeof data !== 'object' || !this.iconExists(parent)) {
			return false;
		}
		return this._add(
			name,
			Object.assign(Object.create(null), data, { parent: parent }),
			true
		);
	}

	/**
	 * Set default value for all icons
	 *
	 * @param {string} key
	 * @param {number|boolean} value
	 */
	setDefaultIconValue(key, value) {
		if (this.items === null) {
			return;
		}
		if (typeof value === 'number' || typeof value === 'boolean') {
			this.items[key] = value;
		}
	}

	/**
	 * Add item
	 *
	 * @param {string} name
	 * @param {object} data
	 * @param {boolean} alias
	 * @returns {boolean}
	 * @private
	 */
	_add(name, data, alias) {
		if (this.items === null) {
			return false;
		}

		if (data.char !== void 0) {
			if (this.items.chars === void 0) {
				this.items.chars = Object.create(null);
			}
			this.items.chars[data.char] = name;
			delete data.char;
		}

		if (alias && this.items.aliases === void 0) {
			this.items.aliases = Object.create(null);
		}
		this.items[alias ? 'aliases' : 'icons'][name] = data;
		if (!alias && this.items.aliases) {
			delete this.items.aliases[name];
		}

		return true;
	}

	/**
	 * Convert to Iconify script
	 *
	 * @param {object} [options] Options
	 * @returns {string}
	 */
	scriptify(options) {
		if (this.items === null) {
			return '';
		}

		options = Object.assign(
			Object.create(null),
			defaultScriptifyOptions,
			typeof options === 'object' ? options : Object.create(null)
		);

		// Get JSON data
		let json = this.getIcons(options.icons);
		if (options.optimize) {
			Collection.optimize(json);
		}
		json = options.pretty
			? JSON.stringify(json, null, '\t')
			: JSON.stringify(json);

		// Wrap in callback
		return options.callback + '(' + json + ');\n';
	}
}

module.exports = Collection;
