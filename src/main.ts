import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Register parsers before Nest's request pipeline so large product image
  // payloads are accepted instead of being rejected by Express' default limit.
  app.use(json({ limit: process.env.JSON_BODY_LIMIT ?? '50mb' }));
  app.use(
    urlencoded({
      extended: true,
      limit: process.env.JSON_BODY_LIMIT ?? '50mb',
    }),
  );

  // Validate & strip DTOs globally (matches Loadrive's pipe config).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Allow the frontend to call the API. Auth uses Bearer tokens (not cookies),
  // so reflecting any origin is safe here and avoids CLIENT_URL misconfig issues.
  app.enableCors({
    origin: true,
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
