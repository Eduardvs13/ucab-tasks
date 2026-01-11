import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString({ message: 'El título debe ser un texto.' })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  titulo?: string;

  @IsOptional()
  @IsString({ message: 'El contenido debe ser un texto.' })
  contenido?: string;
}