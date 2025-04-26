import { DataSource } from 'typeorm';
import { FapAnalysis } from '../entities/fap-analysis.entity';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'fap_analysis',
  entities: [FapAnalysis],
  migrations: ['src/database/migrations/sql/*.ts'],
  migrationsTableName: 'migrations',
});
