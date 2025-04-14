import { ApiProperty } from '@nestjs/swagger';

export class AnalyseRequestDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'CSV file to analyze',
  })
  file: Express.Multer.File;
}
