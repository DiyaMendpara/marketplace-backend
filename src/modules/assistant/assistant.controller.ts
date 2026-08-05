import { Body, Controller, Post } from '@nestjs/common';
import { AssistantService } from './assistant.service';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}
  @Post('chat') chat(@Body() body: { message?: string }) { return this.assistant.chat(body.message ?? ''); }
}
