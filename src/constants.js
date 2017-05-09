import LogLevel from './LogLevel';

// Predefined logging levels.
export const TRACE = new LogLevel('trace', 0);
export const DEBUG = new LogLevel('debug', 1);
export const INFO = new LogLevel('info', 2);
export const WARN = new LogLevel('warn', 3);
export const ERROR = new LogLevel('error', 4);
export const OFF = new LogLevel('off', 9999);
