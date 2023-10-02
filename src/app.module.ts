import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { MessengerService } from './messenger.service';
import { CommunicationService } from './communication.service';
import { GamesService } from './games.service';
import { StorageService } from './storage.service';

@Module({
  imports: [HttpModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [
    MessengerService,
    CommunicationService,
    GamesService,
    StorageService,
  ],
})
export class AppModule {}
