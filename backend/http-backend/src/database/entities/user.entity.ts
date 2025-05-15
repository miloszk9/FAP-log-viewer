import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { FapAnalysis } from './fap-analysis.entity';
import { FapAverage } from './fap-average.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => FapAnalysis, (analysis) => analysis.user)
  analyses: FapAnalysis[];

  @OneToOne(() => FapAverage, (average) => average.user, { cascade: true })
  average: FapAverage;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
