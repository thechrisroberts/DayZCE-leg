'use strict';

const fs = require('fs');
const merge = require('deepmerge');
const xmlParser = require('xml2json');
const db = require('../db');

const Usage = require('../models/Usage');
const Tag = require('../models/Tag');
const Category = require('../models/Category');
const Value = require('../models/Value');

const sets = require('../sets');

config = global.config;

module.exports = {
    async load() {
        const limitsXML = fs.readFileSync(`${config.missionPath}/cfglimitsdefinition.xml`);
        const limits = xmlParser.toJson(limitsXML, {
            object: true,
            arrayNotation: [
                'category',
                'tag',
                'usage',
                'value',
            ],
        });

        await this.loadUsage(limits.lists.usageflags.usage);

        await this.loadTags(limits.lists.tags.tag);

        await this.loadCategories(limits.lists.categories.category);

        await this.loadValues(limits.lists.valueflags.value);
    },
    async loadUsage(usages) {
        for (let i = 0; i < usages.length; i++) {
            await new Usage({ name: usages[i].name }).save().then(usage => sets.meta.usages[usages[i].name] = usage);
        }
    },
    async loadTags(tags) {
        for (let i = 0; i < tags.length; i++) {
            await new Tag({ name: tags[i].name }).save().then(tag => sets.meta.tags[tags[i].name] = tag);
        }
    },
    async loadCategories(categories) {
        for (let i = 0; i < categories.length; i++) {
            await new Category({ name: categories[i].name }).save().then(category => sets.meta.categories[categories[i].name] = category);
        }
    },
    async loadValues(values) {
        for (let i = 0; i < values.length; i++) {
            await new Value({ name: values[i].name }).save().then(value => sets.meta.values[values[i].name] = value);
        }
    },
};