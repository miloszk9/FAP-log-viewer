import {
  Controller,
  Get,
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
  ): Promise<GetAverageResponseDto> {
    const average = await this.fapAverageService.findOne(req.user.id);

    if (!average) {
      throw new NotFoundException('No average data found');
    }

    return {
      status: average.status,
      message: average.message ?? '',
      average: average.average ?? {},
    };
  }
}
