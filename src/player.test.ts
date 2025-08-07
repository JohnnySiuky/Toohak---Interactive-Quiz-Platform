import HTTPError from 'http-errors';

import {
  requestRegister,
  clear,
  quizCreate,
  questionCreate,
  sessionStart,
  getSessionStatus,
  sessionStateUpdate,
  playerJoin,
  playerStatus,
  playerQuestionInfo,
  playerAnswer,
  playerQuestionResults,
  playerFinalResults,
  messageSend,
  messagesReview,
  sleepSync,
} from './helperServer';

export enum states {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END',
}

beforeEach(clear);
afterAll(clear);

/// tests///
describe('/v1/player/join', () => {
  test('successful join some players and then wrongly using repeated name ', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const questionBody1 = {
      question: 'What is the index to measure the inflation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Gini index',
          correct: false,
        },
        {
          answer: 'CPI',
          correct: true,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    questionCreate(questionBody1, quizId1, createAuthData);
    const session1 = sessionStart(quizId1, createAuthData, 50);
    const sessionId1 = session1.sessionId;

    expect(playerJoin(sessionId1, 'QinGang')).toStrictEqual({ playerId: expect.any(Number) });
    expect(playerJoin(sessionId1, 'ZhaoLijian')).toStrictEqual({ playerId: expect.any(Number) });
    expect(playerJoin(sessionId1, 'WangYi')).toStrictEqual({ playerId: expect.any(Number) });
    expect(playerJoin(sessionId1, '')).toStrictEqual({ playerId: expect.any(Number) });
    expect(playerJoin(sessionId1, '')).toStrictEqual({ playerId: expect.any(Number) });
    expect(playerJoin(sessionId1, '')).toStrictEqual({ playerId: expect.any(Number) });
    expect(playerJoin(sessionId1, '')).toStrictEqual({ playerId: expect.any(Number) });
    expect(() => playerJoin(sessionId1, 'QinGang')).toThrow(HTTPError[400]);
  });

  test('the session is autostart and Session is not in LOBBY state and no new player can join ', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const questionBody1 = {
      question: 'What is the index to measure the inflation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Gini index',
          correct: false,
        },
        {
          answer: 'CPI',
          correct: true,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    questionCreate(questionBody1, quizId1, createAuthData);
    const session1 = sessionStart(quizId1, createAuthData, 4);
    const sessionId1 = session1.sessionId;

    expect(playerJoin(sessionId1, 'WangYi')).toStrictEqual({ playerId: expect.any(Number) });
    expect(playerJoin(sessionId1, 'ZhaoLijian')).toStrictEqual({ playerId: expect.any(Number) });
    expect(playerJoin(sessionId1, '')).toStrictEqual({ playerId: expect.any(Number) });
    expect(playerJoin(sessionId1, '')).toStrictEqual({ playerId: expect.any(Number) });
    expect(() => playerJoin(sessionId1, 'QinGang')).toThrow(HTTPError[400]);
  });
});

