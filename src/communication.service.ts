import { Injectable } from '@nestjs/common';
import { GamesService, GameQuestionTypes } from './games.service';
import { MessengerService } from './messenger.service';

const HELP_MESSAGE = 'help';
const SUGGESTION_MESSAGE = 'podpowiedż';
const EXIT_MESSAGE = 'koniec';
const NEXT_QUESTION_MESSAGE = 'następne pytanie';

@Injectable()
export class CommunicationService {
  private availableGeneralCommands = [
    'help',
    'exit',
    'status',
    /* , start game %game_name% */
  ];

  private startGameRegex = new RegExp(/^start game (\w+)$/);

  private messages = {
    in_game_help: ['Dostępne polecenia:', '- exit: zakończenie bieżącej rozgrywki', '- status: status gry'],
    general_help: ['Dostępne polecenia:', '- start game NAZWA_GRY'],
    suggestion: '',
    command_not_found: 'Nie znaleziono polecenia',
  };

  constructor(
    private gamesService: GamesService,
    private messenger: MessengerService,
  ) {
  }

  async handleMessage(uid: number, text: string) {
    const hasUserAlreadyStartedGame = this.gamesService.hasUserAlreadyStartedGame(uid);

    const message = text.toLowerCase().trim();

    if (!hasUserAlreadyStartedGame) {
      if (message.match(this.startGameRegex)) {
        await this.handleStartGame(uid, message);
      } else if (message === HELP_MESSAGE) {
        await this.messenger.sendTextMessage(uid, this.messages.general_help);
      } else {
        await this.messenger.sendTextMessage(uid, this.messages.command_not_found);
      }
    } else {
      if (message === HELP_MESSAGE) {
        await this.messenger.sendTextMessage(uid, this.messages.in_game_help);
      } else if (message === SUGGESTION_MESSAGE) {
        await this.messenger.sendTextMessage(uid, this.messages.suggestion);
      } else if (message === EXIT_MESSAGE) {
        this.gamesService.endGame(uid);
        await this.messenger.sendTextMessage(uid, 'Game ended');
      } else if (message === NEXT_QUESTION_MESSAGE) {
        const nextQuestion = this.gamesService.getNextQuestion(uid);
        await this.sendFromQuestionsArray(uid, nextQuestion);
      } else {
        const isAnswerValid = this.gamesService.validateQuestion(uid, message);

        if (isAnswerValid) {
          await this.messenger.sendTextMessage(uid, 'Odpowiedź prawidłowa');
        } else {
          await this.messenger.sendTextMessage(uid, 'Odpowiedź nieprawidłowa');
        }
      }

    }
  }

  private async handleStartGame(uid: number, message: string) {
    const gameName = message.replace('start game ', '');

    try {
      this.gamesService.startGame(uid, gameName);
      const gameFirstQuestion = this.gamesService.getNextQuestion(uid, true);
      await this.messenger.sendTextMessage(uid, 'Game started');
      await this.sendFromQuestionsArray(uid, gameFirstQuestion);
    } catch (e) {
      await this.messenger.sendTextMessage(uid, e.message);
    }
  }

  private async sendFromQuestionsArray(uid: number, questionArray: { type: string, value: string }[]) {
    for (const nextQuestionElement of questionArray) {
      if (nextQuestionElement.type === GameQuestionTypes.questionText) {
        await this.messenger.sendTextMessage(uid, nextQuestionElement.value);
      } else if (nextQuestionElement.type === GameQuestionTypes.questionImage) {
        console.log(nextQuestionElement.value);
        await this.messenger.sendImageMessage(uid, nextQuestionElement.value);
      }
    }
  }
}
