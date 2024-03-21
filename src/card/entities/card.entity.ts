import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CardStatus, ColorStatus } from '../types/card_status.enum';
import { Columns } from 'src/column/entities/column.entity';
@Entity({ name: 'cards' })
export class Cards extends BaseEntity {
  @PrimaryGeneratedColumn()
  cardId: number;

  @Column({ type: 'float', nullable: false })
  order: number;

  @Column()
  columnId: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  description: string;

  @Column({ type: 'enum', enum: ColorStatus, default: ColorStatus.RED })
  color: ColorStatus;

  @Column({ type: 'enum', enum: CardStatus, default: CardStatus.STANDBY })
  status: CardStatus;

  @Column({ type: 'bigint', nullable: false })
  worker: number;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Columns, (Column) => Column.cards)
  @JoinColumn({ name: 'columnId' })
  column: Columns;

  // @OneToMany(() => Comment, (comment) => comment.card)
  // @JoinColumn({ name: 'commentId' })
  // comment: Comment;
}
