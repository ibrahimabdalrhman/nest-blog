import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { Blog } from './interfaces/blog.interface';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { BlogEntity } from './entities/blog.entity';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';

@Controller('blogs')
export class BlogController {
  constructor(private blogService: BlogService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() blogEntity: Blog, @Request() req): Promise<Blog> {
    return this.blogService.createBlog(req.user.user, blogEntity);
  }

  @Get()
  find(
    @Query('userId') userId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ): Promise<Pagination<BlogEntity>> {
    const options: IPaginationOptions = {
      page,
      limit,
    };
    if (userId == null) {
      const filter = { body: search || '', title: search || '' };
      return this.blogService.findAll(options, filter);
    } else {
      return this.blogService.findByUser(options, userId);
    }
  }
  @Get(':id')
  findById(@Param('id') id: number): Promise<Blog> {
    return this.blogService.findById(id);
  }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  Update(
    @Param('id') id: number,
    @Body() blogEntity: Blog,
    @Request() req,
  ): Promise<Blog> {
    return this.blogService.updateOne(id, blogEntity, req.user.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  Delete(@Param('id') id: number, @Request() req) {
    return this.blogService.deleteOne(
      id,
      req.user.user.id,
      req.user.user.roles,
    );
  }
}
