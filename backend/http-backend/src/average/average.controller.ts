import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/request.interface';
import { FapAverageService } from 'src/database/services/fap-average.service';
import { GetAverageResponseDto } from './dto/get-average-response.dto';
import { FapAverageTypeEnum } from 'src/database/entities/enums';

@ApiTags('Average')
@Controller('average')
@ApiBearerAuth()
export class AverageController {
  constructor(private readonly fapAverageService: FapAverageService) {}

  @Get()
  @ApiOperation({ summary: 'Get user average data' })
  @ApiResponse({
    status: 200,
    description: 'User average data found',
    type: GetAverageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'User is not authenticated' })
  @ApiResponse({ status: 404, description: 'User average data not found' })
  @UseGuards(JwtAuthGuard)
  async getAverage(
    @Request() req: RequestWithUser,
    @Query('type') type?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ): Promise<GetAverageResponseDto> {
    const enumType = (type as FapAverageTypeEnum) || FapAverageTypeEnum.OVERALL;
    const yearNum = year ? parseInt(year, 10) : undefined;
    const monthNum = month ? parseInt(month, 10) : undefined;

    const average = await this.fapAverageService.findOne(req.user.id, enumType, yearNum, monthNum);

    if (!average) {
      throw new NotFoundException('No average data found');
    }

    return {
      status: average.status,
      message: average.message ?? '',
      average: average.average ?? {},
    };
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available average periods' })
  @ApiResponse({ status: 200, description: 'List of available periods' })
  @UseGuards(JwtAuthGuard)
  async getAvailable(@Request() req: RequestWithUser) {
    const averages = await this.fapAverageService.findAllForUser(req.user.id);
    return averages.map(a => ({
      type: a.type,
      year: a.year,
      month: a.month,
      status: a.status,
    }));
  }
}
