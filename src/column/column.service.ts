import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Columns } from './entities/column.entity';

import { Between, LessThan, MoreThan, Not, Repository } from 'typeorm';

import _ from 'lodash';

@Injectable()
export class ColumnService {
  constructor(
    @InjectRepository(Columns)
    private readonly columnRepository: Repository<Columns>,
  ) { }

  async create(boardId: number, createColumnDto: CreateColumnDto) {
    const { name } = createColumnDto;

    const count = await this.columnRepository.count({ where: { boardId: boardId } });

    const createcolumn = await this.columnRepository.save({
      name,
      order: count + 1,
      boardId,
    });

    return { createcolumn, count };
  }


  async findAll(boardId: number): Promise<{ columns: Columns[]; count: number }> {
    const [columns, count] = await this.columnRepository.findAndCount({
      where: { boardId },
      select: ['id', 'boardId', 'order', 'name', 'createdAt', 'updatedAt'],
      order: { order: 'ASC' },
    });

    return { columns, count };
  }

  async update(boardId: number, id: number, updateColumnDto: UpdateColumnDto) {
    const findcolumn = await this.columnRepository.findOne({
      where: { boardId: boardId, id: id }
    });
  
    const newOrder = updateColumnDto.order;
    const newName = updateColumnDto.name;
  
    const totalCount = await this.columnRepository.count({ where: { boardId: boardId } });
  
    if (_.isNil(findcolumn)) {
      throw new NotFoundException('존재하지 않는 컬럼입니다');
    }
  
    if (newOrder > totalCount) {
      throw new NotFoundException('order의 수가 잘못되었습니다');
    }
  
    const currentOrder = findcolumn.order;
  
    if (newOrder < currentOrder) {
      const columnsToUpdate = await this.columnRepository.find({
        where: { boardId: boardId, order: Between(newOrder, currentOrder - 1) },
        order: { order: 'ASC' },
      });
  
      await Promise.all(
        columnsToUpdate.map(async (column) => {
          column.order += 1;
          await this.columnRepository.save(column);
        }),
      );
    } else if (newOrder > currentOrder) {
      const columnsToUpdate = await this.columnRepository.find({
        where: { boardId: boardId, order: Between(currentOrder + 1, newOrder) },
        order: { order: 'DESC' },
      });
  
      await Promise.all(
        columnsToUpdate.map(async (column) => {
          column.order -= 1;
          await this.columnRepository.save(column);
        }),
      );
    }
  
    findcolumn.name = newName;
    findcolumn.order = newOrder;
    const updatedColumn = await this.columnRepository.save(findcolumn);
  
    return updatedColumn;
  }
  

  async remove(boardId: number, id: number) {
    const findcolumn = await this.columnRepository.findOne({
      where: { boardId: boardId, id: id }
    });

    if (_.isNil(findcolumn)) {
      throw new NotFoundException('존재하지 않는 컬럼입니다');
    }

    const deleteOrder = findcolumn.order;


    const allColumns = await this.columnRepository.find({
      where: {
        boardId: boardId,
        order: MoreThan(deleteOrder),
      },
    });

    await Promise.all(
      allColumns.map(async (column) => {
        column.order -= 1;
        await this.columnRepository.save(column);
      }),
    );

    await this.columnRepository.delete({ id });

    const count = await this.columnRepository.count({ where: { boardId: boardId } });

    return { findcolumn, count };
  }

}
