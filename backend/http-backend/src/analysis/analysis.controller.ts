import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { AnalyseRequestDto } from './dto/analyse-request.dto';
import { AnalyseFileResponseDto } from './dto/analyse-file-response.dto';
import { GetAnalysisResponseDto } from './dto/get-analysis-response.dto';

@ApiTags('analysis')
@Controller('analyse')
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
  @UseInterceptors(FileInterceptor('file'))
  async analyseFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AnalyseFileResponseDto> {
    const id = await this.analysisService.saveFile(file);
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
  async getAnalysis(@Param('id') id: string): Promise<GetAnalysisResponseDto> {
    const analysis = await this.analysisService.getAnalysis(id);
    if (analysis.status === 'not_found') {
      throw new NotFoundException(analysis.message);
    }
    return {
      id,
      ...analysis,
    };
  }
}
