import { IsNotEmpty, IsEmail } from 'class-validator';

export class InviteDto {
  boardId: number;

  @IsNotEmpty({ message: '초대할 유저의 이메일을 입력해 주세요' })
  @IsEmail()
  email: string;
}
