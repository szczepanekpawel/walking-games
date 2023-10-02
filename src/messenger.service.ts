import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class MessengerService {
  constructor(private httpService: HttpService) {}

  async sendImageMessage(sender: number, image?: string) {
    const messageData = {
      attachment: {
        type: 'image',
        payload: {
          url:
            'https://img.freepik.com/free-photo/red-luxury-sedan-road_114579-5079.jpg' ||
            image,
        },
      },
    };

    this.sendData(sender, messageData);
  }

  async sendTextMessage(sender: number, text: string | string[]) {
    if (Array.isArray(text)) {
      for (const iterator of text) {
        await this.sendData(sender, {
          text: iterator,
        });
      }
    } else {
      this.sendData(sender, {
        text: text,
      });
    }
  }

  private async sendData(
    recipientId: number,
    message: object,
  ): Promise<unknown> {
    const token = process.env.PAGE_ACCESS_TOKEN;

    const { data } = await firstValueFrom(
      this.httpService
        .post(
          'https://graph.facebook.com/v2.6/me/messages',
          {
            recipient: { id: recipientId },
            message,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            params: { access_token: token },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw error.response.data;
          }),
        ),
    );

    if (data?.body?.error) {
      console.log('Error: ', data.body.error);
    }

    return data;
  }
}
