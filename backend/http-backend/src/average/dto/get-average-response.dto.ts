import { ApiProperty } from '@nestjs/swagger';
import { FapAverage } from 'src/database/entities/fap-average.entity';

export class GetAverageResponseDto {
  @ApiProperty({ description: 'Status of the response' })
  status: string;

  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({
    description: 'User average data',
    type: FapAverage,
    required: false,
  })
  average?: Record<string, any>;
}
