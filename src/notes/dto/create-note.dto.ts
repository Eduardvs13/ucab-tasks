import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({
    description: 'The title of the note.',
    minLength: 3,
  })
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title cannot be empty.' })
  @MinLength(3, { message: 'Title must have at least 3 characters.' })
  title: string;

  @ApiProperty({ description: 'The content of the note.' })
  @IsString({ message: 'Content must be a string.' })
  content: string;
}
