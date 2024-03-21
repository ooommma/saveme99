import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Boards } from './entities/board.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Users } from 'src/user/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Boards, Users])],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsModule],
})
export class BoardsModule {}
