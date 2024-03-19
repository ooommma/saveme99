import { PartialType } from '@nestjs/mapped-types';
import { CreateAwDto } from './create-aw.dto';

export class UpdateAwDto extends PartialType(CreateAwDto) {}
