/**
 * This file is part of the @iconify/json-tools package.
 *
 * (c) Vjacheslav Trushkin <cyberalien@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const defaultAttributes = {
	left: 0,
	top: 0,
	width: 16,
	height: 16,
	rotate: 0,
	hFlip: false,
	vFlip: false,
};

/**
 * Add missing properties to icon
 *
 * Important: in PHP version of this library this function is part of Collection class: Collection::addMissingAttributes()
 *
 * JavaScript version uses separate file so this function could be used in React and other components without loading
 * entire Collection class.
 *
 * @param {object} data
 * @return {object}
 */
module.exports = function(data) {
	let item = Object.assign(Object.create(null), defaultAttributes, data);
	if (item.inlineTop === void 0) {
		item.inlineTop = item.top;
	}
	if (item.inlineHeight === void 0) {
		item.inlineHeight = item.height;
	}
	if (item.verticalAlign === void 0) {
		// -0.143 if icon is designed for 14px height,
		// otherwise assume icon is designed for 16px height
		item.verticalAlign =
			item.height % 7 === 0 && item.height % 8 !== 0 ? -0.143 : -0.125;
	}
	return item;
};
