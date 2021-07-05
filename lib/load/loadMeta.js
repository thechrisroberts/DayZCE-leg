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

        this.loadUsage(limits.lists.usageflags.usage);
        this.loadTags(limits.lists.tags.tag);
        this.loadCategories(limits.lists.categories.category);
        this.loadValues(limits.lists.valueflags.value);
    },
    loadUsage(usages) {
        for (let i = 0; i < usages.length; i++) {
            new Usage({ name: usages[i].name }).save().then(usage => sets.meta.usages[usages[i].name] = usage);
        }
    },
    loadTags(tags) {
        for (let i = 0; i < tags.length; i++) {
            new Tag({ name: tags[i].name }).save().then(tag => sets.meta.tags[tags[i].name] = tag);
        }
    },
    loadCategories(categories) {
        for (let i = 0; i < categories.length; i++) {
            new Category({ name: categories[i].name }).save().then(category => sets.meta.categories[categories[i].name] = category);
        }
    },
    loadValues(values) {
        for (let i = 0; i < values.length; i++) {
            new Value({ name: values[i].name }).save().then(value => sets.meta.values[values[i].name] = value);
        }
    },
};