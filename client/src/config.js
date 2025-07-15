const config = {
  // API URL - use environment variable or default to localhost for development
  API_URL: process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001'),
  
  // Socket.IO URL - use environment variable or default to localhost for development
  SOCKET_URL: process.env.REACT_APP_SOCKET_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001'),
  
  // Get the full API URL
  getApiUrl: (endpoint = '') => {
    const baseUrl = config.API_URL;
    if (!baseUrl) {
      // In production, use relative URLs
      return `/api${endpoint}`;
    }
    return `${baseUrl}/api${endpoint}`;
  },
  
  // Get the Socket.IO URL
  getSocketUrl: () => {
    const socketUrl = config.SOCKET_URL;
    if (!socketUrl) {
      // In production, use the same domain
      return window.location.origin;
    }
    return socketUrl;
  }
};

export default config; 