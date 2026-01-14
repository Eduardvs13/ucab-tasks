import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNoteDto {
  @ApiPropertyOptional({
    description: 'Nuevo título de la nota.',
    minLength: 3,
  })
  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena.' })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  title?: string;

  @ApiPropertyOptional({ description: 'Nuevo contenido de la nota.' })
  @IsOptional()
  @IsString({ message: 'El contenido debe ser una cadena.' })
  content?: string;
}
