/* eslint no-console: 0 */
import emoji from 'node-emoji';
import logger, { TRACE, DEBUG, INFO, OFF } from '../src';

const log = logger();
log.on('log', (context, messages) => { /* Custom log processing */ });

log.disableStackTrace();
log.setLevel(TRACE);
log.trace(emoji.get('mostly_sunny'));
log.debug(emoji.get('sun_small_cloud'));
log.info(emoji.get('barely_sunny'));
log.warn(emoji.get('rain_cloud'));
log.error(emoji.get('lightning_cloud'));

log.enableStackTrace();
log.setLevel(DEBUG);
log.trace(emoji.get('mostly_sunny'));
log.debug(emoji.get('sun_small_cloud'));
log.info(emoji.get('barely_sunny'));
log.warn(emoji.get('rain_cloud'));
log.error(emoji.get('lightning_cloud'));

log.setLevel(OFF);
log.error(emoji.get('scream'));

const contextLog = logger(emoji.get('rainbow'));
contextLog.enableStackTrace();
contextLog.setLevel(INFO);
contextLog.info(emoji.get('barely_sunny'));
contextLog.warn(emoji.get('rain_cloud'));

contextLog.on('log', (context, messages) => {
    // Custom log processing
    console.log('Custom log processing:', context, messages);
});
contextLog.on('trace', (context, messages) => {});
contextLog.on('debug', (context, messages) => {});
contextLog.on('info', (context, messages) => {});
contextLog.on('warn', (context, messages) => {});
contextLog.on('error', (context, messages) => {});
