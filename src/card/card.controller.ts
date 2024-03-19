import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CardService } from './card.service';
import { AuthGuard } from '@nestjs/passport';
import { Cards } from '../card/entities/card.entity';
import { CreateCardDto } from './dto/create_card.dto';
import { UpdateCardDto } from './dto/update_card.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('cards')
export class CardController {
  constructor(private cardService: CardService) {}

  //   @Get('/:columnId')
  //   async getAllCards(@Param('columnId') columnId: number) {
  //     return await this.cardService.getAllcards(columnId);
  //   }

  //   @Get('/:columnId/:cardId')
  //   async findOneCards(@Param() Param: number[]) {
  //     return await this.cardService.findOneCards(columnId, cardId);
  //   }

  @Post('/:columnId')
  async createCard(
    @Param('columId') columnId: number,
    @Body() createCardDto: CreateCardDto,
  ) {
    return await this.cardService.createCard(createCardDto);
  }

  //   @Patch('/:columnId/:cardId')
  //   async update(@Param() Param: number[], @Body updateCardDto: UpdateCardDto) {
  //     return this.cardService.update(columnId, cardId, updateCardDto);
  //   }

  //   @Delete('/:columnId/:cardId')
  //   async delete(@Param() Param: number[]) {
  //     return this.cardService.delete(columnId, cardId);
  //   }
}
