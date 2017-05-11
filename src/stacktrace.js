// https://github.com/stacktracejs/stacktrace.js/blob/master/stacktrace.js
import ErrorStackParser from 'error-stack-parser';
import StackGenerator from 'stack-generator';

const generateError = function stacktrace$$generateError() {
    try {
        // Error must be thrown to get stack in IE
        throw new Error();
    } catch (err) {
        return err;
    }
};

const isShapedLikeParsableError = function stacktrace$$isShapedLikeParsableError(err) {
    return err.stack || err['opera#sourceloc'];
};

module.exports = {
    get: function stacktrace$$get(options) {
        const err = generateError();
        const stackframes = isShapedLikeParsableError(err)
            ? ErrorStackParser.parse(err)
            : StackGenerator.backtrace(options);
        return stackframes;
    }
};
