import { setData, getData } from './dataStore';
import { tokenToUserId } from './helperFunctions';
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

export enum actions {
  NEXT_QUESTION = 'NEXT_QUESTION',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END',
  FINISH_COUNTDOWN = 'FINISH_COUNTDOWN',
}

/// //////////////////////////////////////////////////////////////////////////////////////
export function adminSessionStart(quizId: number, token: string, autoStartNum: number) {
  const data = getData();
  const authUserId = tokenToUserId(token);
  const sessionQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (sessionQuiz === undefined) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  } else if (sessionQuiz.authUserId !== authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  } else if (autoStartNum > 50) {
    throw HTTPError(400, 'autoStartNum is a number greater than 50');
  }

  const activeSession = data.sessions.filter(session => session.state !== 'END');
  if (activeSession.length >= 10) {
    throw HTTPError(400, 'A maximum of 10 sessions that are not in END state currently exist');
  } else if (sessionQuiz.questions.length === 0) {
    throw HTTPError(400, 'The quiz does not have any questions in it');
  }

  const sessionId = Math.ceil(Date.now() * Math.random());
  const newSession = {
    state: states.LOBBY,
    autoStartNum: autoStartNum,
    atQuestion: 0,
    players: [],
    metadata: {
      quizId: quizId,
      name: sessionQuiz.name,
      timeCreated: sessionQuiz.timeCreated,
      timeLastEdited: sessionQuiz.timeLastEdited,
      description: sessionQuiz.description,
      numQuestions: sessionQuiz.numQuestions,
      questions: sessionQuiz.questions,
      duration: sessionQuiz.duration,
    },
    sessionId: sessionId,
    messages: [],
  };
  data.sessions.push(newSession);
  // initializing the score for the session;
  data.scores.push({
    sessionId: sessionId,
    usersRankedByScore: [],
    questionResults: [],
    questionRecords: [],
  });
  setData(data);

  return {
    sessionId: sessionId,
  };
}

// get session status
// ***remember to add thumbnail url!!
export function adminGetSessionStatus(quizId: number, sessionId: number, token: string) {
  const data = getData();
  const authUserId = tokenToUserId(token);
  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (targetQuiz === undefined) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  } else if (targetQuiz.authUserId !== authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  const targetSession = data.sessions.find(session => session.sessionId === sessionId);
  if (targetSession.metadata.quizId !== quizId) {
    throw HTTPError(400, 'SessionId does not refer to this quizId');
  }

  return {
    state: targetSession.state,
    atQuestion: targetSession.atQuestion,
    players: targetSession.players,
    metadata: targetSession.metadata,
  };
}

