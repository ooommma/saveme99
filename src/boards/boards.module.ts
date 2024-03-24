import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Boards } from './entities/board.entity';
import { AuthModule } from '../auth/auth.module';
import { Users } from '../user/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Boards, Users])],
  controllers: [BoardsController],
  providers: [BoardsService],
  // cardservice에서 boardService를 쓰기 위해 BoardsService를 export 해준다
  exports: [BoardsService],
})
export class BoardsModule {}
