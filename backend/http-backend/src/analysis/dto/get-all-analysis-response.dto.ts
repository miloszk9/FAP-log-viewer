import { ApiProperty } from '@nestjs/swagger';

export class GetAllAnalysisResponseDto {
  @ApiProperty({ description: 'Unique identifier of the analysis' })
  id: string;

  @ApiProperty({ description: 'File name of the analysis' })
  fileName: string;

  @ApiProperty({
    description: 'Whether the analysis contains FAP regeneration',
    example: true,
  })
  regen: boolean;
}
