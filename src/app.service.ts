import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}


/**
 * 1. 12345 5 -> 3
 * order : 5 ->  order : 3
 * 3 >= 
 * 1씩 다 더해준다
 * 
 */
