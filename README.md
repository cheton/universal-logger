# universal-logger [![build status](https://travis-ci.org/cheton/universal-logger.svg?branch=master)](https://travis-ci.org/cheton/universal-logger) [![Coverage Status](https://coveralls.io/repos/github/cheton/universal-logger/badge.svg?branch=master)](https://coveralls.io/github/cheton/universal-logger?branch=master)

[![NPM](https://nodei.co/npm/universal-logger.png?downloads=true&stars=true)](https://www.npmjs.com/package/universal-logger)

**A universal logging library for Node and the browser**
 
![image](https://cloud.githubusercontent.com/assets/447801/25939476/96bd5568-3665-11e7-9b6f-b96fe0dc73d8.png)

## Installation

```sh
npm install --save universal-logger
```

### Browser

Use [universal-logger-browser](https://github.com/cheton/universal-logger-browser/) to display logs in the browser console.
```sh
npm install --save universal-logger-browser
```

## Usage

```js
import emoji from 'node-emoji';
import logger, { TRACE, DEBUG, INFO, WARN, ERROR, OFF } from 'universal-logger';
import { minimal } from 'universal-logger-browser';

const log = logger() // Returns the global logger instance
    .use(minimal())
    .on('log', (context, messages) => {
        // Custom log processing
    });

log.disableStackTrace();
log.setLevel(TRACE);

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
import { minimal } from 'universal-logger-browser';

const SILLY = defineLogLevel('silly', 0);
const VERBOSE = defineLogLevel('verbose', 1);
const INFO = defineLogLevel('info', 2);
const WARN = defineLogLevel('warn', 3);
const ERROR = defineLogLevel('error', 4);
const FATAL = defineLogLevel('fatal', 5);

const log = logger()
    .use(minimal());

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
```

### Namespace

![image](https://cloud.githubusercontent.com/assets/447801/25858521/84e4ae20-350e-11e7-8eb0-ab3d4d2cf3d0.png)

```js
import emoji from 'node-emoji';
import logger, { DEBUG } from 'universal-logger';
import { minimal } from 'universal-logger-browser';

const namespace = emoji.get('rainbow');
const contextLog = logger(namespace) // Returns a logger instance with the given namespace
    .use(minimal())
    .on('log', (context, messages) => {
        console.log('Custom log processing:', context, messages);
    });

contextLog.enableStackTrace();
contextLog.setLevel(DEBUG);

contextLog.trace(emoji.get('mostly_sunny'));
contextLog.debug(emoji.get('sun_small_cloud'));
contextLog.info(emoji.get('barely_sunny'));
contextLog.warn(emoji.get('rain_cloud'));
contextLog.error(emoji.get('lightning_cloud'));
```

## Browser Logging

https://github.com/cheton/universal-logger-browser

### Minimal

![image](https://cloud.githubusercontent.com/assets/447801/25939366/34f461fa-3665-11e7-9d03-0042fda4c32e.png)

```js
import logger, { TRACE } from 'universal-logger';
import { minimal } from 'universal-logger-browser';

const log = logger()
    .use(minimal());

log.enableStackTrace();
log.setLevel(TRACE);

log.log(INFO, 'The logger has initialized');
log.trace(emoji.get('mostly_sunny'));
log.debug(emoji.get('sun_small_cloud'));
log.info(emoji.get('barely_sunny'));
log.warn(emoji.get('rain_cloud'));
log.error(emoji.get('lightning_cloud'));
```

### Styleable

![image](https://cloud.githubusercontent.com/assets/447801/25939476/96bd5568-3665-11e7-9b6f-b96fe0dc73d8.png)

```js
import logger, { TRACE } from 'universal-logger';
import { styleable } from 'universal-logger-browser';

const log = logger()
    .use(styleable({
        showTimestamp: true
    }));

log.enableStackTrace();
log.setLevel(TRACE);

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
