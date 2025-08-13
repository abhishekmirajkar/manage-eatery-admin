import log from 'loglevel';

// Configure log level based on environment
const getLogLevel = (): log.LogLevelDesc => {
  // Check for explicit environment variable first
  const envLogLevel = import.meta.env.VITE_LOG_LEVEL;
  if (envLogLevel) {
    return envLogLevel.toLowerCase() as log.LogLevelDesc;
  }
  
  // Default based on mode
  const mode = import.meta.env.MODE;
  switch (mode) {
    case 'development':
      return 'debug';
    case 'production':
      return 'error';
    default:
      return 'info';
  }
};

// Set the log level
log.setLevel(getLogLevel());

// Export configured logger
export const logger = log;
export default logger;