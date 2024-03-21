import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty({ message: '내용을 적어주세요.' })
  content: string;
}
