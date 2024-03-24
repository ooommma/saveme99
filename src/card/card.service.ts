import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Column, Repository } from 'typeorm';
import { Cards } from '../card/entities/card.entity';
import { CreateCardDto } from './dto/create_card.dto';
import { UpdateCardDto } from './dto/update_card.dto';
import { Columns } from '../column/entities/column.entity';
import { BoardsService } from 'src/boards/boards.service';
import { ColumnService } from 'src/column/column.service';

const MIN_ORDER_INCREMENT = 0.0625;
const INITIAL_ORDER = 8192;
const LAST_CARD_MULTIPLIER = 1.1;
const DECIMAL_PRECISION = 0.001;

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Cards)
    private cardsRepository: Repository<Cards>,

    @InjectRepository(Columns)
    private columnRepository: Repository<Columns>,

    @Inject(BoardsService)
    private readonly boardService: BoardsService,
    @Inject(ColumnService)
    private readonly columnService: ColumnService,
  ) {}

  async getAllCards(columnId: number, orderValue: string): Promise<Cards[]> {
    const orderOptions = orderValue ? { order: { [orderValue]: 'ASC' } } : {};

    return await this.cardsRepository.find({
      where: { columnId: columnId },
      ...orderOptions,
    });
  }

  async findOneCards(columnId: number, cardId: number): Promise<Cards> {
    const card = await this.cardsRepository.findOne({
      where: { cardId: cardId, columnId: columnId },
    });
    if (!card) {
      throw new NotFoundException('해당 카드를 찾을 수 없습니다.');
    }
    return card;
  }

  async createCard(
    columnId: number,
    createCardDto: CreateCardDto,
  ): Promise<Cards> {
    const cards = await this.cardsRepository.find({
      where: {
        columnId,
      },
    });
    if (!cards) {
      throw new NotFoundException('해당 카드를 찾을 수 없습니다.');
    }
    const isColumnExist = await this.columnRepository.exists({
      where: {
        id: columnId,
      },
    });
    if (!isColumnExist) {
      throw new NotFoundException('해당 컬럼을 찾을 수 없습니다.');
    }
    let order: number;
    if (cards.length === 0) {
      order = 65536;
    } else {
      order = cards[cards.length - 1].order * 2;
    }
    const createCardDate = new Date();
    createCardDate.setHours(0, 0, 0, 0);

    const endDate = new Date(createCardDto.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < createCardDate) {
      throw new BadRequestException(
        '마감일은 카드생성일보다 이전으로 선택할 수 없습니다.',
      );
    }

    const newCard = this.cardsRepository.create({
      ...createCardDto,
      columnId,
      order: order,
    });
    await this.cardsRepository.save(newCard);
    return newCard;
  }

  async updateCard(
    columnId: number,
    cardId: number,
    updateCardDto: UpdateCardDto,
  ): Promise<Cards> {
    const card = await this.cardsRepository.findOne({
      where: { cardId: cardId, columnId: columnId },
      relations: ['column'],
    });

    if (!card) {
      throw new NotFoundException(`컬럼에 해당하는 카드가 없습니다`);
    }

    const createCardDate = new Date();
    createCardDate.setHours(0, 0, 0, 0);
    const endDate = new Date(updateCardDto.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < createCardDate) {
      throw new BadRequestException(
        '마감일은 카드생성일보다 이전으로 선택할 수 없습니다.',
      );
    }

    // 보드에 초대된 사용자 목록 조회
    const boardId = card.column.boardId; // 카드가 속한 컬럼에서 보드 Id 가져오기
    const invitedUsers = await this.boardService.getInviteUsers(boardId); // 의존성주입

    if (
      updateCardDto.workerId &&
      !invitedUsers.some((user) => user.userId === updateCardDto.workerId)
    ) {
      throw new BadRequestException('이 유저는 이 보드에 초대된 멤버 아닙니다');
    }

    // worker Id 유효하면 할당하기
    const updatedCard = this.cardsRepository.merge(card, updateCardDto);
    await this.cardsRepository.save(updatedCard);

    return updatedCard;
  }

  async deleteCard(columnId: number, cardId: number): Promise<void> {
    const card = await this.cardsRepository.findOne({
      where: { cardId: cardId, columnId: columnId },
    });
    if (!card) {
      throw new NotFoundException('해당 카드를 찾을 수 없습니다.');
    }
    await this.cardsRepository.delete({ cardId: cardId, columnId: columnId });
  }

  async moveCard(columnId: number, moveCardId: number, cards) {
    const { betweenCards } = cards;

    // 카드 찾기
    const findCard = await this.cardsRepository.findOneBy({
      cardId: moveCardId,
      columnId,
    });

    if (!findCard) {
      throw new NotFoundException('해당 카드를 찾을 수 없습니다.');
    }

    const allCards = await this.getAllCards(findCard.columnId, 'order');

    // betweenCards.length가 1인 경우의 로직
    if (betweenCards.length === 1) {
      this.OrderForSingleBetweenCard(findCard, betweenCards[0], allCards);
    } else {
      // betweenCards.length가 1이 아닌 경우의 로직
      await this.OrderForMultipleBetweenCards(findCard, betweenCards, columnId);
    }

    // 카드 순서 업데이트
    await this.cardsRepository.update(findCard.cardId, {
      order: findCard.order,
    });
  }

  async OrderForSingleBetweenCard(
    findCard: Cards,
    betweenCardId: number,
    allCards: Cards[],
  ) {
    if (allCards[0].cardId === betweenCardId) {
      if (
        allCards[0].order <= MIN_ORDER_INCREMENT &&
        findCard.cardId !== allCards[0].cardId
      ) {
        findCard.order = INITIAL_ORDER;
      } else if (findCard.cardId !== allCards[0].cardId) {
        findCard.order = allCards[0].order / 2;
      }
    } else if (allCards[allCards.length - 1].cardId === betweenCardId) {
      findCard.order =
        allCards[allCards.length - 1].order * LAST_CARD_MULTIPLIER;
    }
  }

  async OrderForMultipleBetweenCards(
    findCard: Cards,
    betweenCards: number[],
    columnId: number,
  ) {
    const betweenCardOrders = await Promise.all(
      betweenCards.map((cardId) =>
        this.cardsRepository.findOneBy({ cardId, columnId }),
      ),
    );

    if (betweenCardOrders.some((card) => !card)) {
      throw new NotFoundException('하나 이상의 카드를 찾을 수 없습니다.');
    }

    let newOrder =
      (betweenCardOrders[0].order + betweenCardOrders[1].order) / 2;
    const decimal = newOrder % 1;

    if (decimal !== 0) {
      if (decimal < MIN_ORDER_INCREMENT) {
        newOrder = Math.floor(newOrder) + 1;
      } else if (decimal % MIN_ORDER_INCREMENT !== 0) {
        newOrder = Math.floor(newOrder) + Number(decimal.toFixed(3));
      }
    }

    findCard.order = newOrder;
  }
}
