import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AnalysisStatusEnum } from './enums';

@Entity({ name: 'fap_analysis' })
@Index(['user', 'sha256'], { unique: true })
export class FapAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, name: 'file_name', nullable: false })
  fileName: string;

  @Column({ type: 'char', length: 64, nullable: false })
  sha256: string;

  @Column({
    type: 'enum',
    enum: AnalysisStatusEnum,
    default: AnalysisStatusEnum.PROCESSING,
    nullable: false,
  })
  status: AnalysisStatusEnum;

  @Column({ type: 'varchar', length: 255, name: 'message', nullable: false })
  message: string;

  @Column({
    type: 'timestamp with time zone',
    name: 'log_date',
    nullable: true,
  })
  logDate: Date | null;

  @Column({
    type: 'boolean',
    name: 'fap_regen',
    default: false,
    nullable: false,
  })
  fapRegen: boolean;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  distance: number | null;

  @Column({ type: 'jsonb', name: 'analysis', nullable: true })
  analysis: Record<string, any> | null;

  @Column({ type: 'varchar', length: 255, name: 'version', nullable: true })
  version: string | null;

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

  @ManyToOne(() => User, (user) => user.analyses, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
