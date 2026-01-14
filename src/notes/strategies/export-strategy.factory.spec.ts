import { ExportStrategyFactory } from './export-strategy.factory';
import { JsonExportStrategy } from './json-export.strategy';
import { CsvExportStrategy } from './csv-export.strategy';

describe('ExportStrategyFactory', () => {
    it('returns JSON strategy by default', () => {
        const factory = new ExportStrategyFactory(
            new JsonExportStrategy(),
            new CsvExportStrategy(),
        );

        const { strategy, contentType } = factory.get();

        expect(strategy).toBeInstanceOf(JsonExportStrategy);
        expect(contentType).toBe('application/json');
    });

    it('returns CSV strategy when format=csv', () => {
        const factory = new ExportStrategyFactory(
            new JsonExportStrategy(),
            new CsvExportStrategy(),
        );

        const { strategy, contentType } = factory.get('csv');

        expect(strategy).toBeInstanceOf(CsvExportStrategy);
        expect(contentType).toBe('text/csv; charset=utf-8');
    });
});
