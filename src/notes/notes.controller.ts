import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JsonExportStrategy } from './strategies/json-export.strategy';
import { CsvExportStrategy } from './strategies/csv-export.strategy';
import { ListNotesQueryDto } from './dto/list-notes.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) { }

  @Get()
  getAll(@Query() query: ListNotesQueryDto) {
    return this.notesService.getAllNotes(query);
  }

  @Get('export')
  async exportNotes(@Query('format') format: string) {
    // Por defecto, la estrategia será JSON
    let strategy = new JsonExportStrategy();

    if (format?.toLowerCase() === 'csv') {
      strategy = new CsvExportStrategy();
    }

    return this.notesService.exportNotes(strategy);
  }

  @Get('date')
  async getByDate(
    @Query('date') date: string,
    @Query('field') field?: 'created' | 'modified',
    @Query('order') order?: 'asc' | 'desc',
  ) {
    return this.notesService.getNotesByDate(date, field ?? 'created', order ?? 'asc');
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.notesService.getNoteById(id);
  }

  @Post()
  create(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.createNote(createNoteDto);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(id, updateNoteDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notesService.deleteNote(id);
  }
}