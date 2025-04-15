import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class FapAnalysis {
  @PrimaryColumn()
  id: string;

  @Column()
  stage: string;

  @Column()
  status: string;

  @Column()
  message: string;

  @Column()
  sha256: string;

  @Column('jsonb')
  analysis: Record<string, any>;
}
