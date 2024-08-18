import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Role } from 'src/user/interface/user.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserIsUserGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user.user;
    console.log(user);
    console.log(request.params);
    if (user.roles === Role.Admin) {
      return true;
    }
    if (user.id == request.params.id) {
      return true;
    }
    return false;
  }
}
