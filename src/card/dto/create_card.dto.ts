import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { ColorStatus } from '../card_status.enum';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요' })
  name: string;

  @IsString()
  @MaxLength(100)
  @IsNotEmpty({ message: '내용을 적어주세요.' })
  description: string;

  @IsDateString()
  @IsNotEmpty({ message: '마감일을 입력해주세요.' })
  endDate: Date;

  @IsEnum(ColorStatus)
  color: ColorStatus;
}
