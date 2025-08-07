import { setData, getData } from './dataStore';
import { findPlayer, areArraysEqual } from './helperFunctions';
import HTTPError from 'http-errors';

export enum states {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END',
}

interface Message {
  messageBody: string,
}

/// ///////////helper functions/////////////
function generateRandomName() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';

  let name = '';
  for (let i = 0; i < 5; i++) {
    name += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 3; i++) {
    name += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return name;
}

/// ///////////functions/////////////////

export function adminPlayerJoin(sessionId: number, name: string) {
  const data = getData();
  const targetSession = data.sessions.find(session => session.sessionId === sessionId);

  if (targetSession.state !== states.LOBBY) {
    throw HTTPError(400, 'Session is not in LOBBY state');
  }

  // name part
  if (name === '') {
    // name = generateRandomName();
    let i = 0;
    while (i === 0 || targetSession.players.find(player => player === name) !== undefined) {
      name = generateRandomName();
      i++;
    }
  } else {
    if (targetSession.players.find(player => player === name) !== undefined) {
      throw HTTPError(400, 'Name of user entßered is not unique');
    }
  }

  targetSession.players.push(name);

  const playerId = data.players.length + 1;

  const playerObject = {
    name: name,
    playerId: playerId,
    sessionId: sessionId,
  };

  data.players.push(playerObject);

  const targetScore = data.scores.find(score => score.sessionId === sessionId);

  targetScore.usersRankedByScore.push({
    name: name,
    score: 0,
  });

  if (targetSession.autoStartNum > 0 && targetSession.players.length === targetSession.autoStartNum) {
    targetSession.state = states.QUESTION_COUNTDOWN;
    targetSession.atQuestion = 1;
  }

  setData(data);
  return { playerId: playerId };
}

export function adminPlayerStatus(playerId: number) {
  const data = getData();

  const targetPlayer = findPlayer(playerId);

  const targetSession = (data.sessions.find(session => session.sessionId === targetPlayer.sessionId));

  const playerStatusObject = {
    state: targetSession.state,
    numQuestions: targetSession.metadata.questions.length,
    atQuestion: targetSession.atQuestion,
  };

  return playerStatusObject;
}

export function adminPlayerQuestionInfo(playerId: number, questionPosition: number) {
  const data = getData();

  const targetPlayer = findPlayer(playerId);
  const sessionId = targetPlayer.sessionId;

  const targetSession = (data.sessions.find(session => session.sessionId === sessionId));

  if (questionPosition < 0 || questionPosition > targetSession.metadata.questions.length) {
    throw HTTPError(400, 'question position is not valid for the session this player is in');
  }

  if (questionPosition !== targetSession.atQuestion) {
    throw HTTPError(400, 'the session is not currently on this question');
  }

  if (targetSession.state === states.END || targetSession.state === states.LOBBY) {
    throw HTTPError(400, 'Session is in LOBBY or END state');
  }

  const targetQuestion = targetSession.metadata.questions[questionPosition - 1];

  const NoSollutionAnswers = targetQuestion.answers.map(({ answer, answerId, colour }) => ({
    answer,
    answerId,
    colour,
  }));

  setData(data);
  return { ...targetQuestion, answers: NoSollutionAnswers };
}

