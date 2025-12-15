import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { Review } from './Review';
import { Comment } from './Comment';
import { Subscription } from './Subscription';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ select: false })
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true, select: false })
  otp: string;

  @Column({ nullable: true })
  otpExpiresAt: Date;

  @Column({ nullable: true, select: false })
  refreshToken: string;

  @OneToMany(() => Review, (review) => review.author)
  reviews: Review[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];
}