export function adminUpdateSessionState(quizId: number, sessionId: number, token: string, action: string) {
  const data = getData();
  const authUserId = tokenToUserId(token);
  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (targetQuiz === undefined) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  } else if (targetQuiz.authUserId !== authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  const targetSession = data.sessions.find(session => session.sessionId === sessionId);
  if (targetSession.metadata.quizId !== quizId) {
    throw HTTPError(400, 'SessionId does not refer to this quizId');
  }

  // double check here
  // const actionValues = Object.values(actions);
  // if (!actionValues.includes(action)) {
  //   throw HTTPError(400, 'Action provided is not a valid Action enum');
  // }

  const currentState = targetSession.state;
  if (action === actions.END) {
    targetSession.atQuestion = 0;
    if (currentState === states.QUESTION_OPEN) {
      const timer = data.timers.find(timer => timer.sessionId === sessionId);
      clearTimeout(timer.timer);
      data.timers = data.timers.filter(timer => timer.sessionId !== sessionId);
    }
    targetSession.state = states.END;
  } else if (action === actions.NEXT_QUESTION) {
    if (currentState !== states.LOBBY && currentState !== states.QUESTION_CLOSE && currentState !== states.ANSWER_SHOW) {
      throw HTTPError(400, 'Action enum cannot be applied in the current state');
    } else if (targetSession.atQuestion === targetSession.metadata.questions.length) {
      throw HTTPError(400, 'end of the questions');
    }
    if (currentState === states.QUESTION_CLOSE) {
      data.timers = data.timers.filter(timer => timer.sessionId !== sessionId);
    }
    targetSession.state = states.QUESTION_COUNTDOWN;
    targetSession.atQuestion++;
  } else if (action === actions.GO_TO_ANSWER) {
    if (currentState !== states.QUESTION_OPEN && currentState !== states.QUESTION_CLOSE) {
      throw HTTPError(400, 'Action enum cannot be applied in the current state');
    }

    if (currentState === states.QUESTION_CLOSE) {
      data.timers = data.timers.filter(timer => timer.sessionId !== sessionId);
    }

    // calculate the score
    if (currentState === states.QUESTION_OPEN) {
      // clear timer
      const timer = data.timers.find(timer => timer.sessionId === sessionId);
      clearTimeout(timer.timer);
      data.timers = data.timers.filter(timer => timer.sessionId !== sessionId);

      const currentQuestionIndex1 = targetSession.atQuestion - 1;
      const questionToBeLoaded1 = targetSession.metadata.questions[currentQuestionIndex1];
      const score = data.scores.find(score => score.sessionId === sessionId);
      const targetQuestionRecord = score.questionRecords.find(questionRecord => questionRecord.questionId === questionToBeLoaded1.questionId);
      const targetQuestionResult = score.questionResults.find(questionResult => questionResult.questionId === questionToBeLoaded1.questionId);

      const answerTimes = targetQuestionRecord.answerTimes.map(time => time.time);
      let sumOfTimes = 0;
      for (const answerTime of answerTimes) {
        const time = (answerTime - targetQuestionRecord.startTime);
        sumOfTimes += time;
      }
      //
      // changed here -> use math.round
      //
      let averageTime = 0;
      if (sumOfTimes !== 0) {
        averageTime = Math.round(sumOfTimes / answerTimes.length);
      }

      // calculate percent correct
      const percentCorrect = Math.round((targetQuestionRecord.completeCorrect.length / targetSession.players.length) * 100);

      // update averagetime and percent correct
      targetQuestionResult.averageAnswerTime = averageTime;
      targetQuestionResult.percentCorrect = percentCorrect;

      // update score
      // const completeCorrect = targetQuestionRecord.completeCorrect;
      const questionPoints = questionToBeLoaded1.points;
      let i = 1;
      for (const completeCorrect of targetQuestionRecord.completeCorrect) {
        const rankingObject = score.usersRankedByScore.find(object => object.name === completeCorrect);
        rankingObject.score += (1 / i) * questionPoints;
        rankingObject.score = parseFloat(rankingObject.score.toFixed(1));
        i++;
      }
    }
    targetSession.state = states.ANSWER_SHOW;
    setData(data);
  } else if (action === actions.GO_TO_FINAL_RESULTS) {
    if (currentState !== states.QUESTION_CLOSE && currentState !== states.ANSWER_SHOW) {
      throw HTTPError(400, 'Action enum cannot be applied in the current state');
    }
    const score = data.scores.find(score => score.sessionId === sessionId);
    score.usersRankedByScore.sort((a, b) => b.score - a.score);
    targetSession.state = states.FINAL_RESULTS;
  } else if (action === actions.FINISH_COUNTDOWN) {
    if (currentState !== states.QUESTION_COUNTDOWN) {
      throw HTTPError(400, 'Action enum cannot be applied in the current state');
    }
    // initializing questionResult
    const currentQuestionIndex = targetSession.atQuestion - 1;
    const questionToBeLoaded = targetSession.metadata.questions[currentQuestionIndex];
    const duration = questionToBeLoaded.duration;
    // get all answers and get all correct answer Ids
    const answers = questionToBeLoaded.answers;
    const correctAnswerIds = answers.filter(answer => answer.correct === true).map(answer => answer.answerId);

    const newQuestionCorrectArr = [];
    for (const Id of correctAnswerIds) {
      newQuestionCorrectArr.push({
        answerId: Id,
        playersCorrect: [],
      });
    }

    // create a new object containing initialized info
    const newQuestionResult = {
      questionId: questionToBeLoaded.questionId,
      questionCorrectBreakdown: newQuestionCorrectArr,
      averageAnswerTime: 0,
      percentCorrect: 0,
    };

    // find target object of score
    const targetScore = data.scores.find(score => score.sessionId === sessionId);
    targetScore.questionResults.push(newQuestionResult);

    // initialize questionRecords
    // const startTime = new Date();
    //
    // changed here from math.floor -> math.round
    //
    // const startTimeInSeconds = Math.round(startTime.getTime() / 1000);
    const newQuestionRecord = {
      questionId: questionToBeLoaded.questionId,
      answerTimes: [],
      startTime: new Date().getTime() / 1000,
      completeCorrect: [],
    };
    targetScore.questionRecords.push(newQuestionRecord);
    targetSession.state = states.QUESTION_OPEN;
    // set timer for calculating average time, percent correct, etc.
    const questionCloseTimer = setTimeout(() => {
      targetSession.state = states.QUESTION_CLOSE;
      const targetQuestionRecord = targetScore.questionRecords.find(questionRecord => questionRecord.questionId === questionToBeLoaded.questionId);
      const targetQuestionResult = targetScore.questionResults.find(questionResult => questionResult.questionId === questionToBeLoaded.questionId);
      // calculate the average answer time
      const answerTimes = targetQuestionRecord.answerTimes.map(time => time.time);
      let sumOfTimes = 0;
      for (const answerTime of answerTimes) {
        const time = (answerTime - targetQuestionRecord.startTime);
        sumOfTimes += time;
      }
      //
      // changed here -> use math.round
      //
      let averageTime = 0;
      if (sumOfTimes !== 0) {
        averageTime = Math.round(sumOfTimes / answerTimes.length);
      }

      // calculate percent correct
      const percentCorrect = Math.round((targetQuestionRecord.completeCorrect.length / targetSession.players.length) * 100);

      // update averagetime and percent correct
      targetQuestionResult.averageAnswerTime = averageTime;
      targetQuestionResult.percentCorrect = percentCorrect;

      // update score
      // const completeCorrect = targetQuestionRecord.completeCorrect;
      const questionPoints = questionToBeLoaded.points;
      let i = 1;
      for (const completeCorrect of targetQuestionRecord.completeCorrect) {
        const rankingObject = targetScore.usersRankedByScore.find(object => object.name === completeCorrect);
        rankingObject.score += (1 / i) * questionPoints;
        rankingObject.score = parseFloat(rankingObject.score.toFixed(1));
        i++;
      }
      setData(data);
    }, duration * 1000);

    // save timerId with respect to the question Id
    const newTimer = {
      sessionId: targetSession.sessionId,
      timer: questionCloseTimer,
    };
    data.timers.push(newTimer);
  } else {
    throw HTTPError(400, 'Action provided is not a valid Action enum');
  }

  setData(data);
  return {};
}

export function adminViewSessionsActivity(quizId: number, token: string) {
  const data = getData();
  tokenToUserId(token);

  const activeSessions = [];
  const inactiveSessions = [];

  for (const session of data.sessions) {
    if (session.metadata.quizId === quizId) {
      if (session.state === states.END) {
        inactiveSessions.push(session.sessionId);
      } else {
        activeSessions.push(session.sessionId);
      }
    }
  }

  return {
    activeSessions: activeSessions,
    inactiveSessions: inactiveSessions,
  };
}

export function adminSessionFinalResults(quizId: number, sessionId: number, token: string) {
  const data = getData();
  const authUserId = tokenToUserId(token);
  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (targetQuiz === undefined) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  } else if (targetQuiz.authUserId !== authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  const targetSession = data.sessions.find(session => session.sessionId === sessionId);
  if (targetSession.metadata.quizId !== quizId) {
    throw HTTPError(400, 'SessionId does not refer to this quizId');
  }

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
