'use strict';

const userConfig = require('../config.json');

module.exports = {
    ...userConfig,
    profilePath: `${userConfig.server}/${userConfig.profile}`,
    missionPath: `${userConfig.server}/${userConfig.mission}`,
};