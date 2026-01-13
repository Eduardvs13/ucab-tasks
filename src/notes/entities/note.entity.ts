import { ApiProperty } from '@nestjs/swagger';

export class Note {
  @ApiProperty({ description: 'The unique identifier of the note.' })
  id: string;

  @ApiProperty({ description: 'The title of the note.' })
  title: string;

  @ApiProperty({ description: 'The content of the note.' })
  content: string;

  @ApiProperty({ description: 'The creation date of the note.' })
  creationDate: Date;

  @ApiProperty({ description: 'The last modification date of the note.' })
  modificationDate: Date;
}

// API-facing types with English field names
export class ApiNote {
  @ApiProperty({ description: 'The unique identifier of the note.' })
  id: string;

  @ApiProperty({ description: 'The title of the note.' })
  title: string;

  @ApiProperty({ description: 'The content of the note.' })
  content: string;

  @ApiProperty({
    description: 'The creation date of the note in ISO format.',
  })
  createdAt: string; // ISO string

  @ApiProperty({
    description: 'The last modification date of the note in ISO format.',
  })
  updatedAt: string; // ISO string
}

export class ApiNoteSummary implements Omit<ApiNote, 'content'> {
  @ApiProperty({ description: 'The unique identifier of the note.' })
  id: string;
  @ApiProperty({ description: 'The title of the note.' })
  title: string;
  @ApiProperty({
    description: 'The creation date of the note in ISO format.',
  })
  createdAt: string;
  @ApiProperty({
    description: 'The last modification date of the note in ISO format.',
  })
  updatedAt: string;
}

export type NoteSummary = Omit<Note, 'content'>;
