import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsNotEmpty({ message: '보드이름을 입력해 주세요' })
  @IsString()
  name: string;

  @IsString()
  color: string;

  @IsString()
  description: string;
}
