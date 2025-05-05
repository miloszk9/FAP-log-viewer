import { DataSource } from 'typeorm';
import { FapAnalysis } from '../entities/fap-analysis.entity';
import { User } from '../entities/user.entity';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'fap_analysis',
  entities: [FapAnalysis, User],
  migrations: ['src/database/migrations/sql/*.ts'],
  migrationsTableName: 'migrations',
});
