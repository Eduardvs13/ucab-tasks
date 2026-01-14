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
import { ListNotesQueryDto } from './dto/list-notes.dto';
import { ApiNote, ApiNoteSummary } from './entities/note.entity';

import { ExportStrategyFactory } from './strategies/export-strategy.factory';

/**
 * Interfaz para establecer encabezados HTTP en respuestas personalizadas.
 * Utilizada en el método exportNotes para definir el tipo de res.
 */
export type HeaderSetter = {
  setHeader: (name: string, value: string) => void;
};

@ApiTags('notas')
@Controller('notes')
export class NotesController {
  constructor(
    private readonly notesService: NotesService,
    private readonly exportStrategyFactory: ExportStrategyFactory,
  ) { }

  /**
   * Obtiene todas las notas, con filtros y orden opcionales.
   * @param query - Parámetros de consulta para filtrar y ordenar.
   * @returns Lista de resúmenes de notas.
   */
  @Get()
  @ApiOperation({ summary: 'Listar todas las notas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de notas.',
    type: [ApiNoteSummary],
  })
  @ApiBadRequestResponse({ description: 'Error de validación en parámetros de consulta.' })
  getAll(@Query() query: ListNotesQueryDto) {
    return this.notesService.getAllNotes(query);
  }

  /**
   * Exporta las notas en el formato indicado (JSON o CSV).
   * @param format - Formato deseado ('json' o 'csv').
   * @param res - Objeto de respuesta para fijar encabezados.
   * @returns Notas exportadas como cadena.
   */
  @Get('export')
  @ApiOperation({ summary: 'Exportar notas' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv'], description: 'Formato de exportación (json o csv).' })
  @ApiProduces('application/json', 'text/csv')
  @ApiResponse({
    status: 200,
    description: 'Notas exportadas en JSON o CSV.',
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
    const { strategy, contentType } = this.exportStrategyFactory.get(format);
    res.setHeader('Content-Type', contentType);
    return this.notesService.exportNotes(strategy);
  }

  /**
   * Obtiene una nota por su ID.
   * @param id - ID de la nota a obtener.
   * @returns La nota con el ID especificado.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una nota por ID' })
  @ApiParam({ name: 'id', description: 'ID de la nota' })
  @ApiResponse({
    status: 200,
    description: 'Nota solicitada.',
    type: ApiNote,
  })
  @ApiResponse({ status: 404, description: 'Nota no encontrada.' })
  @ApiBadRequestResponse({
    description: 'Formato de UUID inválido.',
  })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.notesService.getNoteById(id);
  }

  /**
   * Crea una nueva nota.
   * @param createNoteDto - Datos para la nueva nota.
   * @returns La nota creada.
   */
  @Post()
  @ApiOperation({ summary: 'Crear una nueva nota' })
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Cuerpo de la solicitud para crear una nota.',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Título de mi nota' },
        content: { type: 'string', example: 'Contenido detallado' },
      },
      required: ['title', 'content'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'La nota ha sido creada exitosamente.',
    type: ApiNote,
  })
  @ApiBadRequestResponse({
    description: 'Error de validación en el cuerpo de la solicitud.',
  })
  create(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.createNote(createNoteDto);
  }

  /**
   * Actualiza una nota existente.
   * @param id - ID de la nota a actualizar.
   * @param updateNoteDto - Nuevos datos para la nota.
   * @returns La nota actualizada.
   */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una nota' })
  @ApiParam({ name: 'id', description: 'ID de la nota a actualizar' })
  @ApiConsumes('application/json')
  @ApiBody({
    description: 'Cuerpo de la solicitud para actualizar una nota.',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Título actualizado' },
        content: { type: 'string', example: 'Contenido actualizado' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'La nota ha sido actualizada exitosamente.',
    type: ApiNote,
  })
  @ApiResponse({ status: 404, description: 'Nota no encontrada.' })
  @ApiBadRequestResponse({
    description: 'Formato de UUID inválido o error de validación en el cuerpo.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.notesService.updateNote(id, updateNoteDto);
  }

  /**
   * Elimina una o varias notas.
   * @param id - Lista de IDs separados por coma.
   * @returns Las notas eliminadas.
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una o varias notas' })
  @ApiParam({
    name: 'id',
    description: 'Lista de IDs separados por coma a eliminar',
    schema: {
      type: 'string',
      example: 'uuid-1,uuid-2',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Las notas han sido eliminadas exitosamente.',
    type: [ApiNote],
  })
  @ApiResponse({ status: 404, description: 'Notas no encontradas.' })
  @ApiBadRequestResponse({
    description: 'IDs inválidos o ausentes en el parámetro de ruta.',
  })
  delete(@Param('id') id: string) {
    return this.notesService.deleteNote(id);
  }
}
