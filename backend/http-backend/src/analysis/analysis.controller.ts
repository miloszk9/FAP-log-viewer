import {
  Controller,
  Delete,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/request.interface';
import { AnalysisService } from './analysis.service';
import { AnalyseFileResponseDto } from './dto/analyse-file-response.dto';
import { AnalyseRequestDto } from './dto/analyse-request.dto';
import { GetAnalysesQueryDto } from './dto/get-analyses-query.dto';
import { GetAllAnalysisResponseDto } from './dto/get-all-analysis-response.dto';
import { GetAnalysisResponseDto } from './dto/get-analysis-response.dto';
import { EmailService } from '../email/email.service';
import { AverageService } from 'src/average/average.service';

@ApiTags('Analyses')
@Controller('analyses')
@ApiBearerAuth()
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly emailService: EmailService,
    private readonly averageService: AverageService,
  ) {}

  @Post()
  @HttpCode(202)
  @ApiOperation({
    summary: 'Upload a CSV file or ZIP with CSV files for analysis',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AnalyseRequestDto })
  @ApiResponse({
    status: 202,
    description: 'File queued for analysis',
    type: AnalyseFileResponseDto,
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async analyseFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20971520 }),
          // new FileTypeValidator({ fileType: '.(zip|csv)$' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Request() req: RequestWithUser,
  ): Promise<AnalyseFileResponseDto> {
    const result = await this.analysisService.saveFile(file, req.user?.id);
    if (Array.isArray(result)) {
      return { ids: result };
    }
    return { ids: [result] };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get analysis results by ID' })
  @ApiResponse({
    status: 200,
    description: 'Analysis found',
    type: GetAnalysisResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Analysis not found' })
  @UseGuards(JwtAuthGuard)
  async getAnalysis(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<GetAnalysisResponseDto> {
    const analysis = await this.analysisService.getAnalysis(id, req.user?.id);

    return {
      id,
      status: analysis.status,
      message: analysis.message,
      logDate: analysis.logDate,
      fapRegen: analysis.fapRegen,
      distance: analysis.distance,
      analysis: analysis.analysis,
      version: analysis.version || '',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated analysis results for a user' })
  @ApiResponse({
    status: 200,
    description: 'Paginated analysis list',
    type: GetAllAnalysisResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  async getAnalysesForUser(
    @Query() query: GetAnalysesQueryDto,
    @Request() req: RequestWithUser,
  ): Promise<GetAllAnalysisResponseDto> {
    this.emailService.refresh().catch(() => {});

    const { data, total } =
      await this.analysisService.getAnalysisForUserPaginated(req.user?.id, {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        order: query.order,
      });

    const page = query.page || 1;
    const limit = query.limit || 10;

    return {
      data: data.map((analysis) => ({
        id: analysis.id,
        fileName: analysis.fileName,
        createdAt: analysis.createdAt,
        status: analysis.status,
        fapRegen: analysis.fapRegen,
      })),
      pagination: {
        totalItems: total,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an analysis by ID' })
  @ApiResponse({
    status: 204,
    description: 'Analysis deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Analysis not found' })
  @UseGuards(JwtAuthGuard)
  async deleteAnalysis(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    await this.analysisService.deleteAnalysis(id, req.user?.id);
    await this.averageService.update(req.user?.id);
  }
}
