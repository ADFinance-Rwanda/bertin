import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

interface KeycloakJwtPayload {
  sub: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles: string[] };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: config.get<string>(
          'KEYCLOAK_JWKS_URI',
          'http://keycloak:8080/realms/task-manager/protocol/openid-connect/certs',
        ),
      }),
      algorithms: ['RS256'],
      issuer: config.get<string>(
        'KEYCLOAK_REALM_URL',
        'http://localhost:6353/realms/task-manager',
      ),
    });
  }

  async validate(payload: KeycloakJwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token: missing sub claim');
    }
    return {
      sub: payload.sub,
      email: payload.email ?? payload.preferred_username ?? '',
      firstName: payload.given_name ?? '',
      lastName: payload.family_name ?? '',
      roles: payload.realm_access?.roles ?? [],
    };
  }
}
