import {
  Body,
  Controller,
  MaxFileSizeValidator,
  NotFoundException,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from '../database/services/user.service';
import { AnalysisService } from '../analysis/analysis.service';
import { AnalyseFileResponseDto } from '../analysis/dto/analyse-file-response.dto';
import { AnalyseRequestDto } from '../analysis/dto/analyse-request.dto';

@ApiTags('Email Analysis')
@Controller('email')
export class EmailController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Upload a CSV file or ZIP with CSV files for analysis with user email',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AnalyseRequestDto })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: AnalyseFileResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async analyseFileWithEmail(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20971520 }),
          // new FileTypeValidator({ fileType: '.(zip|csv)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body('email') email: string,
  ): Promise<AnalyseFileResponseDto> {
    let userId: string;
    try {
      const user = await this.userService.findByEmail(email);
      userId = user.id;
    } catch {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    const result = await this.analysisService.saveFile(file, userId);
    if (Array.isArray(result)) {
      return { ids: result };
    }
    return { ids: [result] };
  }
}
