// Must run before anything reads process.env (Clerk secret key, DB url, etc).
// Nest doesn't load .env on its own and there's no ConfigModule here, so we
// load apps/api/.env explicitly from the working directory.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // Allowed front-end origins. WEB_APP_URL may be a single origin or a
  // comma-separated list, e.g. "https://mxologist.com,https://mxologist.vercel.app".
  const allowedOrigins = (process.env.WEB_APP_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // No Origin header = same-origin / curl / server-to-server — allow it.
      // Otherwise only echo back origins on the allowlist.
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