export function adminPlayerAnswer(answerIds: number[], playerId: number[], questionPosition: number) {
  const data = getData();

  const targetPlayer = findPlayer(playerId);
  const sessionId = targetPlayer.sessionId;

  const targetSession = (data.sessions.find(session => session.sessionId === sessionId));

  if (questionPosition < 0 || questionPosition > targetSession.metadata.questions.length) {
    throw HTTPError(400, 'question position is not valid for the session this player is in');
  }

  if (targetSession.state !== states.QUESTION_OPEN) {
    throw HTTPError(400, 'Session is not in QUESTION_OPEN state');
  }

  if (targetSession.atQuestion !== questionPosition) {
    throw HTTPError(400, 'session is not yet up to this question');
  }

  const targetQuestion = targetSession.metadata.questions[questionPosition - 1];

  if (answerIds.length < 1) {
    throw HTTPError(400, 'Less than 1 answer ID was submitted');
  }

  // Answer IDs are not valid for this particular question

  for (const Id of answerIds) {
    if (targetQuestion.answers.find(answer => answer.answerId === Id) === undefined) {
      throw HTTPError(400, 'Answer IDs are not valid for this particular question');
    }
  }

  // There are duplicate answer IDs provided
  const numSet = new Set();

  for (const answerId of answerIds) {
    if (numSet.has(answerId)) {
      throw HTTPError(400, 'There are duplicate answer IDs provided');
    }
    numSet.add(answerId);
  }

  const targetScore = data.scores.find(score => score.sessionId === sessionId);

  const targetQuestionRecord = targetScore.questionRecords[questionPosition - 1];

  if (targetQuestionRecord.answerTimes.find(answerTime => answerTime.name === targetPlayer.name) !== undefined) {
    targetQuestionRecord.answerTimes = targetQuestionRecord.answerTimes.filter(answerTime => answerTime.name !== targetPlayer.name);

    targetQuestionRecord.completeCorrect = targetQuestionRecord.completeCorrect.filter(completeCorrect => completeCorrect !== targetPlayer.name);

    const targetQuestionResult = targetScore.questionResults[questionPosition - 1];

    for (const questionCorrectBreakdown of targetQuestionResult.questionCorrectBreakdown) {
      questionCorrectBreakdown.playersCorrect = questionCorrectBreakdown.playersCorrect.filter(player => player !== targetPlayer.name);
    }
  }

  const AnswerTimeObject = {
    name: targetPlayer.name,
    time: new Date().getTime() / 1000,
  };
  targetQuestionRecord.answerTimes.push(AnswerTimeObject);

  const correctAnswerIdsArray = targetQuestion.answers
    .filter(answer => answer.correct === true)
    .map(answer => answer.answerId);

  if (areArraysEqual(answerIds, correctAnswerIdsArray) === true) {
    targetQuestionRecord.completeCorrect.push(targetPlayer.name);
  }

  for (const answerId of answerIds) {
    const TargetQuestionCorrectBreakdown = targetScore.questionResults[questionPosition - 1].questionCorrectBreakdown.find(obj => obj.answerId === answerId);
    if (TargetQuestionCorrectBreakdown !== undefined) {
      TargetQuestionCorrectBreakdown.playersCorrect.push(targetPlayer.name);
    }
  }

  setData(data);
  return { };
}

export function adminPlayerQuestionResults(playerId: number[], questionPosition: number) {
  const data = getData();

  const targetPlayer = findPlayer(playerId);
  const sessionId = targetPlayer.sessionId;

  const targetSession = (data.sessions.find(session => session.sessionId === sessionId));

  if (questionPosition < 0 || questionPosition > targetSession.metadata.questions.length) {
    throw HTTPError(400, 'question position is not valid for the session this player is in');
  }

  if (targetSession.state !== states.ANSWER_SHOW) {
    throw HTTPError(400, 'Session is not in ANSWER_SHOW state');
  }

  if (questionPosition > targetSession.atQuestion) {
    throw HTTPError(400, 'session is not yet up to this question');
  }

  const targetScore = data.scores.find(score => score.sessionId === sessionId);
  const targetQuestionResult = targetScore.questionResults[questionPosition - 1];

  setData(data);
  return targetQuestionResult;
}

export function adminPlayerFinalResults(playerId: number[]) {
  const data = getData();

  const targetPlayer = findPlayer(playerId);
  const sessionId = targetPlayer.sessionId;

  const targetSession = (data.sessions.find(session => session.sessionId === sessionId));

  if (targetSession.state !== states.FINAL_RESULTS) {
    throw HTTPError(400, 'Session is not in FINAL_RESULTS state');
  }

  const targetScore = data.scores.find(score => score.sessionId === sessionId);

  const finalResults = {
    usersRankedByScore: targetScore.usersRankedByScore,
    questionResults: targetScore.questionResults,
  };

  return finalResults;
}

export function adminMessageSend(playerId: number, message: Message) {
  const data = getData();
  const messageBody = message.messageBody;

  if (messageBody.length < 1 || messageBody.length > 100) {
    throw HTTPError(400, 'message body is less than 1 character or more than 100 characters');
  }

  const targetPlayer = findPlayer(playerId);

  const targetSession = (data.sessions.find(session => session.sessionId === targetPlayer.sessionId));

  const newMessage = {
    messageBody: messageBody,
    playerId: playerId,
    playerName: targetPlayer.name,
    timeSent: Math.floor(Date.now() / 1000),
  };

  targetSession.messages.push(newMessage);

  return {};
}

export function adminMessagesReview(playerId: number) {
  const data = getData();

  const targetPlayer = findPlayer(playerId);

  const targetSession = (data.sessions.find(session => session.sessionId === targetPlayer.sessionId));

  return { messages: targetSession.messages };
}
