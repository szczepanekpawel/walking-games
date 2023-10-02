import { Injectable } from '@nestjs/common';
import { StorageService } from './storage.service';
import { readFileSync } from 'fs';
import path = require('path');

export enum GameQuestionTypes {
  questionText = 'text',
  questionImage = 'image',
}

type gamesDefinition = {
  gameName: string;
  type: string;
  steps: {
    'questionParagraphs': { 'type': GameQuestionTypes, 'value': string }[];
    'answer': {
      'value': string
    },
    'help': string[]
  }[]
}

@Injectable()
export class GamesService {

  private gamesDefinition: gamesDefinition[];

  constructor(private storageService: StorageService) {
    const jsonData = readFileSync(path.resolve(__dirname, '../games-definition-data.json'), 'utf8');
    this.gamesDefinition = JSON.parse(jsonData);
  }

  isValidGameName(gameName: string) {
    return this.gamesDefinition.find(el => el.gameName === gameName) !== undefined;
  }

  hasUserAlreadyStartedGame(uid: number) {
    return this.storageService.userHasGameInProgress(uid);
  }

  startGame(uid: number, gameName: string) {
    if (!this.isValidGameName(gameName)) {
      throw new Error('There is no such game');
    }

    if (this.hasUserAlreadyStartedGame(uid)) {
      throw new Error('Game already started');
    }

    this.storageService.addUserAndGame(uid, gameName);
    return true;
  }

  endGame(uid: number) {
    this.storageService.removeUserAndGame(uid);
  }

  getNextQuestion(uid: number, isFirstQuestion?: boolean) {
    const { currentGameData, gameDefinition } = this.getUserCurrentGame(uid);

    if (gameDefinition) {
      if (isFirstQuestion) {
        return gameDefinition.steps[currentGameData.step].questionParagraphs;
      } else {
        const newQuestion = gameDefinition.steps[currentGameData.step + 1];
        this.storageService.increaseUserInGameStep(uid);

        return newQuestion.questionParagraphs || null;
      }
    }

    return null;
  }

  validateQuestion(uid: number, answer: string) {
    const { currentGameData, gameDefinition } = this.getUserCurrentGame(uid);
    const currentGameQuestion = gameDefinition.steps[currentGameData.step];

    if (currentGameQuestion) {
      return currentGameQuestion.answer.value == answer;
    }

    return false;
  }

  private getUserCurrentGame(uid: number) {
    const currentGameData = this.storageService.getUserData(uid);
    const gameDefinition = this.gamesDefinition.find(el => el.gameName === currentGameData?.gameName);

    return { currentGameData, gameDefinition };
  }
}
