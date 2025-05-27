import { ApiProperty } from '@nestjs/swagger';

export class AnalyseRequestDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'CSV file or ZIP with CSV files',
  })
  file: Express.Multer.File;
}
