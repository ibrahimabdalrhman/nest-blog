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
import { LoginDto } from 'src/auth/dto/login.dto';
import { SignupDto } from 'src/auth/dto/signup.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('signup')
  create(@Body() user: SignupDto) {
    return this.userService.create(user);
  }
  @Post('login')
  login(@Body() login: LoginDto) {
    return this.userService.login(login);
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
