# universal-logger [![build status](https://travis-ci.org/cheton/universal-logger.svg?branch=master)](https://travis-ci.org/cheton/universal-logger) [![Coverage Status](https://coveralls.io/repos/github/cheton/universal-logger/badge.svg?branch=master)](https://coveralls.io/github/cheton/universal-logger?branch=master)

[![NPM](https://nodei.co/npm/universal-logger.png?downloads=true&stars=true)](https://www.npmjs.com/package/universal-logger)

## Installation

```bash
npm install --save universal-logger
```

## Usage

```js
import emoji from 'node-emoji';
import logger, {
    defineLogLevel,
    TRACE, DEBUG, INFO, WARN, ERROR, OFF
} from 'universal-logger';

const log = logger(); // Returns the global logger instance

log.log(INFO, 'The universal logger has initialized');
log.trace(emoji.get('mostly_sunny'));
log.debug(emoji.get('sun_small_cloud'));
log.info(emoji.get('barely_sunny'));
log.warn(emoji.get('rain_cloud'));
log.error(emoji.get('lightning_cloud'));
```

### Log Level
```js
log.getLevel();
log.setLevel(TRACE);
log.setLevel(OFF); // Turn off logging
```

### Enable/Disable Stack Trace
```js
log.enableStackTrace();
log.disableStackTrace();
```

### Custom Log Processing
```js
log.on('log', (context, messages) => {
    // Custom log processing
});
log.on('trace', (context, messages) => {});
log.on('debug', (context, messages) => {});
log.on('info', (context, messages) => {});
log.on('warn', (context, messages) => {});
log.on('error', (context, messages) => {});
```

### Contextual Logging
```js
const cLog = logger(emoji.get('rainbow'));

cLog.enableStackTrace();
cLog.setLevel(INFO);
cLog.info(emoji.get('barely_sunny'));
cLog.warn(emoji.get('rain_cloud'));

cLog.on('log', (context, messages) => {
    // Custom log processing
    console.log('Custom log processing:', context, messages);
});
cLog.on('trace', (context, messages) => {});
cLog.on('debug', (context, messages) => {});
cLog.on('info', (context, messages) => {});
cLog.on('warn', (context, messages) => {});
cLog.on('error', (context, messages) => {});
```

## License

MIT
