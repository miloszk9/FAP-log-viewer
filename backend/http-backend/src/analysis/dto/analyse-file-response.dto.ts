import { ApiProperty } from '@nestjs/swagger';

export class AnalyseFileResponseDto {
  @ApiProperty({ description: 'Unique identifier of the analysis' })
  id: string;
}
