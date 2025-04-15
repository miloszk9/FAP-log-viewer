import { ApiProperty } from '@nestjs/swagger';

export class AnalysisResultDto {
  @ApiProperty({
    description: 'Name of the analyzed file',
    example: '123e4567-e89b-12d3-a456-426614174000.csv',
  })
  filename: string;

  @ApiProperty({
    description: 'Status of the analysis',
    example: 'Success',
    enum: ['Success', 'Failed'],
  })
  status: string;

  @ApiProperty({
    description: 'Description for the status',
    example: 'Analysis completed successfully.',
  })
  message: string;

  @ApiProperty({
    description: 'Analysis results',
    example: {
      totalRecords: 100,
      processedRecords: 100,
      errors: 0,
    },
  })
  analysis: any;
}
