import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export default abstract class EntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  created: Date;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  modified: Date;
}
