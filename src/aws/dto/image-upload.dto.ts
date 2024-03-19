import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ImageUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
