import {
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
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
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/request.interface';
import { AnalysisService } from './analysis.service';
import { AnalyseFileResponseDto } from './dto/analyse-file-response.dto';
import { AnalyseRequestDto } from './dto/analyse-request.dto';
import { GetAllAnalysisResponseDto } from './dto/get-all-analysis-response.dto';
import { GetAnalysisResponseDto } from './dto/get-analysis-response.dto';
import { EmailService } from '../email/email.service';

@ApiTags('Analyse')
@Controller('analyse')
@ApiBearerAuth()
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly emailService: EmailService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Upload a CSV file or ZIP with CSV files for analysis',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AnalyseRequestDto })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: AnalyseFileResponseDto,
  })
  @UseGuards(OptionalJwtAuthGuard)
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
  @ApiResponse({ status: 404, description: 'Analysis not found' })
  @UseGuards(OptionalJwtAuthGuard)
  async getAnalysis(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<GetAnalysisResponseDto> {
    // TODO: Fix scenario where analysis is uploaded by unauthenticated user, then the same is uploaded by authenticated user, unauthenticated user will not be able to access it
    const analysis = await this.analysisService.getAnalysis(id, req.user?.id);
    if (analysis.status === 'pending') {
      this.analysisService.sendAnalysisRequest(id).catch(() => {});
    }
    return {
      id,
      ...analysis,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all analysis results for a user' })
  @ApiResponse({
    status: 200,
    description: 'Analysis found',
    type: GetAllAnalysisResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Analysis not found' })
  @UseGuards(JwtAuthGuard)
  async getAnalysisForUser(
    @Request() req: RequestWithUser,
  ): Promise<GetAllAnalysisResponseDto[]> {
    this.emailService.refresh().catch(() => {});
    const analysis = await this.analysisService.getAnalysisForUser(
      req.user?.id,
    );
    return analysis.map((analysis) => ({
      id: analysis.id,
      fileName: analysis.fileName,
      regen: analysis.regen,
    }));
  }
}