describe('/v1/player/:playerid', () => {
  test('succefully get the statu of the player for serveral times', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const questionBody1 = {
      question: 'What is the index to measure the inflation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Gini index',
          correct: false,
        },
        {
          answer: 'CPI',
          correct: true,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody2 = {
      question: 'Which one is internation orgnisation',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'FBI',
          correct: false,
        },
        {
          answer: 'WTO',
          correct: true,
        },
        {
          answer: 'NASA',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    questionCreate(questionBody1, quizId1, createAuthData);
    questionCreate(questionBody2, quizId1, createAuthData);

    const session1 = sessionStart(quizId1, createAuthData, 3);
    const sessionId1 = session1.sessionId;

    const player1 = playerJoin(sessionId1, 'WangYi');
    const player2 = playerJoin(sessionId1, 'Josh');
    const playerId1 = player1.playerId;
    const playerId2 = player2.playerId;

    expect(playerStatus(playerId2)).toStrictEqual({
      state: states.LOBBY,
      numQuestions: 2,
      atQuestion: 0,
    });

    playerJoin(sessionId1, 'Niko');

    expect(playerStatus(playerId2)).toStrictEqual({
      state: states.QUESTION_COUNTDOWN,
      numQuestions: 2,
      atQuestion: 1,
    });

    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'FINISH_COUNTDOWN');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'GO_TO_ANSWER');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'NEXT_QUESTION');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'FINISH_COUNTDOWN');

    expect(playerStatus(playerId1)).toStrictEqual({
      state: states.QUESTION_OPEN,
      numQuestions: 2,
      atQuestion: 2,
    });

    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'END');
    sleepSync(1 * 1000);

    expect(playerStatus(playerId2)).toStrictEqual({
      state: states.END,
      numQuestions: 2,
      atQuestion: 0,
    });
  });

  test('400 Error: invalid playerId', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const questionBody1 = {
      question: 'What is the index to measure the inflation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Gini index',
          correct: false,
        },
        {
          answer: 'CPI',
          correct: true,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    questionCreate(questionBody1, quizId1, createAuthData);

    const session1 = sessionStart(quizId1, createAuthData, 3);
    const sessionId1 = session1.sessionId;

    const player1 = playerJoin(sessionId1, 'WangYi');
    const invalidPlayerId = player1.playerId * 10086;

    expect(() => playerStatus(invalidPlayerId)).toThrow(HTTPError[400]);
  });
});

