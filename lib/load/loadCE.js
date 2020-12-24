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

        await new File({
            type: 'types',
            name: 'types.xml',
            path: `${missionPath}/db/types.xml`
        }).save().then((file) => {
            sets.files.add(file);
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

                if ([ 'types', 'spawnabletypes', 'events' ].indexOf(type) >= 0) {
                    await new File({
                        type,
                        name: ceFile.name,
                        path: `${cePath}/${ceFile.name}`
                    }).save().then(fileitm => sets.files.add(fileitm));
                }
            }
        }
    },
    async loadTypesFiles() {
        await sets.files.where('type', 'types').fetch().then(file => {
            this.loadTypesFile(file);
        });
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
                for (j = 0; j < cargoData.item.length; j++) {
                    let itemData = cargoData.item[j];
                    let item;

                    await sets.items.where('name', '=', itemData.name).fetch().then(loaded => item = loaded);

                    cargo.items().attach(item);
                }
            }

            cargo.save();

            sets.meta.cargo.add(cargo);
        }
    },
    async loadAttachments(attachmentsSet) {
        for (let i = 0; i < attachmentsSet.length; i++) {
            let attachmentData = attachmentsSet[i];

            await new Attachment({
                name: attachmentData.name,
                chance: typeof attachmentData.chance !== 'undefined' ? parseFloat(attachmentData.chance) : null,
            }).save().then(attachment => sets.meta.attachments.add(attachment));
        }
    },
    async loadSpawnFile(spawnFile) {
        const spawnFileXML = fs.readFileSync(spawnFile.attributes.path);
        const spawnFileJson = xmlParser.toJson(spawnFileXML, {
            object: true,
            arrayNotation: [
                'type',
                'attachments',
                'tag',
                'item',
            ],
        });

        const hasDamage = typeof spawnFileJson.spawnabletypes.damage !== 'undefined';
        const hasMin = hasDamage && typeof spawnFileJson.spawnabletypes.damage.min !== 'undefined';
        const hasMax = hasDamage && typeof spawnFileJson.spawnabletypes.damage.max !== 'undefined';
        const damage = {
            min: hasMin ? parseFloat(spawnFileJson.spawnabletypes.damage.min) : null,
            max: hasMax ? parseFloat(spawnFileJson.spawnabletypes.damage.max) : null,
        };

        // Loop through the spawnable types
        for (let i = 0; i < spawnFile.spawnabletypes.type.length; i++) {
            let spawnData = spawnFile.spawnabletypes.type[i];
            let spawn;

            await sets.spawns.where('name', '=', spawnData.name).fetch().then(loaded => spawn = loaded);

            if (typeof spawn.attributes === 'undefined') {
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
                    let tag;

                    await sets.meta.tags.where('name', '=', tagData.name).fetch().then(loaded => tag = loaded);

                    await spawn.tags().attach(tag);
                }
            }

            // Loop through type attachments
            if (typeof spawnData.attachments === 'object' && spawnData.attachments.length) {
                for (let j = 0; j < spawnData.attachments.length; j++) {
                    if (typeof attachment.preset === 'undefined') {
                        let attachObj = {
                            chance: typeof attachment.chance !== 'undefined' ? parseFloat(attachment.chance) : null,
                            items: {},
                        };

                        attachment.item.forEach(item => {
                            attachObj.items[item.name] = typeof item.chance !== 'undefined' ? parseFloat(item.chance) : null;
                        });

                        loadedSpawns[spawnData.name].attachments.push(attachObj);
                    } else {
                        loadedSpawns[spawnData.name].attachments = attachment.preset;
                    }
                };
            }

            // Loop through type cargo. This is trickier; some will be pre-existing
            // cargo, some will be defined ad hoc.
            if (typeof spawnData.cargo === 'object' && spawnData.cargo.length) {
                spawnData.cargo.forEach(cargoItem => {
                    if (typeof cargoItem.preset === 'undefined') {
                        let cargoObj = {
                            chance: typeof cargoItem.chance !== 'undefined' ? parseFloat(cargoItem.chance) : null,
                            items: {},
                        };

                        cargoItem.item.forEach(item => {
                            cargoObj.items[item.name] = typeof item.chance !== 'undefined' ? parseFloat(item.chance) : null;
                        });

                        loadedSpawns[spawnData.name].cargo.push(cargoObj);
                    } else {
                        loadedSpawns[spawnData.name].cargo.push(cargoItem.preset);
                    }
                });
            }
        }
    },
    loadEvents() {},
};