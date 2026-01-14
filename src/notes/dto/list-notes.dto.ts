import { IsOptional, IsString, IsIn, IsISO8601 } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListNotesQueryDto {
  @ApiPropertyOptional({
    description: 'Texto de búsqueda para filtrar notas por título.',
  })
  @IsOptional()
  @IsString({ message: 'search debe ser una cadena.' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Ordenar notas por título, fecha de creación o actualización.',
    enum: ['title', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsIn(['title', 'createdAt', 'updatedAt'], {
    message: 'sort debe ser: title, createdAt o updatedAt',
  })
  sort?: 'title' | 'createdAt' | 'updatedAt';

  @ApiPropertyOptional({
    description: 'Dirección de orden.',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'order debe ser asc o desc' })
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Filtrar notas creadas desde esta fecha (ISO 8601).',
  })
  @IsOptional()
  @IsISO8601(
    {},
    { message: 'createdFrom debe ser una fecha válida en formato ISO 8601' },
  )
  createdFrom?: string;

  @ApiPropertyOptional({
    description: 'Filtrar notas creadas hasta esta fecha (ISO 8601).',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'createdTo debe ser una fecha válida en formato ISO 8601' })
  createdTo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar notas actualizadas desde esta fecha (ISO 8601).',
  })
  @IsOptional()
  @IsISO8601(
    {},
    { message: 'updatedFrom debe ser una fecha válida en formato ISO 8601' },
  )
  updatedFrom?: string;

  @ApiPropertyOptional({
    description: 'Filtrar notas actualizadas hasta esta fecha (ISO 8601).',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'updatedTo debe ser una fecha válida en formato ISO 8601' })
  updatedTo?: string;
}
