import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string.' })
  @IsNotEmpty({ message: 'Title cannot be empty.' })
  @MinLength(3, { message: 'Title must have at least 3 characters.' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Content must be a string.' })
  content?: string;
}
