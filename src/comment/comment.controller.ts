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
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: Users,
    @Param('cardId') cardId: number,
  ) {
    return await this.commentService.create(createCommentDto, user, cardId);
  }

  @Get()
  async findAllComments(@Param('cardId') cardId: number) {
    return await this.commentService.findAll(cardId);
  }

  @Get(':commentId')
  async findOneComment(
    @Param('commentId') commentId: number,
    @Param('cardId') cardId: number,
  ) {
    return await this.commentService.findOneComment(commentId, cardId);
  }

  @Patch(':commentId')
  async updateComment(
    @Param('commentId') commentId: number,
    @Param('cardId') cardId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetUser() user: Users,
  ) {
    const updatedResult = await this.commentService.update(
      commentId,
      cardId,
      updateCommentDto,
      user,
    );
    return {
      statusCode: 200,
      message: updatedResult,
    };
  }

  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: number,
    @Param('cardId') cardId: number,
    @GetUser() user: Users,
  ) {
    const deletedComment = await this.commentService.remove(
      commentId,
      cardId,
      user,
    );

    return {
      statusCode: 200,
      message: deletedComment,
    };
  }
}
