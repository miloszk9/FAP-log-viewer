export default () => ({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'fap_analysis',
  },
  app: {
    port: parseInt(process.env.PORT || '3000'),
    environment: process.env.NODE_ENV || 'development',
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },
  nats: {
    url: process.env.NATS_URL || 'nats://localhost:4222',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  email: {
    url: process.env.EMAIL_URL || 'localhost',
    port: process.env.EMAIL_PORT || '8000',
    endpoint: process.env.EMAIL_ENDPOINT || 'process',
  },
  dataAnalyser: {
    version: process.env.DATA_ANALYSER_VERSION || '',
  },
});
