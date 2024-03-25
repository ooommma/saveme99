import { PickType } from '@nestjs/mapped-types';
import { Columns } from '../entities/column.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateColumnDto extends PickType(Columns, ['name']) {
  @IsNotEmpty({ message: '이름을 입력해주세요' })
  @IsString()
  name: string;
}
