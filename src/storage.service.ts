import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  private gamesInProgress: { uid: number; gameName: string; step: number }[] = [];

  userHasGameInProgress(uid: number) {
    return this.gamesInProgress.find((el) => el.uid === uid);
  }

  getUserData(uid: number) {
    const userData = this.gamesInProgress.find((el) => el.uid === uid);

    if (userData) {
      return userData;
    }

    return null;
  }

  increaseUserInGameStep(uid: number) {
    const userData = this.gamesInProgress.find(el => el.uid === uid);

    if (userData) {
      userData.step = userData.step + 1;
    }
  }

  addUserAndGame(uid: number, gameName: string) {
    this.gamesInProgress.push({ uid: uid, gameName, step: 0 });
  }

  removeUserAndGame(uid: number) {
    this.gamesInProgress = this.gamesInProgress.filter((el) => el.uid !== uid);
  }
}
