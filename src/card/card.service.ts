import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cards } from './entities/card.entity';
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
    const Card = await this.cardsRepository.findOne({
      where: { cardId: cardId, columnId: columnId },
    });
    if (!Card) {
      throw new NotFoundException('해당 카드를 찾을 수 없습니다.');
    }
    return Card;
  }

  async createCard(
    // columnId: number,
    createCardDto: CreateCardDto,
  ): Promise<Cards> {
    const newCard = this.cardsRepository.create({
      name: createCardDto.name,
      description: createCardDto.description,
      endDate: createCardDto.endDate,

      // columnId,
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
      throw new NotFoundException('해당 카드를 찾을 수 없습니다.');
    }

    const updatedCard = this.cardsRepository.merge(card, updateCardDto);
    await this.cardsRepository.save(updatedCard);
    return updatedCard;
  }

  async deleteCard(cardId: number): Promise<void> {
    await this.cardsRepository.delete({ cardId: cardId });
  }
}
