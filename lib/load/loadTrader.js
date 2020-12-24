'use strict';

const fs = require('fs');
const merge = require('deepmerge');
const xmlParser = require('xml2json');
const config = require('../config');

const profilePath = `${config.server}/${config.profile}`;
const traderPath = `${profilePath}/Trader`;
const tradeVehicles = '';

module.exports = {
	loadItems() {
		const tradeFile = fs.readFileSync(`${traderPath}/TraderConfig.txt`, 'UTF-8');
		const tradeLines = tradeFile.split(/\r?\n/);
		const traders = {};
		const tradeItems = {};

		let trader = false;
		let category = false;
		let traderCount = 0;

		tradeLines.forEach(line => {
			line = line.trim();
			let startChar = line.substring(0, 1);

			// Clean up irrelevant lines and track trader/category
			if (line.toLowerCase() === '<fileend>' || ! startChar.length || startChar === '/') {
				return;
			} else if (startChar === '<') {
				let parts = line.match(/<([^>]+)>\s+(.+)/);

				if (! parts || parts.length !== 3) {
					return;
				}

				let type = parts[1].toLowerCase().trim();
				let name = parts[2].trim();

				if (type === 'trader') {
					trader = name;

					traders[trader] = {
						categories: {},
					};
				} else if (type === 'category') {
					category = name;

					traders[trader].categories[category] = [];
				}
			} else {
				let itemParts = line.split(',');

				if (! itemParts || itemParts.length !== 4) {
					console.log('Invalid trader line:', line);
				} else {
					let itemSet = {
						item: itemParts[0].trim(),
						flag: itemParts[1].trim(),
						buy: parseInt(itemParts[2].trim()),
						sell: parseInt(itemParts[3].trim()),
					};

					traders[trader].categories[category].push(itemSet);

					if (typeof tradeItems[itemSet.item] === 'undefined') {
						tradeItems[itemSet.item] = {};
					}

					tradeItems[itemSet.item][`${trader}.${category}`] = itemSet;
				}
			}
		});

		fs.writeFileSync(`store/trader.json`, JSON.stringify(traders, null, 4));
	},
	loadVehicles() {
		const tradeItems = fs.readFileSync(`${traderPath}/TraderVehicleParts.txt`);
	},
};