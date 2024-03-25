import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Cards } from '../card/entities/card.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comments } from './entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comments, Cards])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
