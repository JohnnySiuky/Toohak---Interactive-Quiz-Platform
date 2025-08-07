import HTTPError from 'http-errors';

import {
  requestRegister,
  clear,
  quizCreate,
  questionCreate,
  sessionStart,
  getSessionStatus,
  sessionStateUpdate,
  sessionActivity,
  sessionFinalResults,
  playerJoin,
  playerAnswer,
  sleepSync,
} from './helperServer';

beforeEach(clear);
afterAll(clear);

// tests for starting session
describe('/v1/admin/quiz/:quizid/session/start', () => {
  test('succesfully started a session', () => {
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

    expect(questionCreate(questionBody1, quizId1, createAuthData)).toStrictEqual({ questionId: expect.any(Number) });
    expect(sessionStart(quizId1, createAuthData, 50)).toStrictEqual({ sessionId: expect.any(Number) });
  });

  test('invalid token structure', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
    expect(() => sessionStart(quizId1, null, 50)).toThrow(HTTPError[401]);
  });

  test('invalid token structure', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
    expect(() => sessionStart(quizId1, '', 50)).toThrow(HTTPError[401]);
  });

  test('invalid logged session', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
    expect(() => sessionStart(quizId1, createAuthData + 10086, 50)).toThrow(HTTPError[403]);
  });

  test('invalid quiz id', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
    expect(() => sessionStart(quizId1 + 10086, createAuthData, 50)).toThrow(HTTPError[400]);
  });

  test('invalid access to the quiz', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuth2 = requestRegister('jack@unsw.edu.au', 'jack1231234', 'Jack', 'Wang');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthStr2 = JSON.parse(createAuth2.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
    expect(() => sessionStart(quizId1, createAuthStr2.token, 50)).toThrow(HTTPError[400]);
  });

  test('autoStartNum is greater than 50', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
    expect(() => sessionStart(quizId1, createAuthData, 52)).toThrow(HTTPError[400]);
  });

  test('the quiz does not have any questions', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
    expect(() => sessionStart(quizId1, createAuthData, 50)).toThrow(HTTPError[400]);
  });

  test('more than 10 active sessions', () => {
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

    for (let i = 0; i < 10; i++) {
      sessionStart(quizId1, createAuthData, i + 1);
    }
    expect(() => sessionStart(quizId1, createAuthData, 50)).toThrow(HTTPError[400]);
  });
});

// tests for getSessionStatus
describe('/v1/admin/quiz/:quizid/session/:sessionid', () => {
  test('succesfully got session status', () => {
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
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData)).toStrictEqual({
      state: 'LOBBY',
      atQuestion: 0,
      players: [],
      metadata: {
        quizId: quizId1,
        name: 'quiz1',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'comp1531',
        numQuestions: 1,
        questions: [
          {
            questionId: expect.any(Number),
            question: 'What is the index to measure the inflation',
            duration: 5,
            points: 5,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Gini index',
                correct: false,
                colour: expect.any(String),
              },
              {
                answerId: expect.any(Number),
                answer: 'CPI',
                correct: true,
                colour: expect.any(String),
              },
              {
                answerId: expect.any(Number),
                answer: 'GNI',
                correct: false,
                colour: expect.any(String),
              }
            ],
            thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
          }
        ],
        duration: 5,
      },
    });
  });

  test('invalid token structure', () => {
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
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => getSessionStatus(quizId1, session.sessionId, '')).toThrow(HTTPError[401]);
  });

  test('invalid token structure(null)', () => {
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
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => getSessionStatus(quizId1, session.sessionId, null)).toThrow(HTTPError[401]);
  });

  test('invalid token structure(not number)', () => {
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
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => getSessionStatus(quizId1, session.sessionId, 'qweqwe')).toThrow(HTTPError[401]);
  });

  test('invalid loggin session', () => {
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
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => getSessionStatus(quizId1, session.sessionId, '10086')).toThrow(HTTPError[403]);
  });

  test('quiz id does not refer to a valid quiz', () => {
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
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => getSessionStatus(quizId1 + 121, session.sessionId, createAuthData)).toThrow(HTTPError[400]);
  });

  test('quiz id does not refer to a quiz that this user owns', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuth2 = requestRegister('jack@unsw.edu.au', 'jack1231234', 'Jack', 'Wang');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthStr2 = JSON.parse(createAuth2.body.toString());
    const createAuthData = createAuthStr.token;
    const createAuthData2 = createAuthStr2.token;
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
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => getSessionStatus(quizId1, session.sessionId, createAuthData2)).toThrow(HTTPError[400]);
  });

  test('session id does not refer to this quiz', () => {
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
    const quiz2 = quizCreate('quiz2', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
    const quizId2 = quiz2.quizId;
    questionCreate(questionBody1, quizId1, createAuthData);
    questionCreate(questionBody1, quizId2, createAuthData);
    sessionStart(quizId1, createAuthData, 50);
    const session = sessionStart(quizId2, createAuthData, 50);
    expect(() => getSessionStatus(quizId1, session.sessionId, createAuthData)).toThrow(HTTPError[400]);
  });
});

