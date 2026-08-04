import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validate & strip DTOs globally.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Allow the frontend (Vercel in prod, localhost in dev) to call the API.
  app.enableCors({
    origin: process.env.CLIENT_URL?.split(',').map((o) => o.trim()) ?? true,
    credentials: true,
  });

  // Swagger API docs at /api-docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Marketplace API')
    .setDescription('B2B Textile Marketplace API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  // Render injects PORT; fall back to 4000 locally (Loadrive uses 3000).
  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
