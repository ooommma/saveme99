import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { Users } from '../user/entities/users.entity';
@UseGuards(AuthGuard('jwt'))
@Controller('cards/:cardId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @HttpCode(201)
  @Post()
  createComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: Users,
    @Param('cardId') cardId: number,
  ) {
    return this.commentService.create(createCommentDto, user, cardId);
  }

  @Get()
  findAllComments(@Param('cardId') cardId: number) {
    return this.commentService.findAll(cardId);
  }

  @Get(':commentId')
  findOneComment(
    @Param('commentId') commentId: number,
    @Param('cardId') cardId: number,
  ) {
    return this.commentService.findOne(commentId, cardId);
  }

  @Patch(':commentId')
  updateComment(
    @Param('commentId') commentId: number,
    @Param('cardId') cardId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: Users,
  ) {
    return this.commentService.update(
      commentId,
      cardId,
      updateCommentDto,
      user,
    );
  }

  @Delete(':commentId')
  deleteComment(
    @Param('commentId') commentId: number,
    @Param('cardId') cardId: number,
    @GetUser() user: Users,
  ) {
    return this.commentService.remove(commentId, cardId, user);
  }
}
