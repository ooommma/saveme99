import { PartialType } from '@nestjs/mapped-types';
import { CreateUtilDto } from './create-util.dto';

export class UpdateUtilDto extends PartialType(CreateUtilDto) {}
