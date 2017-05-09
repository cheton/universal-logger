import Logger from './Logger';
import LogLevel from './LogLevel';
import { TRACE, DEBUG, INFO, WARN, ERROR, OFF } from './constants';

const contextualLoggers = {};

const globalLogger = new Logger({
    level: DEBUG
});

globalLogger.on('setLevel', (level) => {
    // Apply filter level to all registered contextual loggers
    Object.keys(contextualLoggers).forEach(key => {
        const logger = contextualLoggers[key];
        logger.setLevel(level);
    });
});

module.exports = (name, options) => {
    name = String(name || '');

    if (!name) {
        return globalLogger;
    }

    if (!contextualLoggers[name]) {
        const {
            level = globalLogger.level
        } = { ...options };
        contextualLoggers[name] = new Logger(name, { level });
    }

    return contextualLoggers[name];
};

module.exports.TRACE = TRACE;
module.exports.DEBUG = DEBUG;
module.exports.INFO = INFO;
module.exports.WARN = WARN;
module.exports.ERROR = ERROR;
module.exports.OFF = OFF;

module.exports.defineLogLevel = (name, value) => {
    return new LogLevel(name, value);
};
