import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Columns } from './entities/column.entity';
import { Repository } from 'typeorm';
import _ from 'lodash';

@Injectable()
export class ColumnService {

  constructor(@InjectRepository(Columns) private readonly columnRepository: Repository<Columns>) {}

  async create(createColumnDto: CreateColumnDto) {
    const { name } = createColumnDto;


    const createcolumn = await this.columnRepository.save({
      name
    });

    return createcolumn;
  }

  async findAll(): Promise<Columns[]> {
    const getAllcolumn = await this.columnRepository.find({
      select : ["id", "boardId", "name", "createdAt", "updatedAt"],
      order : {id : "ASC"}
    });

    return getAllcolumn;
  }

  async update(id: number, updateColumnDto: UpdateColumnDto) {
    const findcolumn = await this.columnRepository.findOneBy({id});

    if(_.isNil(findcolumn)) {
      throw new NotFoundException("존재하지 않는 컬럼입니다");
    }
    
    const updatecolumn = await this.columnRepository.update({id}, updateColumnDto);

    return updatecolumn;
  }

  async remove(id: number) {
    const findcolumn = await this.columnRepository.findOneBy({id});

    if(_.isNil(findcolumn)) {
      throw new NotFoundException("존재하지 않는 컬럼입니다");
    }

    const deletecolumn = await this.columnRepository.delete({id});

    return deletecolumn;
  }
}
