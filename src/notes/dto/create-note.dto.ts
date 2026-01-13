import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateNoteDto {
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title cannot be empty.' })
  @MinLength(3, { message: 'Title must have at least 3 characters.' })
  title: string;

  @IsString({ message: 'Content must be a string.' })
  content: string;
}
