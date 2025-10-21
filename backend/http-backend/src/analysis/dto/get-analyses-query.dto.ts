import { ApiProperty } from '@nestjs/swagger';

export class GetAnalysesQueryDto {
  @ApiProperty({
    description: 'Field to sort by',
    enum: ['fileName', 'createdAt'],
    required: false,
    default: 'createdAt',
  })
  sortBy?: 'fileName' | 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc',
  })
  order?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Page number (1-based)',
    required: false,
    default: 1,
    minimum: 1,
  })
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
    minimum: 1,
  })
  limit?: number;
}
