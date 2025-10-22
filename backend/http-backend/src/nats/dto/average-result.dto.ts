import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsObject,
  IsNotEmptyObject,
} from 'class-validator';
import { FapAverageStatusEnum } from 'src/database/entities/enums';

export class AverageResultDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description:
      'SHA256 hash of the concatenated analysis JSONs used for this average calculation',
    example: '2cf24dba5fb3a713146449fd4b813712e8d6d41b5bb4f4d8f011c0148fd4b329',
  })
  @IsString()
  analysisSha: string;

  @ApiProperty({
    description: 'Status of the average analysis',
    example: 'SUCCESS',
    enum: ['SUCCESS', 'FAILED'],
  })
  @IsEnum(FapAverageStatusEnum)
  status: FapAverageStatusEnum;

  @ApiProperty({
    description: 'Description for the status',
    example: 'Average analysis completed successfully.',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Average analysis results',
    example: {
      overall: {
        distance: 18.91,
        duration: {
          overall: 2376,
          engineOff: 170,
          engineOn: 2206,
          idle: 589,
          driving: 1616,
        },
      },
      driving: {
        acceleration: {
          max: 39,
          avg: 18.89,
        },
        fuelConsumption: 12.48,
        revs: {
          min: 0,
          max: 2906,
          avg: 1457,
          avgDriving: 1679,
        },
        speed: {
          avg: 23.2,
          max: 74,
        },
      },
      engine: {
        battery: {
          beforeDrive: {
            avg: 12.3,
          },
          engineRunning: {
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
        errors: {
          min: 0,
          max: 2,
        },
        oilCarbonate: {
          min: 0,
          max: 3,
        },
        oilDilution: {
          min: 0,
          max: 2,
        },
        oilTemp: {
          min: 12,
          max: 100,
          avg: 76,
        },
      },
      fap: {
        pressure: {
          min: 0,
          max: 100,
          avg: 10.1,
        },
        pressure_idle: {
          avg: 10.1,
        },
        soot: {
          min: 0.74,
          max: 17.5,
        },
        temp: {
          min: 7,
          max: 440,
          avg: 224,
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
  average: Record<string, any>;
}
