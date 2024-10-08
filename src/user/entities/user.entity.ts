import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Role } from '../interface/user.interface';
import { BlogEntity } from 'src/blog/entities/blog.entity';
@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({ unique: true })
  username: string;
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;
  @Column({ type: 'enum', enum: Role, default: Role.User })
  roles: Role;
  @Column({ nullable: true })
  avatar: string;
  @OneToMany((type) => BlogEntity, (blog) => blog.author)
  blogEntries: BlogEntity[];

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }
}
