import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
  async updateOne(
    id: number,
    blogEntity: Blog,
    loggedUserId: number,
  ): Promise<Blog> {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!blog) {
      throw new NotFoundException(`Not found Blog for this id :  ${id}`);
    }
    if (blog.author.id !== loggedUserId) {
      throw new UnauthorizedException(`You Not Allowed to update this Blog`);
    }

    await this.blogRepository.update(id, blogEntity);
    const updatedBlog = await this.blogRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    return updatedBlog;
  }
  async deleteOne(id: number, loggedUserId: number, loggedUserRole: string) {
    const blog = await this.blogRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!blog) {
      throw new NotFoundException(`Not found Blog for this id :  ${id}`);
    }
    if (blog.author.id !== loggedUserId) {
      if (loggedUserRole !== 'admin') {
        throw new UnauthorizedException(`You Not Allowed to delete this Blog`);
      }
    }

    return await this.blogRepository.delete(id);
  }
}
