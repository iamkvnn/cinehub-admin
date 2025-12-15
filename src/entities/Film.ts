import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Review } from './Review';
import { Comment } from './Comment';

export enum FilmStatus {
  UPCOMING = 'UPCOMING',
  RELEASING = 'RELEASING',
  ENDED = 'ENDED',
}

export enum FilmType {
  MOVIE = 'MOVIE',
  SERIES = 'SERIES',
}

export enum AgeLimit {
  ALL = 'ALL',
  P = 'P',
  K = 'K',
  T13 = 'T13',
  T16 = 'T16',
  T18 = 'T18',
}

@Entity('film')
export class Film extends BaseEntity {
  @Column()
  title: string;

  @Column({ unique: true })
  originalTitle: string;

  @Column({ unique: true })
  englishTitle: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  views: number;

  @Column({ type: 'float', default: 0 })
  userRating: number;

  @Column({ type: 'enum', enum: AgeLimit, default: AgeLimit.ALL })
  ageLimit: AgeLimit;

  @Column()
  country: string;

  @Column({ type: 'float', default: 0 })
  imdbRating: number;

  @Column({ type: 'timestamp' })
  releaseDate: Date;

  @Column({ type: 'enum', enum: FilmStatus, default: FilmStatus.UPCOMING })
  status: FilmStatus;

  @Column({ type: 'enum', enum: FilmType, default: FilmType.MOVIE })
  type: FilmType;

  @OneToMany(() => Review, (review) => review.film)
  reviews: Review[];

  @OneToMany(() => Comment, (comment) => comment.film)
  comments: Comment[];
}
