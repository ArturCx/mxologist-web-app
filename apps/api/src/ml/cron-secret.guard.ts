import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';
import { Request } from 'express';

// Vercel Cron calls the endpoint with `Authorization: Bearer $CRON_SECRET`
// (it adds the header on its own once the env var exists on the project).
// No secret configured means the endpoint is closed, not open.
@Injectable()
export class CronSecretGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const secret = process.env.CRON_SECRET;
    const header = context.switchToHttp().getRequest<Request>()
      .headers.authorization;
    if (!secret || !header) throw new UnauthorizedException();

    const expected = Buffer.from(`Bearer ${secret}`);
    const received = Buffer.from(header);
    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
