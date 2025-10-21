import { ApiProperty } from '@nestjs/swagger';

export class AnalysisHistoryItemDto {
  @ApiProperty({
    description: 'Unique identifier of the analysis',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'File name of the analysis',
    example: 'log_2024-01-15.csv',
  })
  fileName: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Analysis status',
    enum: ['Processing', 'Success', 'Failed'],
    example: 'Success',
  })
  status: string;

  @ApiProperty({
    description: 'Whether the analysis contains FAP regeneration',
    example: true,
  })
  fapRegen: boolean;
}
