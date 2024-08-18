import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { Blog } from './interfaces/blog.interface';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('blogs')
export class BlogController {
  constructor(private blogService: BlogService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() blogEntity: Blog, @Request() req): Promise<Blog> {
    return this.blogService.createBlog(req.user.user, blogEntity);
  }

  @Get()
  findBlogEntries(@Query('userId') userId: number) {
    if (userId == null) {
      return this.blogService.findAll();
    } else {
      return this.blogService.findByUser(userId);
    }
  }
  @Get(':id')
  findById(@Param('id') id: string): Promise<Blog> {
    const blogId = parseInt(id, 10); // Convert to a number
    return this.blogService.findById(blogId);
  }
}
