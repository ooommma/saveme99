import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  // UseGuards,
} from '@nestjs/common';
import { CardService } from './card.service';
// import { AuthGuard } from '@nestjs/passport';
import { CreateCardDto } from './dto/create_card.dto';
import { UpdateCardDto } from './dto/update_card.dto';

// @UseGuards(AuthGuard('jwt'))
@Controller(':columnId/cards')
export class CardController {
  constructor(private cardService: CardService) {}

  @Get('')
  async getAllCards(@Param('columnId') columnId: number) {
    return await this.cardService.getAllCards(columnId);
  }

  @Get(':cardId')
  async findOneCards(
    @Param('columnId') columnId: number,
    @Param('cardId') cardId: number,
  ) {
    return await this.cardService.findOneCards(columnId, cardId);
  }

  @Post('')
  async createCard(@Body() createCardDto: CreateCardDto) {
    return await this.cardService.createCard(createCardDto);
  }

  // { columnId, cardId } 타입 보류
  @Patch(':cardId')
  async update(@Param() { columnId, cardId }, updateCardDto: UpdateCardDto) {
    return this.cardService.updateCard(columnId, cardId, updateCardDto);
  }

  @Delete(':cardId')
  async delete(@Param('cardId') cardId: number) {
    return this.cardService.deleteCard(cardId);
  }
}
