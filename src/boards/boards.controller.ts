import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { User } from 'src/auth/entities/auth.entity';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { InviteDto } from './dto/invite-board.dto';

@ApiTags('보드 정보')
@UseGuards(AuthGuard('jwt'))
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  /**
   * 보드 생성
   * @param createBoardDto
   * @returns
   */
  @Post()
  async create(@GetUser() user: User, @Body() createBoardDto: CreateBoardDto) {
    const data = await this.boardsService.create(user, createBoardDto);

    return {
      statusCode: HttpStatus.CREATED,
      message: '보드 생성에 성공했습니다.',
      data,
    };
  }

  /**
   * 보드 전체 목록 조회
   * @returns
   */
  @Get()
  async findAll(@GetUser() user: User) {
    const userId = user.userId;
    const data = await this.boardsService.findAll(userId);

    return {
      statusCode: HttpStatus.OK,
      message: '보드 조회에 성공했습니다.',
      data,
    };
  }

  /**
   * 보드 상세 조회
   * @returns
   */
  @Get(':boardId')
  async findOne(@GetUser() user: User, @Param('boardId') id: string) {
    const userId = user.userId;
    const data = await this.boardsService.findOne(userId, +id);

    return {
      statusCode: HttpStatus.OK,
      message: '보드 상세 조회에 성공했습니다.',
      data,
    };
  }

  /**
   * 보드 수정
   * @param id
   * @returns
   */
  @Patch(':boardId')
  async update(@GetUser() user: User, @Param('boardId') id: string, @Body() createBoardDto: CreateBoardDto) {
    const userId = user.userId;
    const isUserBoard = await this.boardsService.isUserBoard(userId, +id);
    if (!isUserBoard) {
      throw new BadRequestException('수정 권한이 없는 보드입니다.');
    }

    await this.boardsService.update(+id, createBoardDto);

    return {
      statusCode: HttpStatus.OK,
      message: '보드 수정에 성공했습니다.',
    };
  }

  /**
   * 보드 삭제
   * @param id
   * @returns
   */
  @Delete(':boardId')
  async remove(@GetUser() user: User, @Param('boardId') id: string) {
    await this.boardsService.remove(user, +id);

    return {
      statusCode: HttpStatus.OK,
      message: '보드 삭제에 성공했습니다.',
    };
  }

  /**
   * 보드 초대
   * @returns
   */
  @Post('invite')
  async inviteUserToBoard(@Body() inviteDto: InviteDto) {
    const { boardId, email } = inviteDto;

    const user = await this.boardsService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('이메일이 존재하지 않습니다.');
    }

    await this.boardsService.inviteUserToBoard(boardId, user);

    return {
      statusCode: HttpStatus.OK,
      message: '초대에 성공하였습니다.',
    };
  }
}
