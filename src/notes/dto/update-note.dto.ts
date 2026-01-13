import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNoteDto {
  @ApiPropertyOptional({
    description: 'The new title of the note.',
    minLength: 3,
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title cannot be empty.' })
  @MinLength(3, { message: 'Title must have at least 3 characters.' })
  title?: string;

  @ApiPropertyOptional({ description: 'The new content of the note.' })
  @IsOptional()
  @IsString({ message: 'Content must be a string.' })
  content?: string;
}
