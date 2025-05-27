import { ApiProperty } from '@nestjs/swagger';

export class AnalyseFileResponseDto {
  @ApiProperty({
    description:
      'Unique identifiers of the analysis(multiple when processing ZIP files)',
    required: false,
    type: [String],
  })
  ids: string[];
}
