import { IsOptional, IsString, IsIn, IsISO8601 } from 'class-validator';

export class ListNotesQueryDto {
    @IsOptional()
    @IsString({ message: 'search must be a string.' })
    search?: string;

    @IsOptional()
    @IsIn(['title', 'createdAt', 'updatedAt'], {
        message: 'sort must be one of: title, createdAt, updatedAt',
    })
    sort?: 'title' | 'createdAt' | 'updatedAt';

    @IsOptional()
    @IsIn(['asc', 'desc'], { message: 'order must be asc or desc' })
    order?: 'asc' | 'desc';

    @IsOptional()
    @IsISO8601({}, { message: 'createdFrom must be a valid ISO 8601 date string' })
    createdFrom?: string;

    @IsOptional()
    @IsISO8601({}, { message: 'createdTo must be a valid ISO 8601 date string' })
    createdTo?: string;

    @IsOptional()
    @IsISO8601({}, { message: 'updatedFrom must be a valid ISO 8601 date string' })
    updatedFrom?: string;

    @IsOptional()
    @IsISO8601({}, { message: 'updatedTo must be a valid ISO 8601 date string' })
    updatedTo?: string;
}
