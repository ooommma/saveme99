import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CardStatus, ColorStatus } from '../types/card_status.enum';

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  description: string;

  @IsOptional()
  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsEnum(ColorStatus)
  color: ColorStatus;

  @IsOptional()
  @IsEnum(CardStatus)
  status: CardStatus;

  @IsOptional()
  @IsNumber()
  workerId?: number;
}
