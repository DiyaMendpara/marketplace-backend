import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow the frontend (Vercel in prod, localhost in dev) to call the API.
  app.enableCors({
    origin: process.env.CLIENT_URL?.split(',').map((o) => o.trim()) ?? true,
    credentials: true,
  });

  // Render injects PORT; fall back to 4000 locally (Loadrive uses 3000).
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
