import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { CommunicationService } from './communication.service';

@Controller()
export class AppController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Get()
  validateToken(@Query() query: any): string {
    console.log(query);
    if (query['hub.verify_token'] === 'olimpia_gaming') {
      return query['hub.challenge'];
    }

    return 'Error, wrong token';
  }

  @Post('webhook')
  async postMessage(@Body() body: any): Promise<string> {
    const messaging_events = body.entry[0].messaging;

    for (let i = 0; i < messaging_events.length; i++) {
      const event = body.entry[0].messaging[i];
      const sender = event.sender.id;

      if (event.message && event.message.text) {
        this.communicationService.handleMessage(sender, event.message.text);
      }
    }
    return 'OK';
  }
}
