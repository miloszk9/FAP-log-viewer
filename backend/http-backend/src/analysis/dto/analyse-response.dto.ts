import { ApiProperty } from '@nestjs/swagger';

export class AnalyseResponseDto {
  @ApiProperty({ description: 'Unique identifier of the analysis' })
  id: string;

  @ApiProperty({ description: 'Current status of the analysis' })
  status: string;

  @ApiProperty({ description: 'Status message', required: false })
  message?: string;

  @ApiProperty({ description: 'Analysis results', required: false })
  result?: any;
}
