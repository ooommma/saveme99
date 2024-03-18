import { Boards } from 'src/boards/entities/board.entity';
import { ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export class Columns {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Boards, (bord) => bord.column, { cascade: true })
  board: Boards;
}
