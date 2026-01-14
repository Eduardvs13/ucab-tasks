import { Injectable } from '@nestjs/common';
import { ExportStrategy } from './export.strategy';
import { JsonExportStrategy } from './json-export.strategy';
import { CsvExportStrategy } from './csv-export.strategy';

export type ExportSelection = { strategy: ExportStrategy; contentType: string };

/** Elige la estrategia de exportación apropiada según el formato solicitado. */
@Injectable()
export class ExportStrategyFactory {
    constructor(
        private readonly jsonStrategy: JsonExportStrategy,
        private readonly csvStrategy: CsvExportStrategy,
    ) { }

    /** Devuelve la estrategia y el tipo de contenido para un formato dado. */
    get(format?: string): ExportSelection {
        if (format?.toLowerCase() === 'csv') {
            return { strategy: this.csvStrategy, contentType: 'text/csv; charset=utf-8' };
        }
        return { strategy: this.jsonStrategy, contentType: 'application/json' };
    }
}
