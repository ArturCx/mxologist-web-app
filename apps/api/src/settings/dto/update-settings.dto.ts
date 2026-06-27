import { IsInt, IsOptional, IsEnum, IsIn, Min, Max } from 'class-validator';
import { Sex, MeasurementUnit, ScoreType, Language } from '@mxologist/database';

const THEME_KEYS = [
  'midnight',
  'graphite',
  'aubergine',
  'emerald',
  'espresso',
];

// All fields optional so the client can PATCH a single setting at a time.
export class UpdateSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(120)
  age?: number;

  @IsOptional()
  @IsEnum(Sex)
  sex?: Sex;

  @IsOptional()
  @IsEnum(MeasurementUnit)
  measurementUnit?: MeasurementUnit;

  @IsOptional()
  @IsEnum(ScoreType)
  scoreType?: ScoreType;

  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @IsOptional()
  @IsIn(THEME_KEYS)
  theme?: string;
}
