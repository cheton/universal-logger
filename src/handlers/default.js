/* eslint no-console: 0 */
const defaultFormatter = (context, messages) => {
    const { level, namespace } = { ...context };
    const formatters = [];

    if (level && level.name) {
        formatters.push(level.name.toUpperCase());
    }

    if (namespace) {
        formatters.push(namespace);
    }

    messages = [
        formatters.join(' '),
        ...messages
    ];

    return messages;
};

const consoleMethod = {
    trace: console.log,
    debug: console.debug || console.log,
    info: console.info || console.log,
    warn: console.warn || console.log,
    error: console.error || console.log
};

const noop = () => {};

module.exports = (options) => {
    let { showSource = true, formatter = defaultFormatter } = { ...options };
    if (typeof formatter !== 'function') {
        formatter = (context, messages) => messages;
    }

    return (context, messages, next) => {
        if (typeof next !== 'function') {
            next = noop;
        }
        messages = formatter(context, messages);

        if (showSource && context.stackframes.length > 0) {
            const stackframeIndex = Math.min(4, context.stackframes.length - 1);
            const source = context.stackframes[stackframeIndex].source || '';
            messages = messages.concat(source);
        }

        const log = consoleMethod[context.level.name] || console.log;
        Function.prototype.apply.call(log, console, messages);
        next();
    };
};
