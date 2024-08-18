import { Injectable } from '@nestjs/common';
import { User } from 'src/user/interface/user.interface';
import { Blog } from './interfaces/blog.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private readonly blogRepository: Repository<BlogEntity>,
    private userService: UserService,
  ) {}

  async createBlog(user: User, blogEntity: Blog): Promise<Blog> {
    blogEntity.author = user;
    return await this.blogRepository.save(blogEntity);
  }
  async findAll(): Promise<Blog[]> {
    return await this.blogRepository.find({ relations: ['author'] });
  }
  async findByUser(userId: number): Promise<Blog[]> {
    return await this.blogRepository.find({
      where: {
        author: { id: userId },
      },
      relations: ['author'],
    });
  }
  async findById(id: number): Promise<Blog> {
    return await this.blogRepository.findOne({
      where: { id },
      relations: ['author'],
    });
  }
}