describe('/v1/player/{playerid}/question/{questionposition}', () => {
  test('successfully get a question infomation', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const questionBody1 = {
      question: 'What is the index to measure the inflation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Gini index',
          correct: false,
        },
        {
          answer: 'CPI',
          correct: true,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody2 = {
      question: 'What is the trade policy',
      duration: 1,
      points: 8,
      answers: [
        {
          answer: 'Tariff',
          correct: true,
        },
        {
          answer: 'Tax',
          correct: false,
        },
        {
          answer: 'subsidy',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    const question1 = questionCreate(questionBody1, quizId1, createAuthData);
    const questionId1 = question1.questionId;

    const question2 = questionCreate(questionBody2, quizId1, createAuthData);
    const questionId2 = question2.questionId;

    const session1 = sessionStart(quizId1, createAuthData, 3);
    const sessionId1 = session1.sessionId;

    playerJoin(sessionId1, 'WangYi');
    const player2 = playerJoin(sessionId1, '');
    playerJoin(sessionId1, '');

    const playerId2 = player2.playerId;

    expect(playerQuestionInfo(playerId2, 1)).toStrictEqual({
      questionId: questionId1,
      question: 'What is the index to measure the inflation',
      duration: 5,
      points: 5,
      answers: [
        {
          answerId: expect.any(Number),
          answer: 'Gini index',
          colour: expect.any(String),
        },
        {
          answerId: expect.any(Number),
          answer: 'CPI',
          colour: expect.any(String),
        },
        {
          answerId: expect.any(Number),
          answer: 'GNI',
          colour: expect.any(String),
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    });

    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'FINISH_COUNTDOWN');
    sleepSync(1 * 1000);
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'GO_TO_ANSWER');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'NEXT_QUESTION');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'FINISH_COUNTDOWN');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'GO_TO_ANSWER');

    expect(playerQuestionInfo(playerId2, 2)).toStrictEqual({
      questionId: questionId2,
      question: 'What is the trade policy',
      duration: 1,
      points: 8,
      answers: [
        {
          answerId: expect.any(Number),
          answer: 'Tariff',
          colour: expect.any(String),
        },
        {
          answerId: expect.any(Number),
          answer: 'Tax',
          colour: expect.any(String),
        },
        {
          answerId: expect.any(Number),
          answer: 'subsidy',
          colour: expect.any(String),
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    });

    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'END');
    expect(() => playerQuestionInfo(playerId2, 2)).toThrow(HTTPError[400]);
  });

  test('400 Errors', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const questionBody1 = {
      question: 'What is the index to measure the inflation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Gini index',
          correct: false,
        },
        {
          answer: 'CPI',
          correct: true,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody2 = {
      question: 'Which one is internation orgnisation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'FBI',
          correct: false,
        },
        {
          answer: 'WTO',
          correct: true,
        },
        {
          answer: 'NASA',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    questionCreate(questionBody1, quizId1, createAuthData);
    questionCreate(questionBody2, quizId1, createAuthData);

    const session1 = sessionStart(quizId1, createAuthData, 3);
    const sessionId1 = session1.sessionId;

    const player1 = playerJoin(sessionId1, 'WangYi');
    const player2 = playerJoin(sessionId1, '');
    const playerId2 = player2.playerId;
    expect(() => playerQuestionInfo(playerId2, 0)).toThrow(HTTPError[400]);
    playerJoin(sessionId1, '');

    const InvalidPlayerId = player1.playerId * 10086;

    expect(() => playerQuestionInfo(InvalidPlayerId, 1)).toThrow(HTTPError[400]);
    expect(() => playerQuestionInfo(playerId2, 3)).toThrow(HTTPError[400]);
    expect(() => playerQuestionInfo(playerId2, -1)).toThrow(HTTPError[400]);
    expect(() => playerQuestionInfo(playerId2, 2)).toThrow(HTTPError[400]);
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'END');
    expect(() => playerQuestionInfo(playerId2, 0)).toThrow(HTTPError[400]);
  });
});

describe('/v1/player/{playerid}/question/{questionposition}/answer', () => {
  test('400 ERRORs', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const questionBody1 = {
      question: 'What is the index to measure the inflation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Gini index',
          correct: false,
        },
        {
          answer: 'CPI',
          correct: true,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody2 = {
      question: 'Which one is internation orgnisation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'FBI',
          correct: false,
        },
        {
          answer: 'WTO',
          correct: true,
        },
        {
          answer: 'NASA',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    questionCreate(questionBody1, quizId1, createAuthData);

    questionCreate(questionBody2, quizId1, createAuthData);

    const session1 = sessionStart(quizId1, createAuthData, 3);
    const sessionId1 = session1.sessionId;
    const sessionInfo1 = getSessionStatus(quizId1, session1.sessionId, createAuthData);
    const questionPosition1 = 1;

    const answerId1 = sessionInfo1.metadata.questions[questionPosition1 - 1].answers[1 - 1].answerId;
    const answerId2 = sessionInfo1.metadata.questions[questionPosition1 - 1].answers[2 - 1].answerId;
    const answerId3 = sessionInfo1.metadata.questions[questionPosition1 - 1].answers[3 - 1].answerId;
    const invalidAnswerId = answerId3 - 10086;

    const player1 = playerJoin(sessionId1, 'WangYi');
    const player2 = playerJoin(sessionId1, '');
    const player3 = playerJoin(sessionId1, '');

    const playerId1 = player1.playerId;
    const playerId2 = player2.playerId;
    const playerId3 = player3.playerId;

    const invalidPlayerId = player2.playerId + 10086;
    // 400 ERROR: If player ID does not exist
    expect(() => playerAnswer([answerId1, answerId2], invalidPlayerId, questionPosition1)).toThrow(HTTPError[400]);
    // 400 ERROR: If question position is not valid for the session this player is in
    expect(() => playerAnswer([answerId1, answerId2], playerId2, 3)).toThrow(HTTPError[400]);
    expect(() => playerAnswer([answerId1, answerId2], playerId2, -1)).toThrow(HTTPError[400]);
    // 400 ERROR: Session is not in QUESTION_OPEN state
    expect(() => playerAnswer([answerId1, answerId2], playerId2, questionPosition1)).toThrow(HTTPError[400]);
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'FINISH_COUNTDOWN');

    // 400 ERROR: There are duplicate answer IDs provided
    expect(() => playerAnswer([answerId1, answerId2, answerId2], playerId2, questionPosition1)).toThrow(HTTPError[400]);
    // 400 ERROR: Less than 1 answer ID was submitted
    expect(() => playerAnswer([], playerId3, questionPosition1)).toThrow(HTTPError[400]);
    // 400 ERROR: Answer IDs are not valid for this particular question
    expect(() => playerAnswer([invalidAnswerId], playerId1, questionPosition1)).toThrow(HTTPError[400]);

    expect(playerAnswer([answerId1, answerId2, answerId3], playerId2, questionPosition1)).toStrictEqual({ });
    // If session is not yet up to this question
    expect(() => playerAnswer([answerId1, answerId2], playerId2, questionPosition1 + 1)).toThrow(HTTPError[400]);
  });
});

describe('/v1/player/{playerid}/question/{questionposition}/results', () => {
  test('400 ERRORs', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const questionBody1 = {
      question: 'What is the index to measure the inflation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Gini index',
          correct: false,
        },
        {
          answer: 'CPI',
          correct: true,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody2 = {
      question: 'What is the trade policy',
      duration: 10,
      points: 8,
      answers: [
        {
          answer: 'Tariff',
          correct: true,
        },
        {
          answer: 'Tax',
          correct: false,
        },
        {
          answer: 'subsidy',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    questionCreate(questionBody1, quizId1, createAuthData);
    questionCreate(questionBody2, quizId1, createAuthData);

    // const question1 = questionCreate(questionBody1, quizId1, createAuthData);
    // const questionId1 = question1.questionId;

    const session1 = sessionStart(quizId1, createAuthData, 3);
    const sessionId1 = session1.sessionId;

    const questionPosition1 = 1;

    const player1 = playerJoin(sessionId1, 'WangYi');
    const player2 = playerJoin(sessionId1, '');
    playerJoin(sessionId1, '');

    const playerId2 = player2.playerId;
    const invalidPlayerId = player1.playerId + 10086;
    expect(() => playerQuestionResults(playerId2, questionPosition1)).toThrow(HTTPError[400]);
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'FINISH_COUNTDOWN');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'GO_TO_ANSWER');
    expect(() => playerQuestionResults(invalidPlayerId, questionPosition1)).toThrow(HTTPError[400]);
    expect(() => playerQuestionResults(playerId2, 2)).toThrow(HTTPError[400]);
    expect(() => playerQuestionResults(playerId2, 3)).toThrow(HTTPError[400]);
  });
});

describe('/v1/player/{playerId}/results', () => {
  test('400 ERRORs', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const questionBody1 = {
      question: 'What is the index to measure the inflation',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'Gini index',
          correct: false,
        },
        {
          answer: 'CPI',
          correct: true,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    questionCreate(questionBody1, quizId1, createAuthData);

    const session1 = sessionStart(quizId1, createAuthData, 3);
    const sessionId1 = session1.sessionId;

    playerJoin(sessionId1, 'WangYi');
    const player2 = playerJoin(sessionId1, '');
    playerJoin(sessionId1, '');

    const playerId2 = player2.playerId;
    const invalidPlayerId = playerId2 + 10086;

    expect(() => playerFinalResults(playerId2)).toThrow(HTTPError[400]);
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'FINISH_COUNTDOWN');

    sleepSync(1 * 1000);

    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'GO_TO_FINAL_RESULTS');
    expect(() => playerFinalResults(invalidPlayerId)).toThrow(HTTPError[400]);
  });

  test('Successful return the final results', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const questionBody1 = {
      question: 'What is the index to measure the inflation',
      duration: 7,
      points: 5,
      answers: [
        {
          answer: 'Gini index',
          correct: false,
        },
        {
          answer: 'CPI',
          correct: true,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody2 = {
      question: 'What is the trade policy',
      duration: 10,
      points: 8,
      answers: [
        {
          answer: 'Tariff',
          correct: true,
        },
        {
          answer: 'Tax',
          correct: false,
        },
        {
          answer: 'subsidy',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    const question1 = questionCreate(questionBody1, quizId1, createAuthData);
    const question2 = questionCreate(questionBody2, quizId1, createAuthData);

    const questionId1 = question1.questionId;
    const questionId2 = question2.questionId;

    const session1 = sessionStart(quizId1, createAuthData, 6);
    const sessionId1 = session1.sessionId;

    const sessionInfo1 = getSessionStatus(quizId1, session1.sessionId, createAuthData);
    const questionPosition1 = 1;

    const answerId1 = sessionInfo1.metadata.questions[questionPosition1 - 1].answers[1 - 1].answerId;
    const answerId2 = sessionInfo1.metadata.questions[questionPosition1 - 1].answers[2 - 1].answerId;
    const answerId3 = sessionInfo1.metadata.questions[questionPosition1 - 1].answers[3 - 1].answerId;

    const questionPosition2 = 2;

    const answerId4 = sessionInfo1.metadata.questions[questionPosition2 - 1].answers[1 - 1].answerId;
    const answerId5 = sessionInfo1.metadata.questions[questionPosition2 - 1].answers[2 - 1].answerId;
    const answerId6 = sessionInfo1.metadata.questions[questionPosition2 - 1].answers[3 - 1].answerId;

    const player1 = playerJoin(sessionId1, '');
    const player2 = playerJoin(sessionId1, 'WangYi');
    const player3 = playerJoin(sessionId1, 'LiQiang');
    const player4 = playerJoin(sessionId1, 'QinGang');
    const player5 = playerJoin(sessionId1, 'CaiQi');

    const playerId1 = player1.playerId;
    const playerId2 = player2.playerId;
    const playerId3 = player3.playerId;
    const playerId4 = player4.playerId;
    const playerId5 = player5.playerId;
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'NEXT_QUESTION');

    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'FINISH_COUNTDOWN');

    sleepSync(2 * 1000);
    playerAnswer([answerId2], playerId2, questionPosition1);
    sleepSync(1 * 1000);
    playerAnswer([answerId2], playerId4, questionPosition1);
    sleepSync(1 * 1000);
    playerAnswer([answerId2], playerId5, questionPosition1);
    playerAnswer([answerId1], playerId4, questionPosition1);
    sleepSync(1 * 1000);
    playerAnswer([answerId3], playerId3, questionPosition1);
    playerAnswer([answerId2], playerId1, questionPosition1);
    sleepSync(2 * 1000);

    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'GO_TO_ANSWER');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'NEXT_QUESTION');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'FINISH_COUNTDOWN');
    playerAnswer([answerId4, answerId6], playerId2, questionPosition2);
    sleepSync(3 * 1000);
    playerAnswer([answerId6, answerId4], playerId1, questionPosition2);
    playerAnswer([answerId5, answerId4], playerId3, questionPosition2);
    sleepSync(1 * 1000);
    playerAnswer([answerId5, answerId6], playerId2, questionPosition2);
    sleepSync(1 * 1000);
    playerAnswer([answerId4, answerId6], playerId5, questionPosition2);
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'GO_TO_ANSWER');

    expect(playerQuestionResults(playerId2, 2)).toStrictEqual(
      {
        questionId: questionId2,
        questionCorrectBreakdown: [
          {
            answerId: answerId4,
            playersCorrect: [
              expect.any(String),
              'LiQiang',
              'CaiQi'
            ]
          },
          {
            answerId: answerId6,
            playersCorrect: [
              expect.any(String),
              'WangYi',
              'CaiQi'
            ]
          }
        ],
        averageAnswerTime: 4,
        percentCorrect: 40,
      }
    );

    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'GO_TO_FINAL_RESULTS');

    expect(playerFinalResults(playerId2)).toStrictEqual({
      usersRankedByScore: [
        {
          name: expect.any(String),
          score: 9.7,
        },
        {
          name: 'CaiQi',
          score: 6.5,
        },
        {
          name: 'WangYi',
          score: 5,
        },
        {
          name: 'LiQiang',
          score: 0,
        },
        {
          name: 'QinGang',
          score: 0,
        }
      ],

      questionResults: [
        {
          questionId: questionId1,
          questionCorrectBreakdown: [
            {
              answerId: answerId2,
              playersCorrect: [
                'WangYi',
                'CaiQi',
                expect.any(String),
              ]
            }
          ],
          averageAnswerTime: 4 || 5,
          percentCorrect: 60,
        },
        {
          questionId: questionId2,
          questionCorrectBreakdown: [
            {
              answerId: answerId4,
              playersCorrect: [
                expect.any(String),
                'LiQiang',
                'CaiQi'
              ]
            },
            {
              answerId: answerId6,
              playersCorrect: [
                expect.any(String),
                'WangYi',
                'CaiQi'
              ]
            }
          ],
          averageAnswerTime: 4 || 5,
          percentCorrect: 40,
        },
      ]
    });
  });
});

