import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FapAnalysis } from './fap-analysis.entity';
import { FapAverage } from './fap-average.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'password_hash',
    nullable: false,
  })
  passwordHash: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'refresh_token',
    nullable: true,
  })
  refreshToken: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
    default: () => 'NOW()',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
    default: () => 'NOW()',
    nullable: false,
  })
  updatedAt: Date;

  @OneToMany(() => FapAnalysis, (analysis) => analysis.user)
  analyses: FapAnalysis[];

  @OneToOne(() => FapAverage, (average) => average.user, { cascade: true })
  average: FapAverage;
}
