import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import EntityBase from './EntityBase';
import ExerciseType from './ExerciseType';
import User from './User';

@Entity({ name: 'exercises' })
export default class Exercise extends EntityBase {
  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.exercises, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ nullable: true })
  duration: string;

  @OneToMany(() => ExerciseType, (exerciseType) => exerciseType.exercise)
  exerciseTypes: ExerciseType[];

  @Column({ name: 'card_color', default: '#005A92' })
  cardColor: string;

  @Column({ name: 'text_color', default: '#fff' })
  textColor: string;

  @Column({ name: 'order', default: 1 })
  order: number;
}
