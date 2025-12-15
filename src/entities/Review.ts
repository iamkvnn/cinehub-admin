import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Film } from './Film';
import { ReviewReport } from './ReviewReport';

@Entity('review')
export class Review extends BaseEntity {
  @Column()
  content: string;

  @Column({ type: 'float', default: 0 })
  rating: number;

  @Column({ default: 0 })
  totalLikes: number;

  @Column({ default: 0 })
  totalDislikes: number;

  @Column()
  authorId: string;

  @Column()
  filmId: string;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => Film, (film) => film.reviews)
  @JoinColumn({ name: 'filmId' })
  film: Film;

  @OneToMany(() => ReviewReport, (report) => report.review)
  reports: ReviewReport[];
}
