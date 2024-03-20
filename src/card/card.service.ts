import { Injectable, NotFoundException } from '@nestjs/common';

import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cards } from '../card/entities/card.entity';
import { CreateCardDto } from './dto/create_card.dto';
import { UpdateCardDto } from './dto/update_card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Cards)
    private cardsRepository: Repository<Cards>,
  ) {}

  async getAllCards(columnId: number): Promise<Cards[]> {
    return await this.cardsRepository.find({ where: { columnId: columnId } });
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

  // async moveCard(moveCardId: number, betweenCards: number[]) {
  //   //일단 betweenCards의 length가 2개일 경우의 로직
  //   const findCard = await this.cardRepository.findOneBy({ cardId: moveCardId });
  //   if (!findCard) {
  //     throw new NotFoundException('해당 카드를 찾을 수 없습니다.');
  //   }
  //   const betCardsPos = await Promise.all(
  //     betweenCards.map(async (cardId) => {
  //       const card = await this.cardRepository.findOneBy({ cardId });
  //       return card;
  //     }),
  //   ); // pos 순서값
  //   const cardToMovePos = (betCardsPos[0].pos + betCardsPos[1].pos) / 2;

  //   if (cardToMovePos <= 0.0625) {
  //     const allCards = await this.getAllCards(findCard.columnId);
  //     let newPos = 65536;
  //     for (const card of allCards.slice(1)) {
  //       await this.cardRepository.update(card.cardId, { pos: newPos });
  //       newPos *= 1.1;
  //     }
  //   }

  //   const cardToMoveDao = { cardId: moveCardId, pos: cardToMovePos };

  //   const movedCard = await this.cardRepository.update(findCard.cardId, {
  //     pos: cardToMovePos,
  //   });

  //   //만약 betweenCards의 length가 1이라면
  //   //일단 1인 경우는 처음 아니면 마지막 밖에 없기 때문에 일단 검색
  //   const allCards = await this.getAllCards(findCard.columnId);
  //   orderby: pos;
  //   //만약 모든 카드들 중 첫번째와 betweenCards의 아이디 값이 같다면
  //   if (allCards[0].cardId === betweenCards[0]) {
  //     //모든 카드들 중 첫번째 카드의 값이 0.0625 이하이고, 카드 ID가 일치하지 않는다면
  //     if (allCards[0].pos <= 0.0625 && findCard.cardId !== allCards[0].cardId) {
  //       findCard.pos = 8192; // 이동하려는 카드의 pos 초기화
  //       allCards[0].pos = allCards[1].pos / 2;
  //       //그래도 아직 0.0625보다는 큰 경우
  //     } else if (allCards[0].pos > 0.0625 && findCard.cardId !== allCards[0].cardId) {
  //       let curPos = allCards[0].pos;
  //       allCards[0].pos = allCards[1].pos / 2;
  //       findCard.pos = curPos / 2; // 이동하려는 카드의 pos 조정
  //     }
  //     //만약 모든 카드들 중 마지막과 betweenCards의 아이디 값이 같다면
  //   } else if (allCards[allCards.length - 1].cardId === betweenCards[0]) {
  //     findCard.pos = allCards[allCards.length - 1].pos * 1.1;
  //   }
  // }
}
