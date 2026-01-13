import { IsOptional, IsString, IsIn, IsISO8601 } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListNotesQueryDto {
  @ApiPropertyOptional({ description: 'Search query to filter notes by title.' })
  @IsOptional()
  @IsString({ message: 'search must be a string.' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort notes by title, creation date, or update date.',
    enum: ['title', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsIn(['title', 'createdAt', 'updatedAt'], {
    message: 'sort must be one of: title, createdAt, updatedAt',
  })
  sort?: 'title' | 'createdAt' | 'updatedAt';

  @ApiPropertyOptional({
    description: 'Sort order.',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'order must be asc or desc' })
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Filter notes created from this date (ISO 8601).',
  })
  @IsOptional()
  @IsISO8601(
    {},
    { message: 'createdFrom must be a valid ISO 8601 date string' },
  )
  createdFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter notes created up to this date (ISO 8601).',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'createdTo must be a valid ISO 8601 date string' })
  createdTo?: string;

  @ApiPropertyOptional({
    description: 'Filter notes updated from this date (ISO 8601).',
  })
  @IsOptional()
  @IsISO8601(
    {},
    { message: 'updatedFrom must be a valid ISO 8601 date string' },
  )
  updatedFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter notes updated up to this date (ISO 8601).',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'updatedTo must be a valid ISO 8601 date string' })
  updatedTo?: string;
}
