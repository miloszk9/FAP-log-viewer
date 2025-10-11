import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { FapAverageStatusEnum } from './enums';

@Entity({ name: 'fap_average' })
export class FapAverage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: FapAverageStatusEnum,
    default: FapAverageStatusEnum.CALCULATING,
    nullable: false,
  })
  status: FapAverageStatusEnum;

  @Column({ type: 'jsonb', nullable: true })
  average: Record<string, any> | null;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'char', length: 64, nullable: true })
  sha256: string | null;

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

  @OneToOne(() => User, (user) => user.average, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
