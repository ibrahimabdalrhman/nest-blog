import { UserEntity } from 'src/user/entities/user.entity';
import {
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
@Entity()
export class BlogEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column({ default: '' })
  body: string;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updateAt: Date;
  @BeforeUpdate()
  UpdateTimestamp() {
    this.updateAt = new Date();
  }
  @Column({ default: 0 })
  likes: number;
  @Column()
  headerImage: string;
  @ManyToOne((type) => UserEntity, (user) => user.blogEntries)
  auther: UserEntity;
}
