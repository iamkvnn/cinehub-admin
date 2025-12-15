import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Film } from './Film';
import { Review } from './Review';
import { CommentReport } from './CommentReport';

@Entity('comment')
export class Comment extends BaseEntity {
  @Column()
  content: string;

  @Column({ default: 0 })
  totalLikes: number;

  @Column({ default: 0 })
  totalDislikes: number;

  @Column({ nullable: true })
  season: number;

  @Column({ nullable: true })
  episode: number;

  @Column({ nullable: true })
  parentId: string;

  @Column()
  authorId: string;

  @Column()
  filmId: string;

  @Column({ nullable: true })
  reviewId: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => Film, (film) => film.comments)
  @JoinColumn({ name: 'filmId' })
  film: Film;

  @ManyToOne(() => Review)
  @JoinColumn({ name: 'reviewId' })
  review: Review;

  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @OneToMany(() => CommentReport, (report) => report.comment)
  reports: CommentReport[];
}
