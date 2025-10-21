/**
 * ===================================================================================
 *                                    ENUMS
 * ===================================================================================
 */

/**
 * Represents the status of a log file analysis.
 * Based on the `analysis_status_enum` PostgreSQL ENUM type.
 */
export type AnalysisStatus = 'Processing' | 'Success' | 'Failed';

/**
 * Represents the status of a user's aggregated average calculation.
 * Based on the `fap_average_status_enum` PostgreSQL ENUM type.
 */
export type FapAverageStatus = 'CALCULATING' | 'SUCCESS' | 'FAILED';

/**
 * ===================================================================================
 *                                 BASE ENTITIES
 * ===================================================================================
 */

/**
 * Represents the `users` table.
 * This is the foundational type for user-related data.
 */
export type User = {
  id: string; // UUID
  email: string;
  passwordHash: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Represents the detailed JSON structure of the `analysis` column in the `fap_analysis` table.
 * This structure is derived from the example payload in `api-plan.md`.
 * All properties are optional to accommodate variations in analysis results.
 */
export type FapAnalysisJson = {
    date?: {
        date?: string;
        start?: string;
        end?: string;
    },
    overall?: {
        distance_km?: number;
        duration?: {
            overall_sec?: number;
            engineOff_sec?: number;
            engineOn_sec?: number;
            idle_sec?: number;
            driving_sec?: number;
        },
        externalTemp?: {
            avg_c?: number;
            max_c?: number;
            min_c?: number;
        }
    },
    driving?: {
        acceleration?: {
            max_perc?: number;
            avg_perc?: number;
        },
        fuelConsumption?: {
            total_l?: number;
            avg_l100km?: number;
        },
        revs?: {
            min?: number;
            max?: number;
            avg?: number;
            avgDriving?: number;
        },
        speed?: {
            avg_kmh?: number;
            max_kmh?: number;
            min_kmh?: number;
        }
    },
    engine?: {
        battery?: {
            beforeDrive?: {
                min_v?: number;
                max_v?: number;
                avg_v?: number;
            },
            engineRunning?: {
                min_v?: number;
                max_v?: number;
                avg_v?: number;
            }
        },
        coolantTemp?: {
            min_c?: number;
            max_c?: number;
            avg_c?: number;
        },
        engineWarmup?: {
            coolant_sec?: number;
            oil_sec?: number;
        },
        errors?: number;
        oilCarbonate_perc?: number;
        oilDilution_perc?: number;
        oilTemp?: {
            min_c?: number;
            max_c?: number;
            avg_c?: number;
        }
    },
    fap?: {
        additive?: {
            vol_ml?: number;
            remain_ml?: number;
        },
        deposits?: {
            percentage_perc?: number;
            weight_gram?: number;
        },
        lastRegen_km?: number;
        last10Regen_km?: number;
        life?: {
            life_km?: number;
            left_km?: number;
        },
        pressure_idle?: {
            avg_mbar?: number;
            max_mbar?: number;
            min_mbar?: number;
        },
        pressure?: {
            min_mbar?: number;
            max_mbar?: number;
            avg_mbar?: number;
        },
        soot?: {
            start_gl?: number;
            end_gl?: number;
            diff_gl?: number;
        },
        temp?: {
            min_c?: number;
            max_c?: number;
            avg_c?: number;
        }
    },
    fapRegen?: {
        previousRegen_km?: number;
        duration_sec?: number;
        distance_km?: number;
        speed?: {
            min_kmh?: number;
            max_kmh?: number;
            avg_kmh?: number;
        },
        fapTemp?: {
            min_c?: number;
            max_c?: number;
            avg_c?: number;
        },
        fapPressure?: {
            min_mbar?: number;
            max_mbar?: number;
            avg_mbar?: number;
        },
        revs?: {
            min?: number;
            max?: number;
            avg?: number;
        },
        fapSoot?: {
            start_gl?: number;
            end_gl?: number;
            diff_gl?: number;
        },
        fuelConsumption?: {
            regen_l100km?: number;
            nonRegen_l100km?: number;
        }
    }
}

/**
 * Represents the `fap_analysis` table.
 * It serves as the base for all analysis-related DTOs.
 */
export type FapAnalysis = {
  id: string; // UUID
  fileName: string;
  sha256: string;
  status: AnalysisStatus;
  message: string;
  logDate: Date | null;
  fapRegen: boolean;
  distance: number | null;
  analysis: FapAnalysisJson | null;
  version: string;
  userId: string; // UUID
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Represents the detailed JSON structure of the `average` column in the `fap_average` table.
 * This structure is derived from the example payload in `api-plan.md`.
 * All properties are optional to accommodate variations in aggregated data.
 */
export type FapAverageJson = {
    overall?: {
        distance_km?: number;
        duration?: {
            overall_sec?: number;
            engineOff_sec?: number;
            engineOn_sec?: number;
            idle_sec?: number;
            driving_sec?: number;
        }
    },
    driving?: {
        acceleration?: {
            max_perc?: number;
            avg_perc?: number;
        },
        fuelConsumption_l100km?: number;
        revs?: {
            min?: number;
            max?: number;
            avg?: number;
            avgDriving?: number;
        },
        speed?: {
            avg_kmh?: number;
            max_kmh?: number;
        }
    },
    engine?: {
        battery?: {
            beforeDrive?: {
                avg_v?: number;
            },
            engineRunning?: {
                avg_v?: number;
            }
        },
        coolantTemp?: {
            min_c?: number;
            max_c?: number;
            avg_c?: number;
        },
        engineWarmup?: {
            coolant_sec?: number;
            oil_sec?: number;
        },
        errors?: {
            min?: number;
            max?: number;
        },
        oilCarbonate?: {
            min_perc?: number;
            max_perc?: number;
        },
        oilDilution?: {
            min_perc?: number;
            max_perc?: number;
        },
        oilTemp?: {
            min_c?: number;
            max_c?: number;
            avg_c?: number;
        }
    },
    fap?: {
        pressure?: {
            min_mbar?: number;
            max_mbar?: number;
            avg_mbar?: number;
        },
        pressure_idle?: {
            avg_mbar?: number;
        },
        soot?: {
            min_gl?: number;
            max_gl?: number;
        },
        temp?: {
            min_c?: number;
            max_c?: number;
            avg_c?: number;
        }
    },
    fapRegen?: {
        previousRegen_km?: number;
        duration_sec?: number;
        distance_km?: number;
        speed?: {
            min_kmh?: number;
            max_kmh?: number;
            avg_kmh?: number;
        },
        fapTemp?: {
            min_c?: number;
            max_c?: number;
            avg_c?: number;
        },
        fapPressure?: {
            min_mbar?: number;
            max_mbar?: number;
            avg_mbar?: number;
        },
        revs?: {
            min?: number;
            max?: number;
            avg?: number;
        },
        fapSoot?: {
            start_gl?: number;
            end_gl?: number;
        },
        fuelConsumption?: {
            regen_l100km?: number;
            nonRegen_l100km?: number;
        }
    }
}

/**
 * Represents the `fap_average` table.
 * Base type for user-specific aggregated data.
 */
export type FapAverage = {
  id: string; // UUID
  userId: string; // UUID
  status: FapAverageStatus;
  average: FapAverageJson | null;
  message: string | null;
  sha256: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * ===================================================================================
 *                            COMMAND MODELS & DTOs
 * ===================================================================================
 */

// ---------------------------------
// Authentication
// ---------------------------------

/**
 * Command model for user registration payload.
 * `password` is a plain string, which will be hashed by the backend.
 */
export type RegisterUserDto = Pick<User, 'email'> & {
  password: string;
};

/**
 * Command model for user login payload.
 * It shares the same structure as registration.
 */
export type LoginUserDto = RegisterUserDto;

/**
 * Command model for refreshing an access token.
 */
export type RefreshTokenDto = Pick<User, 'refreshToken'>;

// ---------------------------------
// Analyses
// ---------------------------------

/**
 * DTO for the response after queueing a file for analysis.
 * Contains the IDs of the analysis records created.
 */
export type UploadAnalysisResponseDto = {
  ids: FapAnalysis['id'][];
};

/**
 * Command model for the query parameters when fetching log history.
 * `sortBy` is limited to specific fields as defined in the API plan.
 */
export type GetAnalysesQueryDto = Partial<{
  sortBy: 'fileName' | 'createdAt';
  order: 'asc' | 'desc';
  page: number;
  limit: number;
}>;

/**
 * DTO representing a single, summarized analysis entry in a list.
 * This is a subset of the `FapAnalysis` entity.
 */
export type AnalysisHistoryItemDto = Pick<
  FapAnalysis,
  'id' | 'fileName' | 'createdAt' | 'status' | 'fapRegen'
>;

/**
 * DTO for pagination metadata included in list responses.
 */
export type PaginationDto = {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
};

/**
 * DTO for the paginated list of analysis history.
 * Combines a list of summary items with pagination details.
 */
export type GetAnalysesResponseDto = {
  data: AnalysisHistoryItemDto[];
  pagination: PaginationDto;
};

/**
 * DTO for the detailed view of a single analysis.
 * It includes all relevant fields from the `FapAnalysis` entity for client-side display.
 * The `analysis` property contains the full, structured JSON data.
 */
export type AnalysisDetailDto = Pick<
  FapAnalysis,
  | 'id'
  | 'status'
  | 'message'
  | 'logDate'
  | 'fapRegen'
  | 'distance'
  | 'analysis'
  | 'version'
>;

// ---------------------------------
// Averages
// ---------------------------------

/**
 * DTO for the user's aggregated, cross-log average data.
 * It omits user-specific IDs and internal fields for the client.
 */
export type UserAverageDto = Pick<FapAverage, 'status' | 'message' | 'average'>;
