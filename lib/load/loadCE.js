'use strict';

const fs = require('fs');
const merge = require('deepmerge');
const xmlParser = require('xml2json');
const db = require('../db');

const File = require('../models/File');
const Item = require('../models/Item');
const Spawnable = require('../models/Spawnable');
const Cargo = require('../models/Cargo');
const Attachment = require('../models/Attachment');

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
        const opers = [];

        opers.push(new File({
            type: 'types',
            name: 'types.xml',
            path: `${missionPath}/db/types.xml`
        }).save().then((file) => {
            sets.files.types[`${missionPath}/db/types.xml`] = file;
        }));
        
        opers.push(new File({
            type: 'spawnabletypes',
            name: 'cfgspawnabletypes.xml',
            path: `${missionPath}/cfgspawnabletypes.xml`
        }).save().then((file) => {
            sets.files.spawnabletypes[`${missionPath}/cfgspawnabletypes.xml`] = file;
        }));
        
        opers.push(new File({
            type: 'events',
            name: 'events.xml',
            path: `${missionPath}/db/events.xml`
        }).save().then((file) => {
            sets.files.events[`${missionPath}/db/events.xml`] = file;
        }));

        for (let i = 0; i < economyCore.economycore.ce.length; i++) {
            let ceSet = economyCore.economycore.ce[i];
            let cePath = `${missionPath}/${ceSet.folder}`;

            for (let j = 0; j < ceSet.file.length; j++) {
                let ceFile = ceSet.file[j];
                let type = ceFile.type.toLowerCase();

                if ([ 'types', 'spawnabletypes', 'events' ].indexOf(type) >= 0) {
                    opers.push(new File({
                        type,
                        name: ceFile.name,
                        path: `${cePath}/${ceFile.name}`
                    }).save().then(fileitm => {
                        sets.files[type][`${cePath}/${ceFile.name}`] = fileitm;
                    }));
                }
            }
        }

        return Promise.all(opers);
    },
    async loadTypesFiles() {
        for (let key in sets.files.types) {
            let file = sets.files.types[key];

            await this.loadTypesFile(file);
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
                let item = sets.items[type.name];

                if (typeof item === 'undefined') {
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
                                
                                await item.categories().attach(sets.meta.categories[cat.name]);
                            };
                        }

                        if (key === 'tag' && type.tag.length) {
                            for (let j = 0; j < type.tag.length; j++) {
                                let tag = type.tag[j];
                                
                                await item.tags().attach(sets.meta.tags[tag.name]);
                            };
                        }

                        if (key === 'usage' && type.usage.length) {
                            for (let j = 0; j < type.usage.length; j++) {
                                let usage = type.usage[j];
                                
                                await item.usages().attach(sets.meta.usages[usage.name]);
                            };
                        }

                        if (key === 'value' && type.value.length) {
                            for (let j = 0; j < type.value.length; j++) {
                                let value = type.value[j];
                                
                                await item.values().attach(sets.meta.values[value.name]);
                            };
                        }
                    } else {
                        item.set(key, parseInt(type[key]));
                    }
                }

                await item.save().catch(err => console.log(err));

                sets.items[type.name] = item;
            }
        }
    },
    async loadPresets() {
        const presetsXML = fs.readFileSync(`${config.missionPath}/cfgrandompresets.xml`);
        const presets = xmlParser.toJson(presetsXML, {
            object: true,
            arrayNotation: [
                'cargo',
                'attachment',
                'item',
                'value',
            ],
        });

        await this.loadCargo(presets.randompresets.cargo);

        await this.loadAttachments(presets.randompresets.attachments);
    },
    async loadCargo(cargoSet) {
        for (let i = 0; i < cargoSet.length; i++) {
            let cargoData = cargoSet[i];
            let cargo;

            await new Cargo({
                name: cargoData.name,
                chance: typeof cargoData.chance !== 'undefined' ? parseFloat(cargoData.chance) : null,
            }).save().then(cargoObj => { cargo = cargoObj });

            if (typeof cargoData.item !== 'undefined' && cargoData.item.length) {
                for (let j = 0; j < cargoData.item.length; j++) {
                    cargo.items().attach(sets.items[cargoData.item[j].name]);
                }
            }

            cargo.save();

            sets.meta.cargo[cargoData.name] = cargo;
        }
    },
    async loadAttachments(attachmentsSet) {
        for (let i = 0; i < attachmentsSet.length; i++) {
            let attachmentData = attachmentsSet[i];

            await new Attachment({
                name: attachmentData.name,
                chance: typeof attachmentData.chance !== 'undefined' ? parseFloat(attachmentData.chance) : null,
            }).save().then(attachment => sets.meta.attachments[attachmentData.name] = attachment);
        }
    },
    async loadSpawnableFiles() {
        for (let key in sets.files.spawnabletypes) {
            let file = sets.files.spawnabletypes[key];

            await this.loadSpawnableFile(file);
        }
    },
    async loadSpawnableFile(spawnFile) {
        let spawnFileJson;
        const spawnFileXML = fs.readFileSync(spawnFile.attributes.path);
        
        try {
            spawnFileJson = xmlParser.toJson(spawnFileXML, {
                object: true,
                arrayNotation: [
                    'type',
                    'attachments',
                    'tag',
                    'item',
                ],
            });
        } catch(error) {
            console.log('Problem loading spawnable file ' + spawnFile.attributes.path);
            
            return;
        }

        const hasDamage = typeof spawnFileJson.spawnabletypes.damage !== 'undefined';
        const hasMin = hasDamage && typeof spawnFileJson.spawnabletypes.damage.min !== 'undefined';
        const hasMax = hasDamage && typeof spawnFileJson.spawnabletypes.damage.max !== 'undefined';
        const damage = {
            min: hasMin ? parseFloat(spawnFileJson.spawnabletypes.damage.min) : null,
            max: hasMax ? parseFloat(spawnFileJson.spawnabletypes.damage.max) : null,
        };

        // Loop through the spawnable types
        for (let i = 0; i < spawnFileJson.spawnabletypes.type.length; i++) {
            let spawnData = spawnFileJson.spawnabletypes.type[i];
            let spawn = sets.spawns[spawnData.name];

            if (typeof spawn === 'undefined') {
                spawn = new Spawnable({ name: spawnData.name });
            }

            await spawn.save().catch(err => console.log(err));

            await spawn.files().attach(spawnFile);

            spawn.set({
                damage_min: damage.min,
                damage_max: damage.max,
                hoarder: typeof spawnData.hoarder !== 'undefined' ? true : false,
            });

            // Loop through tags
            if (typeof spawnData.tag === 'object' && spawnData.tag.length) {
                for (let j = 0; j < spawnData.tag.length; j++) {
                    let tagData = spawnData.tag[j];
                    let tag = sets.meta.tags[tagData.name];

                    if (typeof tag !== 'undefined') {
                        await spawn.tags().attach(tag);
                    } else {
                        console.log(`Error attempting to add tag ${tagData.name} to spawnable ${spawnData.name}`);
                    }
                }
            }

            // Loop through type attachments
            if (typeof spawnData.attachments === 'object' && spawnData.attachments.length) {
                for (let j = 0; j < spawnData.attachments.length; j++) {
                    let attachmentData = spawnData.attachments[j];
                    let attachment;

                    if (typeof attachmentData.preset === 'undefined') {
                        let attachmentName = `${spawnData.name}_gen_${j}`;

                        // No attachment preset; we're creating a one-off attachment for this item
                        await new Attachment({
                            name: attachmentName,
                            chance: typeof attachmentData.chance !== 'undefined' ? parseFloat(attachmentData.chance) : null,
                        }).save().then(attachObj => attachment = attachObj);

                        for (let k = 0; k < attachmentData.item.length; k++) {
                            let attachItem = attachmentData.item[k];
                            let attachObj = sets.items[attachItem.name];

                            await attachment.items().attach(attachObj);
                        }

                        sets.meta.attachments[attachmentName] = attachment;
                    } else {
                        // Hopefully, should be, this attachment is pre-defined. Use it.
                        attachment = sets.meta.attachments[attachmentData.preset];
                    }

                    await spawn.attachments().attach(attachment);
                };
            }

            // Loop through type cargo. Pretty similar deal to attachments.
            if (typeof spawnData.cargo === 'object' && spawnData.cargo.length) {
                for (let j = 0; j < spawnData.cargo.length; j++) {
                    let cargoData = spawnData.cargo[j];
                    let cargo;

                    if (typeof cargoData.preset === 'undefined') {
                        let cargoName = `${spawnData.name}_gen_${j}`;

                        // No cargo preset; we're creating a one-off cargo for this item
                        await new Cargo({
                            name: cargoName,
                            chance: typeof cargoData.chance !== 'undefined' ? parseFloat(cargoData.chance) : null,
                        }).save().then(cargoObj => cargo = cargoObj);

                        for (let k = 0; k < cargoData.item.length; k++) {
                            let cargoItem = cargoData.item[k];
                            let cargoObj = sets.items[cargoItem.name];

                            await cargo.items().attach(cargoObj);
                        }

                        sets.meta.cargo[cargoName] = cargo;
                    } else {
                        // Hopefully, should be, this attachment is pre-defined. Use it.
                        cargo = sets.meta.cargo[cargoData.preset];
                    }

                    await spawn.cargo().attach(cargo);
                };
            }
        }
    },
    loadEvents() {},
};