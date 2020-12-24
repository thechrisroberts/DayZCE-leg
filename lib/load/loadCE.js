'use strict';

const fs = require('fs');
const merge = require('deepmerge');
const xmlParser = require('xml2json');
const db = require('../db');

const File = require('../models/File');
const Item = require('../models/Item');

const sets = require('../sets');

config = global.config;

const profilePath = `${config.server}/${config.profile}`;
const missionPath = `${config.server}/${config.mission}`;
const missionCE = {
    types: [
        `${missionPath}/db/types.xml`,
    ],
    spawnabletypes: [
        `${missionPath}/cfgspawnabletypes.xml`,
    ],
    events: [
        `${missionPath}/db/events.xml`,
    ],
};

module.exports = {
    async gatherCE() {
        const economyXML = fs.readFileSync(`${missionPath}/cfgeconomycore.xml`);
        const economyCore = xmlParser.toJson(economyXML, {
            object: true,
            arrayNotation: [ 'ce' ],
        });

        await new File({
            type: 'types',
            name: 'types.xml',
            path: `${missionPath}/db/types.xml`
        }).save().then((file) => {
            sets.files.add(file);

            this.loadTypesFile(file);
        });
        
        await new File({
            type: 'spawnabletypes',
            name: 'cfgspawnabletypes.xml',
            path: `${missionPath}/cfgspawnabletypes.xml`
        }).save().then((file) => {
            sets.files.add(file);
        });
        
        await new File({
            type: 'events',
            name: 'events.xml',
            path: `${missionPath}/db/events.xml`
        }).save().then((file) => {
            sets.files.add(file);
        });

        for (let i = 0; i < economyCore.economycore.ce.length; i++) {
            let ceSet = economyCore.economycore.ce[i];
            let cePath = `${missionPath}/${ceSet.folder}`;

            for (let j = 0; j < ceSet.file.length; j++) {
                let ceFile = ceSet.file[j];
                let type = ceFile.type.toLowerCase();
                let file;

                if ([ 'types', 'spawnabletypes', 'events' ].indexOf(type) >= 0) {
                    await new File({
                        type,
                        name: ceFile.name,
                        path: `${cePath}/${ceFile.name}`
                    }).save().then(fileitm => file = fileitm);

                    sets.files.add(file);

                    if (file.attributes.type === 'types') {
                        await this.loadTypesFile(file);
                    }
                }
            }
        }
    },
    async loadTypesFile(typeFile) {
        const typeFileXML = fs.readFileSync(typeFile.attributes.path);
        const typeFileJson = xmlParser.toJson(typeFileXML, {
            object: true,
            arrayNotation: [
                'type',
                'category',
                'tag',
                'usage',
            ],
        });

        if (typeof typeFileJson.types.type === 'object') {
            for (let i = 0; i < typeFileJson.types.type.length; i++) {
                let type = typeFileJson.types.type[i];
                let item;

                await sets.items.where('name', '=', type.name).fetch().then(loaded => item = loaded);

                if (typeof item.attributes === 'undefined') {
                    item = new Item({ name: type.name });
                }

                await item.save().catch(err => console.log(err));

                await item.files().attach(typeFile);

                for (let key in type) {
                    key = key.toLowerCase();

                    if (key === 'name') {
                        continue;
                    } else if (key === 'flags') {
                        item.set({
                            count_in_cargo: type.flags.count_in_cargo ? parseInt(type.flags.count_in_cargo) : null,
                            count_in_hoarder: type.flags.count_in_hoarder ? parseInt(type.flags.count_in_hoarder) : null,
                            count_in_map: type.flags.count_in_map ? parseInt(type.flags.count_in_map) : null,
                            count_in_player: type.flags.count_in_player ? parseInt(type.flags.count_in_player) : null,
                            crafted: type.flags.crafted ? parseInt(type.flags.crafted) : null,
                            deloot: type.flags.deloot ? parseInt(type.flags.deloot) : null,
                        });
                    } else if (typeof type[key] === 'object') {
                        if (key === 'category' && type.category.length) {
                            for (let j = 0; j < type.category.length; j++) {
                                let cat = type.category[j];
                                
                                item.categories().attach(sets.meta.categories[cat.name]);
                            };
                        }

                        if (key === 'tag' && type.tag.length) {
                            for (let j = 0; j < type.tag.length; j++) {
                                let tag = type.tag[j];
                                
                                item.tags().attach(sets.meta.tags[tag.name]);
                            };
                        }

                        if (key === 'usage' && type.usage.length) {
                            for (let j = 0; j < type.usage.length; j++) {
                                let usage = type.usage[j];
                                
                                item.usages().attach(sets.meta.usages[usage.name]);
                            };
                        }

                        if (key === 'value' && type.value.length) {
                            for (let j = 0; j < type.value.length; j++) {
                                let value = type.value[j];
                                
                                item.values().attach(sets.meta.values[value.name]);
                            };
                        }
                    } else {
                        item.set(key, parseInt(type[key]));
                    }
                }

                await item.save().catch(err => console.log(err));
            }
        }
    },
    loadSpawnFile(spawnFile) {},
    loadTypes() {
        const loadedTypes = {};
        const duplicateTypes = [];
        const typeUsages = {};
        const typeTags = {};
        const typeCategories = {};

        const typeSkel = {
            settings: {
                nominal: null,
                lifetime: null,
                restock: null,
                min: null,
                quantmin: null,
                quantmax: null,
                cost: null,
                flags: {
                    count_in_cargo: null,
                    count_in_hoarder: null,
                    count_in_map: null,
                    count_in_player: null,
                    crafted: null,
                    deloot: null,
                },
                category: [],
                tag: [],
                usage: [],
            },
            file: [],
        };

        missionCE.types.forEach(typesFile => {
            const typeFileXML = fs.readFileSync(typesFile);
            const typeFile = xmlParser.toJson(typeFileXML, {
                object: true,
                arrayNotation: [
                    'type',
                    'category',
                    'tag',
                    'usage',
                ],
            });

            if (typeof typeFile.types.type === 'object') {
                typeFile.types.type.forEach(type => {
                    if (typeof loadedTypes[type.name] === 'undefined') {
                        loadedTypes[type.name] = merge({}, typeSkel);
                    } else {
                        duplicateTypes.push(type.name);
                    }

                    loadedTypes[type.name].file.push(typesFile);

                    for (let key in type) {
                        key = key.toLowerCase();

                        if (key === 'name') {
                            continue;
                        } else if (key === 'flags') {
                            loadedTypes[type.name].settings.flags = {
                                count_in_cargo: type.flags.count_in_cargo ? parseInt(type.flags.count_in_cargo) : null,
                                count_in_hoarder: type.flags.count_in_hoarder ? parseInt(type.flags.count_in_hoarder) : null,
                                count_in_map: type.flags.count_in_map ? parseInt(type.flags.count_in_map) : null,
                                count_in_player: type.flags.count_in_player ? parseInt(type.flags.count_in_player) : null,
                                crafted: type.flags.crafted ? parseInt(type.flags.crafted) : null,
                                deloot: type.flags.deloot ? parseInt(type.flags.deloot) : null,
                            };
                        } else if (typeof type[key] === 'object') {
                            if (key === 'category' && type.category.length) {
                                type.category.forEach(cat => {
                                    const catName = cat.name.toLowerCase();

                                    loadedTypes[type.name].settings.category.push(catName);

                                    if (typeof typeCategories[catName] === 'undefined') {
                                        typeCategories[catName] = [];
                                    }

                                    typeCategories[catName].push(type.name);
                                });
                            }

                            if (key === 'tag' && type.tag.length) {
                                type.tag.forEach(tag => {
                                    const tagName = tag.name.toLowerCase();

                                    loadedTypes[type.name].settings.tag.push(tagName);

                                    if (typeof typeTags[tagName] === 'undefined') {
                                        typeTags[tagName] = [];
                                    }

                                    typeTags[tagName].push(type.name);
                                });
                            }

                            if (key === 'usage' && type.usage.length) {
                                type.usage.forEach(usage => {
                                    const usageName = usage.name.toLowerCase();

                                    loadedTypes[type.name].settings.usage.push(usageName);

                                    if (typeof typeUsages[usageName] === 'undefined') {
                                        typeUsages[usageName] = [];
                                    }

                                    typeUsages[usageName].push(type.name);
                                });
                            }
                        } else {
                            loadedTypes[type.name].settings[key] = parseInt(type[key]);
                        }
                    }
                });
            }
        });

        fs.writeFileSync(`store/types.json`, JSON.stringify(loadedTypes, null, 4));
    },
    loadSpawnable() {
        const loadedSpawns = {};
        const duplicateSpawns = [];
        const spawnSkel = {
            damage: {
                min: null,
                max: null,
            },
            hoarder: false,
            attachments: [],
            cargo: [],
            file: [],
        };

        missionCE.spawnabletypes.forEach(spawnFileName => {
            const spawnFileXML = fs.readFileSync(spawnFileName);
            const spawnFile = xmlParser.toJson(spawnFileXML, {
                object: true,
                arrayNotation: [
                    'type',
                    'attachments',
                    'item',
                ],
            });
            const hasDamage = typeof spawnFile.spawnabletypes.damage !== 'undefined';
            const hasMin = hasDamage && typeof spawnFile.spawnabletypes.damage.min !== 'undefined';
            const hasMax = hasDamage && typeof spawnFile.spawnabletypes.damage.max !== 'undefined';
            const damage = {
                min: hasMin ? parseFloat(spawnFile.spawnabletypes.damage.min) : null,
                max: hasMax ? parseFloat(spawnFile.spawnabletypes.damage.max) : null,
            };

            // TODO: Account for hoarder
            // TODO: Account for cargo
            // TODO: Account for attachment/cargo preset

            // Loop through the spawnable types
            spawnFile.spawnabletypes.type.forEach(spawn => {
                if (typeof loadedSpawns[spawn.name] === 'undefined') {
                    loadedSpawns[spawn.name] = merge({}, spawnSkel);
                } else {
                    duplicateSpawns.push(spawn.name);
                }

                loadedSpawns[spawn.name].file.push(spawnFileName);
                loadedSpawns[spawn.name].damage = merge({}, damage);

                if (typeof spawn.hoarder !== 'undefined') {
                    loadedSpawns[spawn.name].hoarder = true;
                }

                // Loop through type attachments
                if (typeof spawn.attachments === 'object' && spawn.attachments.length) {
                    spawn.attachments.forEach(attachment => {
                        if (typeof attachment.preset === 'undefined') {
                            let attachObj = {
                                chance: typeof attachment.chance !== 'undefined' ? parseFloat(attachment.chance) : null,
                                items: {},
                            };

                            attachment.item.forEach(item => {
                                attachObj.items[item.name] = typeof item.chance !== 'undefined' ? parseFloat(item.chance) : null;
                            });

                            loadedSpawns[spawn.name].attachments.push(attachObj);
                        } else {
                            loadedSpawns[spawn.name].attachments = attachment.preset;
                        }
                    });
                }

                // Loop through type cargo
                if (typeof spawn.cargo === 'object' && spawn.cargo.length) {
                    spawn.cargo.forEach(cargoItem => {
                        if (typeof cargoItem.preset === 'undefined') {
                            let cargoObj = {
                                chance: typeof cargoItem.chance !== 'undefined' ? parseFloat(cargoItem.chance) : null,
                                items: {},
                            };

                            cargoItem.item.forEach(item => {
                                cargoObj.items[item.name] = typeof item.chance !== 'undefined' ? parseFloat(item.chance) : null;
                            });

                            loadedSpawns[spawn.name].cargo.push(cargoObj);
                        } else {
                            loadedSpawns[spawn.name].cargo.push(cargoItem.preset);
                        }
                    });
                }
            });
        });

        fs.writeFileSync(`store/spawnabletypes.json`, JSON.stringify(loadedSpawns, null, 4));
    },
    loadEvents() {},
};