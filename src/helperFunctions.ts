import { getData } from './dataStore';
import HTTPError from 'http-errors';

export function tokenToUserId(token: string) {
  if (token === undefined || token === '') {
    throw HTTPError(401, 'token is not a valid structure');
  }

  if (isNaN(parseInt(token))) {
    throw HTTPError(401, 'token is not a valid structure');
  }

  const data = getData();

  const userToken = data.tokens.find(session => session.sessionId === parseInt(token));
  if (userToken === undefined) {
    throw HTTPError(403, 'Provided token is valid structure, but is not for a currently logged in session');
  }

  return userToken.userId;
}

export function findPlayer(playerId: number) {
  const data = getData();

  const targetPlayer = (data.players.find(player => player.playerId === playerId));

  if (targetPlayer === undefined) {
    throw HTTPError(400, 'player ID does not exist');
  }

  return targetPlayer;
}

export function areArraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  return set1.size === set2.size && arr1.every(value => set2.has(value));
}
