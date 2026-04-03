const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

export { logger };
export const securityLog = (event, details = {}) => {
  console.warn(`[SECURITY] ${event}`, JSON.stringify(details));
};
