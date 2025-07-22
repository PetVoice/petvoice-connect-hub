// Logger utility per produzione
export const logger = {
  debug: (message: string, ...args: any[]) => {
    // Solo in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    
    // In produzione, invia solo errori critici a un servizio di monitoring
    if (process.env.NODE_ENV === 'production') {
      // Qui potresti integrare Sentry, LogRocket, etc.
      // sendToMonitoring(message, error);
    }
  }
};

export default logger;