# universal-logger [![build status](https://travis-ci.org/cheton/universal-logger.svg?branch=master)](https://travis-ci.org/cheton/universal-logger) [![Coverage Status](https://coveralls.io/repos/github/cheton/universal-logger/badge.svg?branch=master)](https://coveralls.io/github/cheton/universal-logger?branch=master)

[![NPM](https://nodei.co/npm/universal-logger.png?downloads=true&stars=true)](https://www.npmjs.com/package/universal-logger)

**A universal logging library for Node and the browser**
 
![image](https://cloud.githubusercontent.com/assets/447801/25858430/4d0651de-350e-11e7-9071-0ad8b2b8fece.png)

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

log.setLevel(TRACE);
log.enableStackTrace();

log.log(INFO, 'The logger has initialized');
log.trace(emoji.get('mostly_sunny'));
log.debug(emoji.get('sun_small_cloud'));
log.info(emoji.get('barely_sunny'));
log.warn(emoji.get('rain_cloud'));
log.error(emoji.get('lightning_cloud'));
```

![image](https://cloud.githubusercontent.com/assets/447801/25858187/b7290152-350d-11e7-83bb-41fa6151fa6d.png)

### Log Level
```js
log.getLevel();
log.setLevel(TRACE);
log.setLevel(OFF); // Turn off logging
```

### Custom Log Level
```js
import logger, { defineLogLevel } from 'universal-logger';

const SILLY = defineLogLevel('silly', 0);
const VERBOSE = defineLogLevel('verbose', 1);
const INFO = defineLogLevel('info', 2);
const WARN = defineLogLevel('warn', 3);
const ERROR = defineLogLevel('error', 4);
const FATAL = defineLogLevel('fatal', 5);

const log = logger();
log.setLevel(SILLY);
log.log(SILLY, 'Custom Log Level');
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

### Namespace
![image](https://cloud.githubusercontent.com/assets/447801/25858521/84e4ae20-350e-11e7-8eb0-ab3d4d2cf3d0.png)

```js
const cLog = logger(emoji.get('rainbow')); // Returns a logger instance with the given namespace

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

### Styled Logging

https://github.com/cheton/universal-logger-browser

![image](https://cloud.githubusercontent.com/assets/447801/25896230/e2a7f36c-35b5-11e7-8f93-5c05caff6030.png)

```js
import emoji from 'node-emoji';
import logger, { TRACE } from 'universal-logger';
import { styleable } from 'universal-logger-browser';

const log = logger();

log.chainedHandlers = [
    styleable({ showTimestamp: true })
];

log.setLevel(TRACE);
log.enableStackTrace();

log.log(INFO, 'The logger has initialized');
log.trace(emoji.get('mostly_sunny'));
log.debug(emoji.get('sun_small_cloud'));
log.info(emoji.get('barely_sunny'));
log.warn(emoji.get('rain_cloud'));
log.error(emoji.get('lightning_cloud'));
```

## Plugins

* [universal-logger-browser](https://github.com/cheton/universal-logger-browser) - Browser plugins for universal logger.

## License

MIT
