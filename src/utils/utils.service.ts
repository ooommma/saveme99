import { Injectable } from '@nestjs/common';
import { CreateUtilDto } from './dto/create-util.dto';
import { UpdateUtilDto } from './dto/update-util.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UtilsService {
  getUUID(): string {
    return uuidv4();
  }
}
