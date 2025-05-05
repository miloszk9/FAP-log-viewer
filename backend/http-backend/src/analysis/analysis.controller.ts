import {
  Controller,
  Get,
  Param,
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
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/request.interface';
import { AnalysisService } from './analysis.service';
import { AnalyseFileResponseDto } from './dto/analyse-file-response.dto';
import { AnalyseRequestDto } from './dto/analyse-request.dto';
import { GetAnalysisResponseDto } from './dto/get-analysis-response.dto';

@ApiTags('Analyse')
@Controller('analyse')
@ApiBearerAuth()
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a CSV file for analysis' })
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
    @UploadedFile() file: Express.Multer.File,
    @Request() req: RequestWithUser,
  ): Promise<AnalyseFileResponseDto> {
    const id = await this.analysisService.saveFile(file, req.user?.id);
    return { id };
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
    return {
      id,
      ...analysis,
    };
  }
}
