import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/user/interface/user.interface';
import { Blog } from './interfaces/blog.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { Like, Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

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
  async findAll(
    options: IPaginationOptions,
    search,
  ): Promise<Pagination<BlogEntity>> {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const whereConditions = [];

    if (search.title) {
      whereConditions.push({ title: Like(`%${search.title}%`) });
    }

    if (search.body) {
      whereConditions.push({ body: Like(`%${search.body}%`) });
    }
    const [results, total] = await this.blogRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
      select: [
        'id',
        'title',
        'body',
        'headerImage',
        'likes',
        'updatedAt',
        'createdAt',
      ],
      where: whereConditions.length ? whereConditions : {},
    });
    return {
      items: results,
      meta: {
        totalItems: total,
        itemCount: results.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }
  async findByUser(
    options: IPaginationOptions,
    userId,
  ): Promise<Pagination<BlogEntity>> {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const [results, total] = await this.blogRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
      where: {
        author: { id: userId },
      },
      relations: ['author'],
    });
    return {
      items: results,
      meta: {
        totalItems: total,
        itemCount: results.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
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