describe('POST /v1/player/{playerid}/chat', () => {
  test('400 Errors', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const questionBody1 = {
      question: 'What is the index to measure the inflation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Gini index',
          correct: false,
        },
        {
          answer: 'CPI',
          correct: true,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    questionCreate(questionBody1, quizId1, createAuthData);

    const session1 = sessionStart(quizId1, createAuthData, 3);
    const sessionId1 = session1.sessionId;

    playerJoin(sessionId1, 'WangYi');
    const player2 = playerJoin(sessionId1, '');
    playerJoin(sessionId1, '');

    const playerId2 = player2.playerId;
    const invalidPlayerId = playerId2 + 10086;
    const message1 = {
      messageBody: 'Lets throw 400 type errors!'
    };

    const voidMessage = {
      messageBody: ''
    };

    const longMessage = {
      messageBody: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890',
    };

    expect(() => messageSend(invalidPlayerId, message1)).toThrow(HTTPError[400]);
    expect(() => messageSend(playerId2, voidMessage)).toThrow(HTTPError[400]);
    expect(() => messageSend(playerId2, longMessage)).toThrow(HTTPError[400]);
    expect(messageSend(playerId2, message1)).toStrictEqual({ });
  });
});

describe('GET /v1/player/{playerid}/chat', () => {
  test('Review the messages for a session', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const questionBody1 = {
      question: 'What is the index to measure the inflation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'Gini index',
          correct: false,
        },
        {
          answer: 'CPI',
          correct: true,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    questionCreate(questionBody1, quizId1, createAuthData);

    const session1 = sessionStart(quizId1, createAuthData, 3);
    const sessionId1 = session1.sessionId;

    const player1 = playerJoin(sessionId1, 'WangYi');
    const player2 = playerJoin(sessionId1, 'QinGang');
    const player3 = playerJoin(sessionId1, 'Jessica');

    const playerId1 = player1.playerId;
    const playerId2 = player2.playerId;
    const playerId3 = player3.playerId;

    const invalidPlayerId = playerId2 + 10086;

    const message1 = {
      messageBody: 'Such a hard test'
    };

    const message2 = {
      messageBody: 'LOL XD'
    };

    const message3 = {
      messageBody: 'Come on'
    };

    const message4 = {
      messageBody: 'I guess is the thrid choise'
    };

    expect(messagesReview(playerId3)).toStrictEqual({ messages: [] });

    messageSend(playerId2, message1);
    messageSend(playerId1, message2);
    messageSend(playerId3, message3);
    messageSend(playerId2, message4);

    expect(() => messagesReview(invalidPlayerId)).toThrow(HTTPError[400]);

    expect(messagesReview(playerId2)).toStrictEqual({
      messages: [
        {
          messageBody: message1.messageBody,
          playerId: playerId2,
          playerName: 'QinGang',
          timeSent: expect.any(Number)
        },
        {
          messageBody: message2.messageBody,
          playerId: playerId1,
          playerName: 'WangYi',
          timeSent: expect.any(Number)
        },
        {
          messageBody: message3.messageBody,
          playerId: playerId3,
          playerName: 'Jessica',
          timeSent: expect.any(Number)
        },
        {
          messageBody: message4.messageBody,
          playerId: playerId2,
          playerName: 'QinGang',
          timeSent: expect.any(Number)
        },
      ]

    });
  });
});
