import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Controller('column')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post()
  async create(@Body() createColumnDto: CreateColumnDto) {
    const createcolumn = await this.columnService.create(createColumnDto);

    return {
      statusCode: HttpStatus.CREATED,
      message : "컬럼이 생성되었습니다",
      createcolumn,
    };
  }

  @Get()
  async findAll() {
    const column = await this.columnService.findAll();

    return {
      statusCode: HttpStatus.OK,
      message : "컬럼 조회",
      column,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateColumnDto: UpdateColumnDto) {
    const column = await this.columnService.update(id, updateColumnDto);

    return {
      statusCode: HttpStatus.OK,
      message: "컬럼 수정",
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {

    const column = await this.columnService.remove(id);

    return {
      statusCode: HttpStatus.OK,
      message: "컬럼이 삭제되었습니다",
    }
  }
}
