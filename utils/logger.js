const log4js = require('log4js');
const moment = require('moment');

// init log4js midleware
log4js.configure({
    appenders: { cheese: { type: 'file', filename: 'logs/' + moment().format('YYYYMMDD') + '.log' } },
    categories: { default: { appenders: ['cheese'], level: 'error' } }
});

const logger = log4js.getLogger();

logger.level = 'debug';

module.exports = logger;