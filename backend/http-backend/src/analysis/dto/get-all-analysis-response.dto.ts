import { ApiProperty } from '@nestjs/swagger';
import { AnalysisHistoryItemDto } from './analysis-history-item.dto';
import { PaginationDto } from './pagination.dto';

export class GetAllAnalysisResponseDto {
  @ApiProperty({
    description: 'Array of analysis items',
    type: [AnalysisHistoryItemDto],
  })
  data: AnalysisHistoryItemDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationDto,
  })
  pagination: PaginationDto;
}
