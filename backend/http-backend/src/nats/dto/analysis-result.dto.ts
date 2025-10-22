import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnalysisStatusEnum } from 'src/database/entities/enums';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class AnalysisResultDto {
  @ApiProperty({
    description: 'ID of the analysed file (same as fileName)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  analysisId: string;

  @ApiProperty({
    description: 'Status of the analysis',
    example: 'Success',
    enum: ['Success', 'Failed'],
  })
  @IsEnum(AnalysisStatusEnum)
  status: AnalysisStatusEnum;

  @ApiProperty({
    description: 'Description for the status',
    example: 'Analysis completed successfully.',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Analysis results payload',
    example: {
      date: {
        date: '2025-03-11',
        start: '07:32:34',
        end: '08:21:49',
      },
      overall: {
        distance: 18.91,
        duration: {
          overall: 2376,
          engineOff: 170,
          engineOn: 2206,
          idle: 589,
          driving: 1616,
        },
        externalTemp: {
          avg: 10.5,
          max: 12,
          min: 10,
        },
      },
      driving: {
        acceleration: {
          max: 39,
          avg: 18.89,
        },
        fuelConsumption: {
          liters: 2.25,
          per_100km: 11.9,
        },
        revs: {
          min: 0,
          max: 2906,
          avg: 1457,
          avgDriving: 1679,
        },
        speed: {
          avg: 23.2,
          max: 74,
          min: 0,
        },
      },
      engine: {
        battery: {
          beforeDrive: {
            min: 12.3,
            max: 12.3,
            avg: 12.3,
          },
          engineRunning: {
            min: 12.3,
            max: 14.58,
            avg: 14.45,
          },
        },
        coolantTemp: {
          min: 11,
          max: 97,
          avg: 76,
        },
        engineWarmup: {
          coolant: 20.37,
          oil: 23.73,
        },
        errors: 0,
        oilCarbonate: 1,
        oilDilution: 3,
        oilTemp: {
          min: 12,
          max: 100,
          avg: 76,
        },
      },
      fap: {
        additive: {
          vol: 1260,
          remain: 752,
        },
        deposits: {
          percentage: 3,
          weight_gram: 2,
        },
        lastRegen: 3,
        lastRegen10: 751,
        life: {
          life_avg: 11469,
          left_avg: 142560,
        },
        pressure_idle: {
          avg: 10.1,
          max: 37,
          min: 0,
        },
        pressure: {
          min: 0,
          max: 133,
          avg: 29.2,
        },
        soot: {
          start: 17.5,
          end: 0.74,
          diff: -16.76,
        },
        temp: {
          min: 7,
          max: 440,
          avg: 225,
        },
      },
      fapRegen: {
        previousRegen: 868,
        duration: 905,
        distance: 8.5,
        speed: {
          min: 0,
          max: 70,
          avg: 33.7,
        },
        fapTemp: {
          min: 225,
          max: 440,
          avg: 341.21,
        },
        fapPressure: {
          min: 11,
          max: 133,
          avg: 44.75,
        },
        revs: {
          min: 756,
          max: 2906,
          avg: 1943.92,
        },
        fapSoot: {
          start: 17.66,
          end: 1.77,
          diff: -15.89,
        },
        fuelConsumption: {
          regen: 17.64,
          'non-regen': 9.47,
        },
      },
    },
  })
  @IsNotEmptyObject()
  @IsObject()
  analysis: Record<string, any>;

  @ApiProperty({
    description: 'Whether the analysis contains FAP regeneration',
    example: true,
  })
  @IsBoolean()
  fapRegen: boolean;

  @ApiPropertyOptional({
    description: 'Date of the log associated with the analysis',
    example: '2025-10-10T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  logDate?: string;

  @ApiPropertyOptional({
    description: 'Distance travelled in the analysed log in kilometres',
    example: 123.45,
  })
  @IsOptional()
  @IsNumber()
  distance?: number;
}
