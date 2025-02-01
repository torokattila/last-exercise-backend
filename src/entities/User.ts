import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import EntityBase from './EntityBase';
import Exercise from './Exercise';

@Entity({ name: 'users' })
export default class User extends EntityBase {
  @Column({ name: 'google_id', nullable: true })
  googleId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ nullable: true })
  password: string;

  @OneToMany(() => Exercise, (exercise) => exercise.user)
  exercises: Exercise[];

  @OneToOne(() => Exercise, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'last_exercise_id' })
  lastExercise: Exercise;

  @Column({ name: 'last_exercise_id', nullable: true })
  lastExerciseId: string;

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
  exerciseHistory: { date: string; exerciseId: string }[];
}
