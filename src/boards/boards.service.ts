import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/user/entities/users.entity';
import { Repository } from 'typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { Boards } from './entities/board.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
    @InjectRepository(Boards)
    private readonly boardRepository: Repository<Boards>,
  ) {}

  async create(user: Users, createBoardDto: CreateBoardDto) {
    const board = await this.boardRepository.save({
      ...createBoardDto,
      ...user,
    });
    return board;
  }

  async findAll(userId: number) {
    console.log(userId);
    return await this.boardRepository.find({
      where: { userId },
    });
  }

  async findOne(userId: number, id: number) {
    const findOneBoard = await this.boardRepository.findOne({
      where: { id, userId },
      relations: ['invitedUsers'],
    });

    if (!findOneBoard) {
      throw new BadRequestException('존재하지 않는 보드입니다.');
    }

    return {
      ...findOneBoard,
      userId,
    };
  }

  async isUserBoard(userId: number, id: number): Promise<boolean> {
    const board = await this.boardRepository.findOne({
      where: { id, userId },
    });
    return !!board; // 보드가 존재하면 true, 아니면 false 반환
  }

  async update(id: number, createBoardDto: CreateBoardDto) {
    const findBord = await this.boardRepository.findOne({
      where: { id },
    });

    if (!findBord) throw new BadRequestException('존재하지 않는 보드입니다.');

    const updateBoard = await this.boardRepository.update(
      { id },
      createBoardDto,
    );
    return updateBoard;
  }

  async remove(user: Users, id: number) {
    const findBord = await this.boardRepository.findOne({
      where: { id },
    });

    if (!findBord) throw new BadRequestException('존재하지 않는 보드입니다.');

    if (findBord.userId !== user.userId) {
      throw new BadRequestException('삭제할 권한이 없습니다.');
    }

    const deleteBoard = await this.boardRepository.delete({ id });

    return deleteBoard;
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async inviteUserToBoard(boardId: number, user: Users) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['invitedUsers'],
    });
    if (!board) {
      throw new BadRequestException('보드가 존재하지 않습니다.');
    }

    // 이미 초대된 사용자인지 확인
    const isMember = board.invitedUsers.some(
      (invitedUser) => invitedUser.userId === user.userId,
    );
    if (isMember) {
      throw new BadRequestException('이미 보드에 초대된 사용자입니다.');
    }

    // 초대된 사용자 추가
    board.invitedUsers.push(user);
    await this.boardRepository.save(board);
  }
}
