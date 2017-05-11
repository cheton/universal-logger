/* eslint no-console: 0 */
import emoji from 'node-emoji';
import { minimal, styleable } from 'universal-logger-browser';
import logger, { TRACE, INFO, OFF } from '../src';

const log = logger()
    .use(minimal())
    .on('log', (context, messages) => {
        // Custom log processing
    });

log.enableStackTrace();
log.setLevel(TRACE);

log.log(INFO, 'The logger has initialized');
log.trace(emoji.get('mostly_sunny'));
log.debug(emoji.get('sun_small_cloud'));
log.info(emoji.get('barely_sunny'));
log.warn(emoji.get('rain_cloud'));
log.error(emoji.get('lightning_cloud'));

log.setLevel(OFF); // Turn off logging
log.error(emoji.get('scream'));

const contextLog = logger(emoji.get('rainbow'))
    .use(minimal({
        useNativeConsoleMethods: false
    }))
    .use(styleable({
        showTimestamp: true
    }))
    .on('log', (context, messages) => {
        // Custom log processing
    });

contextLog.setLevel(INFO);
contextLog.enableStackTrace();
contextLog.trace(emoji.get('mostly_sunny'));
contextLog.debug(emoji.get('sun_small_cloud'));
contextLog.info(emoji.get('barely_sunny'));
contextLog.warn(emoji.get('rain_cloud'));
contextLog.error(emoji.get('lightning_cloud'));
