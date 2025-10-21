import { ApiProperty } from '@nestjs/swagger';

export class GetAnalysisResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the analysis',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Analysis status',
    enum: ['Processing', 'Success', 'Failed'],
    example: 'Success',
  })
  status: string;

  @ApiProperty({
    description: 'Status message or error description',
    example: 'Analysis completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Date of the log file',
    example: '2024-01-15T00:00:00.000Z',
    nullable: true,
  })
  logDate: Date | null;

  @ApiProperty({
    description: 'Whether the analysis contains FAP regeneration',
    example: true,
  })
  fapRegen: boolean;

  @ApiProperty({
    description: 'Distance covered in kilometers',
    example: 123.45,
    nullable: true,
  })
  distance: number | null;

  @ApiProperty({
    description: 'Detailed analysis results in JSON format',
    example: {
      date: { date: '2024-01-15', start: '10:00:00', end: '12:00:00' },
      overall: { distance_km: 123.45 },
    },
    nullable: true,
  })
  analysis: Record<string, any> | null;

  @ApiProperty({
    description: 'Analysis version',
    example: '1.0.0',
  })
  version: string;
}
