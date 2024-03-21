import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import { CardService } from './card.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCardDto } from './dto/create_card.dto';
import { UpdateCardDto } from './dto/update_card.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'))
@Controller(':columnId/cards')
export class CardController {
  constructor(private cardService: CardService) {}

  @Get('')
  async getAllCards(
    @Param('columnId') columnId: number,
    @Query('orderValue') orderValue: string,
  ) {
    return await this.cardService.getAllCards(columnId, orderValue);
  }

  @Get(':cardId')
  async findOneCards(
    @Param('columnId') columnId: number,
    @Param('cardId') cardId: number,
  ) {
    return await this.cardService.findOneCards(columnId, cardId);
  }
  @Post()
  async createCard(
    @Param('columnId') columnId: number,
    @Body() createCardDto: CreateCardDto,
  ) {
    return await this.cardService.createCard(columnId, createCardDto);
  }

  @Patch(':cardId')
  async updateCard(
    @Param('columnId') columnId: number,
    @Param('cardId') cardId: number,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.cardService.updateCard(columnId, cardId, updateCardDto);
  }

  @Delete(':cardId')
  async deleteCard(
    @Param('columnId') columnId: number,
    @Param('cardId') cardId: number,
  ) {
    const card = await this.cardService.deleteCard(columnId, cardId);
    return {
      statusCode: HttpStatus.OK,
      message: '카드가 정상적으로 삭제되었습니다.',
      card,
    };
  }

  @Put(':cardId')
  async moveCard(
    @Param('columnId') columnId: number,
    @Param('cardId') cardId: number,
    @Body() betweenCards: number[],
  ) {
    const updatedCard = await this.cardService.moveCard(
      columnId,
      cardId,
      betweenCards,
    );
    return updatedCard;
  }
}
