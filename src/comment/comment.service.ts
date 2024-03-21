import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Users } from '../user/entities/users.entity';
import { Comments } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cards } from '../card/entities/card.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comments)
    private commentRepository: Repository<Comments>,
    @InjectRepository(Cards)
    private cardRepository: Repository<Cards>,
  ) {}
  async create(
    createCommentDto: CreateCommentDto,
    user: Users,
    cardId: number,
  ) {
    const { content } = createCommentDto;
    const isCardExist = await this.cardRepository.exists({
      where: {
        cardId,
      },
    });
    if (isCardExist === false)
      throw new NotFoundException('카드를 찾을 수 없습니다.');

    //카드가 있다면 유저는 인증됐으니 바로 생성 고

    const commentDao = this.commentRepository.create({
      userId: user.userId,
      cardId,
      content: content,
    });
    try {
      const comment = await this.commentRepository.save(commentDao);
      return comment;
    } catch {
      throw new InternalServerErrorException(
        '댓글 저장 중 에러가 발생하였습니다.',
      );
    }
  }

  async findAll(cardId: number) {
    const comments = await this.commentRepository.find({
      where: {
        cardId,
      },
    });
    if (!comments) throw new NotFoundException('카드를 찾을 수 없습니다.');

    return comments;
  }

  async findOne(commentId: number, cardId: number) {
    const comment = await this.commentRepository.findOne({
      where: {
        cardId,
        commentId,
      },
    });
    if (!comment) throw new NotFoundException('카드를 찾을 수 없습니다.');

    return comment;
  }

  async update(
    commentId: number,
    cardId: number,
    updateCommentDto: UpdateCommentDto,
    user: Users,
  ) {
    const comment = await this.commentRepository.findOne({
      where: {
        cardId,
        commentId,
      },
    });
    if (!comment) throw new NotFoundException('카드를 찾을 수 없습니다.');

    if (comment.userId !== user.userId) {
      throw new UnauthorizedException('삭제할 권한이 없습니다.');
    }

    const updatedComment = await this.commentRepository.update(
      commentId,
      updateCommentDto,
    );
    if (updatedComment.affected === 0) {
      throw new InternalServerErrorException();
    }

    return `성공적으로 업데이트 하였습니다.`;
  }

  async remove(commentId: number, cardId: number, user: Users) {
    const comment = await this.commentRepository.findOne({
      where: {
        cardId,
        commentId,
      },
    });
    if (!comment) throw new NotFoundException('카드를 찾을 수 없습니다.');

    if (comment.userId !== user.userId) {
      throw new UnauthorizedException('삭제할 권한이 없습니다.');
    }

    const deletedComment = await this.commentRepository.delete(commentId);

    if (deletedComment.affected === 0) {
      throw new InternalServerErrorException();
    }

    return `성공적으로 업데이트 하였습니다.`;
  }
}
