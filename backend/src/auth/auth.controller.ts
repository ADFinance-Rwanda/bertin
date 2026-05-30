import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser, JwtUser } from './current-user.decorator';

@ApiTags('auth')
@ApiBearerAuth('access-token')
@Controller('api')
export class AuthController {
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile from JWT claims' })
  getMe(@CurrentUser() user: JwtUser) {
    return {
      id: user.sub,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    };
  }
}
