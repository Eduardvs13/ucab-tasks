import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Título de la nota.',
    minLength: 3,
  })
  @IsString({ message: 'El título debe ser una cadena.' })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  title: string;

  @ApiProperty({ description: 'Contenido de la nota.' })
  @IsString({ message: 'El contenido debe ser una cadena.' })
  content: string;
}
