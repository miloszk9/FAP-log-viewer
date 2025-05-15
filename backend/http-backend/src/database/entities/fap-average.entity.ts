import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class FapAverage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.average, { cascade: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  status: string;

  @Column()
  message: string;

  @Column()
  sha256: string;

  @Column('jsonb')
  average: Record<string, any>;
}
