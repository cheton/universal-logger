import LogLevel from './LogLevel';

// Predefined logging levels.
export const TRACE = new LogLevel({ name: 'trace', value: 0 });
export const DEBUG = new LogLevel({ name: 'debug', value: 1 });
export const INFO = new LogLevel({ name: 'info', value: 2 });
export const WARN = new LogLevel({ name: 'warn', value: 3 });
export const ERROR = new LogLevel({ name: 'error', value: 4 });
export const OFF = new LogLevel({ name: 'off', value: 9999 });
