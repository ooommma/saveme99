import { Injectable } from '@nestjs/common';
import { Cards } from './entities/card.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCardDto } from './dto/create_card.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Cards) private cardRepository: Repository<Cards>,
  ) {}

  async createCard(createCardDto: CreateCardDto): Promise<number> {
    return (await this.cardRepository.save(createCardDto)).cardId;
  }
}
