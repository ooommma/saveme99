import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  // JoinColumn,
  // ManyToOne,
  // OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ColorStatus } from '../card_status.enum';

@Entity({ name: 'cards' })
export class Cards extends BaseEntity {
  @PrimaryGeneratedColumn()
  cardId: number;

  @PrimaryGeneratedColumn()
  columnId: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  description: string;

  @Column({ type: 'enum', enum: ColorStatus, default: ColorStatus.RED })
  color: ColorStatus;

  @Column({ type: 'bigint', nullable: false })
  worker: number;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  //   @ManyToOne(() => Columns, (Column) => Column.card)
  //   @JoinColumn({ name: 'columnId' })
  //   column: Columns;

  //   @OneToMany(() => Comment, (comment) => comment.card)
  //   @JoinColumn({ name: 'commentId' })
  //   comment: Comment;
}
