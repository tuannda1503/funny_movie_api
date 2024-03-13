import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'movies' })
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ length: 2000 })
  description?: string;

  @Column()
  url?: string;

  @Column()
  userId?: number;

  @Column()
  like?: number;

  @Column()
  dislike?: number;

  @Column()
  email?: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}
