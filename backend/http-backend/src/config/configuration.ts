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
});
