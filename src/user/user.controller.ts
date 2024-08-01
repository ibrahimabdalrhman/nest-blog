import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './interface/user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  create(@Body() user: User) {
    return this.userService.create(user);
  }
  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Delete(':id')
  deleteOne(@Param() id: number) {
    return this.userService.deleteOne(id);
  }
  @Patch(':id')
  updateOne(@Param() id: number, @Body() user: User) {
    return this.userService.updateOne(id, user);
  }
}
