import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
  find(@Query('userId') userId: number) {
    if (userId == null) {
      return this.blogService.findAll();
    } else {
      return this.blogService.findByUser(userId);
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
