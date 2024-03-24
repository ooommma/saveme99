import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('boards/:boardId/column')
export class ColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @Post()
  async create(
    @Param('boardId') boardId: number,
    @Body() createColumnDto: CreateColumnDto,
  ) {
    const createcolumn = await this.columnService.create(
      boardId,
      createColumnDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: '컬럼이 생성되었습니다',
      createcolumn,
    };
  }

  @Get()
  async findAll(@Param('boardId') boardId: number) {
    const column = await this.columnService.findAll(boardId);

    return {
      statusCode: HttpStatus.OK,
      message: '컬럼 조회',
      column,
    };
  }

  @Patch(':id')
  async update(
    @Param('boardId') boardId: number,
    @Param('id') id: number,
    @Body() updateColumnDto: UpdateColumnDto,
  ) {
    const column = await this.columnService.update(
      boardId,
      id,
      updateColumnDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: '컬럼 수정',
      column,
    };
  }

  @Delete(':id')
  async delete(@Param('boardId') boardId: number, @Param('id') id: number) {
    const column = await this.columnService.remove(boardId, id);

    return {
      statusCode: HttpStatus.OK,
      message: '컬럼이 삭제되었습니다',
      column,
    };
  }
}
