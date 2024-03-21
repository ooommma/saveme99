import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Columns } from './entities/column.entity';
import { Cards } from 'src/card/entities/card.entity';
import { Boards } from 'src/boards/entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Columns ,Cards, Boards])],
  controllers: [ColumnController],
  providers: [ColumnService],
})
export class ColumnModule {}