// session state update
describe('/v1/admin/quiz/:quizid/session/:sessionid', () => {
  test('succesfully completed a session without any submission', () => {
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
    const session = sessionStart(quizId1, createAuthData, 50);
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'NEXT_QUESTION');
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData).state).toStrictEqual('QUESTION_COUNTDOWN');
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'FINISH_COUNTDOWN');
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData).state).toStrictEqual('QUESTION_OPEN');
    sleepSync(5 * 1000);
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData).state).toStrictEqual('QUESTION_CLOSE');
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'GO_TO_ANSWER');
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData).state).toStrictEqual('ANSWER_SHOW');
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'NEXT_QUESTION');
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData).state).toStrictEqual('QUESTION_COUNTDOWN');
    // question open -> answer show
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'FINISH_COUNTDOWN');
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData).state).toStrictEqual('QUESTION_OPEN');
    sleepSync(2 * 1000);
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'GO_TO_ANSWER');
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData).state).toStrictEqual('ANSWER_SHOW');
    sleepSync(5 * 1000);
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData).state).toStrictEqual('ANSWER_SHOW');
    // end of the session
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'GO_TO_FINAL_RESULTS');
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData).state).toStrictEqual('FINAL_RESULTS');
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'END');
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData).state).toStrictEqual('END');
  });

  test('invalid actions', () => {
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
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'FINISH_COUNTDOWN')).toThrow(HTTPError[400]);
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'GO_TO_ANSWER')).toThrow(HTTPError[400]);
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'NEXT_QUESTION');
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData).state).toStrictEqual('QUESTION_COUNTDOWN');
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'FINISH_COUNTDOWN');
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
    sleepSync(5 * 1000);
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'FINISH_COUNTDOWN')).toThrow(HTTPError[400]);
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'GO_TO_ANSWER');
    expect(getSessionStatus(quizId1, session.sessionId, createAuthData).state).toStrictEqual('ANSWER_SHOW');
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'FINISH_COUNTDOWN')).toThrow(HTTPError[400]);
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'GO_TO_FINAL_RESULTS');
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
    sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'END');
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });

  test('invalid token structure', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
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
    questionCreate(questionBody1, quizId1, createAuthData);
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => sessionStateUpdate(quizId1, session.sessionId, null, 'NEXT_QUESTION')).toThrow(HTTPError[401]);
  });

  test('invalid token structure', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
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
    questionCreate(questionBody1, quizId1, createAuthData);
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => sessionStateUpdate(quizId1, session.sessionId, '', 'NEXT_QUESTION')).toThrow(HTTPError[401]);
  });

  test('invalid token structure', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
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
    questionCreate(questionBody1, quizId1, createAuthData);
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => sessionStateUpdate(quizId1, session.sessionId, 'qaqaq', 'NEXT_QUESTION')).toThrow(HTTPError[401]);
  });

  test('invalid logged session', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
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
    questionCreate(questionBody1, quizId1, createAuthData);
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData + '123', 'NEXT_QUESTION')).toThrow(HTTPError[403]);
  });

  test('invalid quizid', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
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
    questionCreate(questionBody1, quizId1, createAuthData);
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => sessionStateUpdate(quizId1 + 10086, session.sessionId, createAuthData, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });

  test('quizid does not refer to this user', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuth2 = requestRegister('smith@unsw.edu.au', 'aksdb3w141234hb', 'Haydennnn', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthStr2 = JSON.parse(createAuth2.body.toString());
    const createAuthData = createAuthStr.token;
    const createAuthData2 = createAuthStr2.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
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
    questionCreate(questionBody1, quizId1, createAuthData);
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData2, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });

  test('session id does not refer to this quiz', () => {
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
    const quiz2 = quizCreate('quiz2', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
    const quizId2 = quiz2.quizId;
    questionCreate(questionBody1, quizId1, createAuthData);
    questionCreate(questionBody1, quizId2, createAuthData);
    sessionStart(quizId1, createAuthData, 50);
    const session = sessionStart(quizId2, createAuthData, 50);
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });

  test('invalid action enum', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
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
    questionCreate(questionBody1, quizId1, createAuthData);
    const session = sessionStart(quizId1, createAuthData, 50);
    expect(() => sessionStateUpdate(quizId1, session.sessionId, createAuthData, 'NEXT')).toThrow(HTTPError[400]);
  });
});

describe('/v1/admin/quiz/{quizid}/sessions', () => {
  test('get sessions activity for a quiz', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;
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
    questionCreate(questionBody1, quizId1, createAuthData);

    const session1 = sessionStart(quizId1, createAuthData, 5);
    const session2 = sessionStart(quizId1, createAuthData, 5);
    const session3 = sessionStart(quizId1, createAuthData, 10);
    const session4 = sessionStart(quizId1, createAuthData, 10);
    const session5 = sessionStart(quizId1, createAuthData, 10);
    const session6 = sessionStart(quizId1, createAuthData, 10);

    const sessionId1 = session1.sessionId;
    const sessionId2 = session2.sessionId;
    const sessionId3 = session3.sessionId;
    const sessionId4 = session4.sessionId;
    const sessionId5 = session5.sessionId;
    const sessionId6 = session6.sessionId;

    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'END');
    sessionStateUpdate(quizId1, sessionId3, createAuthData, 'END');
    sessionStateUpdate(quizId1, sessionId5, createAuthData, 'END');

    expect(sessionActivity(quizId1, createAuthData)).toStrictEqual({
      activeSessions: [
        sessionId2,
        sessionId4,
        sessionId6,
      ],
      inactiveSessions: [
        sessionId1,
        sessionId3,
        sessionId5,
      ]
    });
  });
});

