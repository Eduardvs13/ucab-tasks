import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateNoteDto {
  @IsString({ message: 'El título debe ser un texto.' })
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres.' })
  titulo: string;

  @IsString({ message: 'El contenido debe ser un texto.' })
  contenido: string;
}