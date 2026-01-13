import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiConsumes,
  ApiProduces,
  ApiBody,
} from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JsonExportStrategy } from './strategies/json-export.strategy';
import { CsvExportStrategy } from './strategies/csv-export.strategy';
import { ListNotesQueryDto } from './dto/list-notes.dto';
import { ApiNote, ApiNoteSummary } from './entities/note.entity';

type HeaderSetter = {
  setHeader: (name: string, value: string) => void;
};

@ApiTags('notes')
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) { }

  /**
   * Retrieves all notes, with optional filtering and sorting.
   * @param query - The query parameters for filtering and sorting.
   * @returns A list of note summaries.
   */
  @Get()
  @ApiOperation({ summary: 'Get all notes' })
  @ApiResponse({
    status: 200,
    description: 'A list of notes.',
    type: [ApiNoteSummary],
  })
  @ApiBadRequestResponse({ description: 'Validation error in query params.' })
  getAll(@Query() query: ListNotesQueryDto) {
    return this.notesService.getAllNotes(query);
  }

  /**
   * Exports notes in a specified format (JSON or CSV).
   * @param format - The desired export format ('json' or 'csv').
   * @param res - The response object to set headers.
   * @returns The exported notes as a string.
   */
  @Get('export')
  @ApiOperation({ summary: 'Export notes' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv'] })
  @ApiProduces('application/json', 'text/csv')
  @ApiResponse({
    status: 200,
    description: 'The exported notes as JSON or CSV.',
    schema: {
      oneOf: [
        {
          type: 'string',
          example: '[{"id":"...","title":"Note","content":"...","createdAt":"2024-01-01T00:00:00.000Z","updatedAt":"2024-01-02T00:00:00.000Z"}]',
        },
        {
          type: 'string',
          example: 'id,title,content,createdAt,updatedAt\n...'
        },
      ],
    },
  })
  async exportNotes(
    @Query('format') format: string,
    @Res({ passthrough: true }) res: HeaderSetter,
  ) {
    // Default strategy is JSON
    let strategy = new JsonExportStrategy();
    let contentType = 'application/json';

    if (format?.toLowerCase() === 'csv') {
      strategy = new CsvExportStrategy();
      contentType = 'text/csv; charset=utf-8';
    }

    res.setHeader('Content-Type', contentType);

    return this.notesService.exportNotes(strategy);
  }

  /**
   * Retrieves a single note by its ID.
   * @param id - The ID of the note to retrieve.
   * @returns The note with the specified ID.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a note by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the note' })
  @ApiResponse({
    status: 200,
    description: 'The requested note.',
    type: ApiNote,
  })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format.',
  })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.notesService.getNoteById(id);
  }

  /**
   * Creates a new note.
   * @param createNoteDto - The data for the new note.
   * @returns The newly created note.
   */
  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Payload to create a note.',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'My note title' },
        content: { type: 'string', example: 'Detailed content' },
      },
      required: ['title', 'content'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The note has been successfully created.',
    type: ApiNote,
  })
  @ApiBadRequestResponse({
    description: 'Validation error in request body.',
  })
  create(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.createNote(createNoteDto);
  }

  /**
   * Updates an existing note.
   * @param id - The ID of the note to update.
   * @param updateNoteDto - The new data for the note.
   * @returns The updated note.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Update a note' })
  @ApiParam({ name: 'id', description: 'The ID of the note to update' })
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Payload to update a note.',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated title' },
        content: { type: 'string', example: 'Updated content' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The note has been successfully updated.',
    type: ApiNote,
  })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format or validation error in body.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(id, updateNoteDto);
  }

  /**
   * Deletes one or more notes.
   * @param id - A comma-separated list of note IDs to delete.
   * @returns The deleted notes.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete one or more notes' })
  @ApiParam({
    name: 'id',
    description: 'A comma-separated list of note IDs to delete',
    schema: {
      type: 'string',
      example: 'uuid-1,uuid-2',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'The notes have been successfully deleted.',
    type: [ApiNote],
  })
  @ApiResponse({ status: 404, description: 'Note(s) not found.' })
  @ApiBadRequestResponse({
    description: 'Invalid or missing IDs in path parameter.',
  })
  delete(@Param('id') id: string) {
    return this.notesService.deleteNote(id);
  }
}
