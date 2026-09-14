import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CrudService } from './crud.service';

@ApiTags('Data & CRUD')
@Controller('data')
export class CrudController {
  constructor(private readonly crudService: CrudService) {}

  @Get(':table')
  @ApiOperation({ summary: 'Query rows from a table with filters, order, and pagination' })
  async find(
    @Param('table') table: string,
    @Query('select') select?: string,
    @Query('order') order?: string,
    @Query('ascending') ascending?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('count') count?: string,
    @Query() queryParams?: Record<string, any>,
  ) {
    const filter: Record<string, any> = {};
    const excludedKeys = ['select', 'order', 'ascending', 'limit', 'offset', 'count'];

    if (queryParams) {
      for (const [k, v] of Object.entries(queryParams)) {
        if (!excludedKeys.includes(k) && v !== undefined && v !== '') {
          filter[k] = v;
        }
      }
    }

    return this.crudService.find(table, {
      select,
      order,
      ascending: ascending === 'true' || ascending === '1',
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      filter,
      count: count === 'exact' || count === 'true',
    });
  }

  @Get(':table/:id')
  @ApiOperation({ summary: 'Get single row by ID' })
  async findOne(@Param('table') table: string, @Param('id') id: string) {
    return this.crudService.findOne(table, id);
  }

  @Post(':table')
  @ApiOperation({ summary: 'Create a new row in a table' })
  async create(@Param('table') table: string, @Body() body: any) {
    return this.crudService.create(table, body);
  }

  @Patch(':table/:id')
  @Put(':table/:id')
  @ApiOperation({ summary: 'Update an existing row in a table' })
  async update(
    @Param('table') table: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.crudService.update(table, id, body);
  }

  @Delete(':table/:id')
  @ApiOperation({ summary: 'Delete a row from a table' })
  async delete(@Param('table') table: string, @Param('id') id: string) {
    return this.crudService.delete(table, id);
  }
}
