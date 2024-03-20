import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Columns } from './entities/column.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Columns, /*Card */])],
  controllers: [ColumnController],
  providers: [ColumnService],
})
export class ColumnModule {}