describe('/v1/admin/quiz/{quizid}/session/{sessionid}/results', () => {
  test('ERRORs', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', 'gdpgrowth5percent', 'Hayden', 'Smith');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthData1 = createAuthStr1.token;

    const quiz1 = quizCreate('Quiz1', 'COMP1531', createAuthData);
    const quizId1 = quiz1.quizId;
    const invalidQuizId = quizId1 + 10086;

    const quiz2 = quizCreate('MidQuiz', 'FINS2624', createAuthData);
    const quizId2 = quiz2.quizId;

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
    questionCreate(questionBody1, quizId1, createAuthData);
    const session1 = sessionStart(quizId1, createAuthData, 3);
    const sessionId1 = session1.sessionId;

    playerJoin(sessionId1, 'WangYi');
    playerJoin(sessionId1, '');
    playerJoin(sessionId1, 'QinGang');

    expect(() => sessionFinalResults(quizId1, sessionId1, createAuthData)).toThrow(HTTPError[400]);

    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'FINISH_COUNTDOWN');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'GO_TO_ANSWER');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'GO_TO_FINAL_RESULTS');

    expect(() => sessionFinalResults(invalidQuizId, sessionId1, createAuthData)).toThrow(HTTPError[400]);
    expect(() => sessionFinalResults(quizId2, sessionId1, createAuthData)).toThrow(HTTPError[400]);
    expect(() => sessionFinalResults(quizId1, sessionId1, createAuthData1)).toThrow(HTTPError[400]);
    expect(() => sessionFinalResults(quizId2, sessionId1, 'TOKEN!')).toThrow(HTTPError[401]);
    expect(() => sessionFinalResults(quizId2, sessionId1, createAuthData + 10086)).toThrow(HTTPError[403]);
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

    const questionBody3 = {
      question: 'Do not Answer',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'Do',
          correct: true,
        },
        {
          answer: 'Not',
          correct: false,
        },
        {
          answer: 'Answer',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'

    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    const question1 = questionCreate(questionBody1, quizId1, createAuthData);
    const question2 = questionCreate(questionBody2, quizId1, createAuthData);
    const question3 = questionCreate(questionBody3, quizId1, createAuthData);

    const questionId1 = question1.questionId;
    const questionId2 = question2.questionId;
    const questionId3 = question3.questionId;

    const session1 = sessionStart(quizId1, createAuthData, 6);
    const sessionId1 = session1.sessionId;

    const sessionInfo1 = getSessionStatus(quizId1, session1.sessionId, createAuthData);
    const questionPosition1 = 1;

    const answerId1 = sessionInfo1.metadata.questions[questionPosition1 - 1].answers[1 - 1].answerId;
    const answerId2 = sessionInfo1.metadata.questions[questionPosition1 - 1].answers[2 - 1].answerId;
    const answerId3 = sessionInfo1.metadata.questions[questionPosition1 - 1].answers[3 - 1].answerId;

    const questionPosition2 = 2;
    const questionPosition3 = 3;

    const answerId4 = sessionInfo1.metadata.questions[questionPosition2 - 1].answers[1 - 1].answerId;
    const answerId5 = sessionInfo1.metadata.questions[questionPosition2 - 1].answers[2 - 1].answerId;
    const answerId6 = sessionInfo1.metadata.questions[questionPosition2 - 1].answers[3 - 1].answerId;

    const answerId7 = sessionInfo1.metadata.questions[questionPosition3 - 1].answers[1 - 1].answerId;

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
    // sleepSync(1 * 1000);
    // playerAnswer([answerId4, answerId6], playerId4, questionPosition2);
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'GO_TO_ANSWER');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'NEXT_QUESTION');
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'FINISH_COUNTDOWN');
    sleepSync(1 * 1000);
    sessionStateUpdate(quizId1, sessionId1, createAuthData, 'GO_TO_FINAL_RESULTS');

    expect(sessionFinalResults(quizId1, sessionId1, createAuthData)).toStrictEqual({
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
        },
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
                'CaiQi',
              ]
            },
            {
              answerId: answerId6,
              playersCorrect: [
                expect.any(String),
                'WangYi',
                'CaiQi',
              ]
            }
          ],
          averageAnswerTime: 4 || 5,
          percentCorrect: 40,
        },
        {
          questionId: questionId3,
          questionCorrectBreakdown: [
            {
              answerId: answerId7,
              playersCorrect: [],
            },
          ],
          averageAnswerTime: 0,
          percentCorrect: 0,
        },
      ]
    });
  });
});
