import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { Cards } from './entities/card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsModule } from 'src/boards/boards.module';
import { ColumnModule } from 'src/column/column.module';

import { Columns } from '../column/entities/column.entity';

@Module({
  // cardService에서 boardservice를 쓰기 위해 boardsModule를 imports
  imports: [
    TypeOrmModule.forFeature([Cards, Columns]),
    BoardsModule,
    ColumnModule,
  ],

  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
