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
}
