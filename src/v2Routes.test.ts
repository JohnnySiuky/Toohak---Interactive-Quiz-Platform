import HTTPError from 'http-errors';

import {
  requestRegister,
  RequestQuizCreate,
  clear,
  quizCreate,
  questionCreate,
  authLogout,
  requestLogin,
  getUserdetails,
  updateUserdetails,
  updatePassword,
  listQuiz,
  getQuizInfo,
  updateName,
  updateDescription,
  quizTransfer,
  updateQuestion,
  deleteQuestion,
  moveQuestion,
  duplicateQuizQuestion,
} from './helperServer';

// functions
beforeEach(clear);
afterAll(clear);

describe('/v2/admin/quiz', () => {
  test('succesfully create a quiz', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    expect(quizCreate('quiz1', 'comp1531', createAuthData)).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Not loggin session', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const invalidToken = (parseInt(createAuthData) + 10086).toString();
    expect(() => quizCreate('q1', 'comp1531', invalidToken)).toThrow(HTTPError[403]);
  });

  test('too short quiz name', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    expect(() => quizCreate('q1', 'comp1531', createAuthData)).toThrow(HTTPError[400]);
  });
});

describe('/v2/admin/quiz/{quizid}/question', () => {
  test('succesfully create a question', () => {
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
  });

  test('succesfully create a question', () => {
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
          answer: 'CPI',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    expect(() => questionCreate(questionBody1, quizId1, createAuthData)).toThrow(HTTPError[400]);
  });

  test('url does not return to a valid file', () => {
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
      thumbnailUrl: 'lalalala'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    expect(() => questionCreate(questionBody1, quizId1, createAuthData)).toThrow(HTTPError[400]);
  });

  test('url is not a jpg or png file type', () => {
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
      thumbnailUrl: 'https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=10093831'
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    expect(() => questionCreate(questionBody1, quizId1, createAuthData)).toThrow(HTTPError[400]);
  });

  test('url is a empty string', () => {
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
      thumbnailUrl: ''
    };

    const quiz1 = quizCreate('quiz1', 'comp1531', createAuthData);
    const quizId1 = quiz1.quizId;

    expect(() => questionCreate(questionBody1, quizId1, createAuthData)).toThrow(HTTPError[400]);
  });

  test('404 Errors', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', 'gdpgrowth5', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthData1 = createAuthStr1.token;

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
    const invalidQuizId = quizId1 + 10086;
    expect(() => questionCreate(questionBody1, invalidQuizId, createAuthData)).toThrow(HTTPError[400]);
    expect(() => questionCreate(questionBody1, quizId1, createAuthData1)).toThrow(HTTPError[400]);

    const shortQuestionBody = {
      question: 'What',
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

    expect(() => questionCreate(shortQuestionBody, quizId1, createAuthData)).toThrow(HTTPError[400]);

    const oneAnswerQuestionBody = {
      question: 'What is the index of inflation',
      duration: 5,
      points: 5,
      answers: [
        {
          answer: 'CPI',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    expect(() => questionCreate(oneAnswerQuestionBody, quizId1, createAuthData)).toThrow(HTTPError[400]);

    const zeroDurQuestionBody = {
      question: 'What is the index of inflation',
      duration: 0,
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

    expect(() => questionCreate(zeroDurQuestionBody, quizId1, createAuthData)).toThrow(HTTPError[400]);

    const longDurQuestionBody = {
      question: 'What is the index of inflation',
      duration: 181,
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

    expect(() => questionCreate(longDurQuestionBody, quizId1, createAuthData)).toThrow(HTTPError[400]);

    const largePointsQuestionBody = {
      question: 'What is the index of inflation',
      duration: 10,
      points: 12,
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

    expect(() => questionCreate(largePointsQuestionBody, quizId1, createAuthData)).toThrow(HTTPError[400]);

    const shortAnswerQuestionBody = {
      question: 'What is the index of inflation',
      duration: 10,
      points: 5,
      answers: [
        {
          answer: '',
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

    expect(() => questionCreate(shortAnswerQuestionBody, quizId1, createAuthData)).toThrow(HTTPError[400]);

    const longAnswerQuestionBody = {
      question: 'What is the index of inflation',
      duration: 10,
      points: 5,
      answers: [
        {
          answer: 'the code coverage is so annoying and I am writing it on Thursdat which is one day left before due ',
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

    expect(() => questionCreate(longAnswerQuestionBody, quizId1, createAuthData)).toThrow(HTTPError[400]);
    expect(() => questionCreate(longAnswerQuestionBody, quizId1, createAuthData)).toThrow(HTTPError[400]);

    const allWrongAnswerQuestionBody = {
      question: 'What is the index of inflation',
      duration: 10,
      points: 5,
      answers: [
        {
          answer: 'GDP',
          correct: false,
        },
        {
          answer: 'WTO',
          correct: false,
        },
        {
          answer: 'GNI',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    expect(() => questionCreate(allWrongAnswerQuestionBody, quizId1, createAuthData)).toThrow(HTTPError[400]);
  });
});

describe('/v2/admin/auth/logout', () => {
  test('token is not a valid structure', () => {
    expect(() => authLogout(null)).toThrow(HTTPError[401]);
  });

  test('invalid token structure (empty session)', () => {
    expect(() => authLogout('')).toThrow(HTTPError[401]);
  });

  test('token does not exist', () => {
    expect(() => authLogout('123')).toThrow(HTTPError[400]);
  });

  test('successfully logged out', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    requestLogin('hayden.smith@unsw.edu.au', 'haydensmith123');
    const hayden = JSON.parse(createAuth.body.toString());
    const haydenToken1 = hayden.token;

    expect(authLogout(haydenToken1)).toStrictEqual({});
  });
});

describe('/v2/admin/user/details', () => {
  test('invalid token structure', () => {
    expect(() => getUserdetails(null)).toThrow(HTTPError[401]);
  });

  test('invalid session', () => {
    expect(() => getUserdetails('123')).toThrow(HTTPError[403]);
  });

  test('getting user details successfully', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    expect(getUserdetails(createAuthData)).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Hayden Smith',
        email: 'hayden.smith@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});

describe('/v2/admin/user/details', () => {
  test('invalid token structure', () => {
    expect(() => updateUserdetails('hayden.smith@unsw.edu.au', 'Hayden', 'Smith', null)).toThrow(HTTPError[401]);
  });

  test('token does not exist', () => {
    expect(() => updateUserdetails('hayden.smith@unsw.edu.au', 'Hayden', 'Smith', '123')).toThrow(HTTPError[403]);
  });

  test('email is used by another user', () => {
    const userCreate1 = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');

    requestRegister('shibo@gmail.com', 'shibo123123', 'Shibo', 'Wang');

    const userData1 = JSON.parse(userCreate1.body.toString());

    const userToken1 = userData1.token;

    expect(() => updateUserdetails('shibo@gmail.com', 'Jack', 'Wang', userToken1)).toThrow(HTTPError[400]);
  });

  test('updated successfully', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userData = JSON.parse(userCreate.body.toString());
    const userToken = userData.token;
    expect(updateUserdetails('jack@gmail.com', 'Jack', 'Wang', userToken)).toStrictEqual({});
  });
});

describe('/v2/admin/user/password', () => {
  test('invalid token structure', () => {
    expect(() => updatePassword('jack123123', 'June13455', null)).toThrow(HTTPError[401]);
  });

  test('token does not exist', () => {
    expect(() => updatePassword('jack123123', 'June13455', '123')).toThrow(HTTPError[403]);
  });

  test('Old password is not the correct old password', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    expect(() => updatePassword('jack1231234', 'June13455', userToken.token)).toThrow(HTTPError[400]);
  });

  test('successfully updated password', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    expect(updatePassword('jack123123', 'June13455', userToken.token)).toStrictEqual({});
  });
});

describe('/v2/admin/quiz/list', () => {
  test('Create a quizlist succefully', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    let createAuthStr = JSON.parse(createAuth.body.toString());
    createAuthStr = createAuthStr.token;
    const createQuiz = RequestQuizCreate(createAuthStr, 'quiz1', 'a quiz');
    const quizId = JSON.parse(createQuiz.body.toString()).quizId;

    expect(listQuiz(createAuthStr)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'quiz1'
        }
      ]
    });
  });

  test('Wrong Structure in quizlist', () => {
    expect(() => listQuiz(null)).toThrow(HTTPError[401]);
  });

  test('Not for a currently logged in session in quizlist', () => {
    expect(() => listQuiz('123')).toThrow(HTTPError[403]);
  });
});

describe('GET /v2/admin/quiz/{quizid}', () => {
  test('successfully get the quizInfo', () => {
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

    expect(getQuizInfo(quizId1, createAuthData)).toStrictEqual({
      quizId: quizId1,
      name: 'quiz1',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'comp1531',
      numQuestions: 1,
      questions: [
        {
          question: 'What is the index to measure the inflation',
          questionId: expect.any(Number),
          duration: 5,
          points: 5,
          answers: [
            {
              answer: 'Gini index',
              correct: false,
              answerId: expect.any(Number),
              colour: expect.any(String),
            },
            {
              answer: 'CPI',
              correct: true,
              answerId: expect.any(Number),
              colour: expect.any(String),
            },
            {
              answer: 'GNI',
              correct: false,
              answerId: expect.any(Number),
              colour: expect.any(String),
            }
          ],
          thumbnailUrl: 'https://images.pexels.com/photos/4242688/pexels-photo-4242688.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        }
      ],
      duration: 5,
    });
  });

  test('400 errors', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuth2 = requestRegister('jack@gmail.com', 'jack1241523', 'Jack', 'Wang');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const createAuthStr2 = JSON.parse(createAuth2.body.toString());
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

    expect(() => getQuizInfo(quizId1 + 10086, createAuthData)).toThrow(HTTPError[400]);
    expect(() => getQuizInfo(quizId1, createAuthData2)).toThrow(HTTPError[400]);
  });
});

describe('/v2/admin/quiz/:quizid/name', () => {
  test('Token is not a valid structure', () => {
    const Auth = requestRegister('ZhangSan@unsw.edu.au', '2023unswcom', 'San', 'Zhang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthToken = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthToken, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    expect(() => updateName(quizId, 'fix_bugs', null)).toThrow(HTTPError[401]);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu123456', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab03', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);

    const quizId = quizCreateData.quizId;
    const invalidQuizID = quizId + 10086;

    expect(() => updateName(invalidQuizID, 'fix_bugs', createAuthData)).toThrow(HTTPError[400]);
  });

  test('Provided token is valid structure, but is not for a currently logged in session', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const invalidToken = (parseInt(createAuthData) + 10086).toString();

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    expect(() => updateName(quizId, 'fix_bugs', invalidToken)).toThrow(HTTPError[403]);
  });
});

describe('/v2/admin/quiz/:quizid/description', () => {
  test('Token is not a valid structure', () => {
    const Auth = requestRegister('ZhangSan@unsw.edu.au', '2023unswcom', 'San', 'Zhang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthToken = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthToken, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    expect(() => updateDescription(quizId, 'To fix_bugs', null)).toThrow(HTTPError[401]);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu123456', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab03', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);

    const quizId = quizCreateData.quizId;
    const invalidQuizID = quizId + 10086;

    expect(() => updateDescription(invalidQuizID, 'To fix_bugs', createAuthData)).toThrow(HTTPError[400]);
  });

  test('Provided token is valid structure, but is not for a currently logged in session', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const invalidToken = (parseInt(createAuthData) + 10086).toString();

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    expect(() => updateDescription(quizId, 'To fix_bugs', invalidToken)).toThrow(HTTPError[403]);
  });
});

describe('/v2/admin/quiz/{quizid}/transfer', () => {
  test('Successfully transfer the ownership of a quiz', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    requestRegister('Caiqi@unsw.edu.au', '2022zysjcsj', 'Qi', 'Cai');

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Yearly Survey', 'About peoples performence');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    expect(quizTransfer(quizId1, 'Caiqi@unsw.edu.au', createAuthToken1)).toStrictEqual({});
  });

  test('401 and 403 type of errors', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    requestRegister('Caiqi@unsw.edu.au', '2022zysjcsj', 'Qi', 'Cai');

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Yearly Survey', 'About peoples performence');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    expect(() => quizTransfer(quizId1, 'Caiqi@unsw.edu.au', 'lalalalalala')).toThrow(HTTPError[401]);

    const notLogToken = (parseInt(createAuthToken1) + 10086).toString();

    expect(() => quizTransfer(quizId1, 'Caiqi@unsw.edu.au', notLogToken)).toThrow(HTTPError[403]);
  });

  test('400 type of errors', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Yearly Survey', 'About peoples performence');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    expect(() => quizTransfer(quizId1, 'Dingxuexiang@unsw.edu.au', createAuthToken1)).toThrow(HTTPError[400]);
  });
});

describe('/v2/admin/quiz/{quizid}/question/:questionId', () => {
  test('Update the question successfully', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

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

    const questionCreateStr1 = questionCreate(questionBody1, quizId1, createAuthToken1);
    const questionId1 = questionCreateStr1.questionId;

    const questionBody2 = {
      question: 'How are you',
      duration: 1,
      points: 1,
      answers: [
        {
          answer: 'Bad',
          correct: false,
        },
        {
          answer: 'Not Good',
          correct: false,
        },
        {
          answer: 'Good',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    expect(updateQuestion(quizId1, questionId1, questionBody2, createAuthToken1)).toStrictEqual({});
  });

  test('400 Errors', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const createAuth2 = requestRegister('Caiqi@unsw.edu.au', '2022zysjcsj', 'Qi', 'Cai');
    const createAuthStr2 = JSON.parse(createAuth2.body.toString());
    const createAuthToken2 = createAuthStr2.token;

    const quizCreateStr1 = quizCreate('Economic Survey', 'Test peoples knowledge about economics', createAuthToken1);
    const quizId1 = quizCreateStr1.quizId;

    const quizCreateStr2 = quizCreate('COMP1531', 'Mid Quiz', createAuthToken1);
    const quizId2 = quizCreateStr2.quizId;

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

    const questionCreateStr1 = questionCreate(questionBody1, quizId1, createAuthToken1);
    const questionId1 = questionCreateStr1.questionId;
    const invalidQuizId = quizId1 + 10086;

    const questionBody2 = {
      question: 'How are you',
      duration: 1,
      points: 1,
      answers: [
        {
          answer: 'Bad',
          correct: false,
        },
        {
          answer: 'Not Good',
          correct: false,
        },
        {
          answer: 'Good',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody3 = {
      question: 'How',
      duration: 1,
      points: 1,
      answers: [
        {
          answer: 'Bad',
          correct: false,
        },
        {
          answer: 'Not Good',
          correct: false,
        },
        {
          answer: 'Good',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody4 = {
      question: 'How are you today',
      duration: 1,
      points: 1,
      answers: [
        {
          answer: 'Bad',
          correct: true,
        },
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody5 = {
      question: 'How are you today',
      duration: 0,
      points: 1,
      answers: [
        {
          answer: 'Bad',
          correct: false,
        },
        {
          answer: 'Not Good',
          correct: false,
        },
        {
          answer: 'Good',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody6 = {
      question: 'How are you today',
      duration: 10086,
      points: 1,
      answers: [
        {
          answer: 'Bad',
          correct: false,
        },
        {
          answer: 'Not Good',
          correct: false,
        },
        {
          answer: 'Good',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody7 = {
      question: 'How are you today',
      duration: 1,
      points: 0,
      answers: [
        {
          answer: 'Bad',
          correct: false,
        },
        {
          answer: 'Not Good',
          correct: false,
        },
        {
          answer: 'Good',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody8 = {
      question: 'How are you today',
      duration: 1,
      points: 1,
      answers: [
        {
          answer: '',
          correct: false,
        },
        {
          answer: 'Not Good',
          correct: false,
        },
        {
          answer: 'Good',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody9 = {
      question: 'How are you today',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
          correct: false,
        },
        {
          answer: 'Not Good',
          correct: false,
        },
        {
          answer: 'Good',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody10 = {
      question: 'How are you today',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'Bad',
          correct: false,
        },
        {
          answer: 'Bad',
          correct: false,
        },
        {
          answer: 'Bad',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody15 = {
      question: 'How are you today',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'Good',
          correct: false,
        },
        {
          answer: 'Nice',
          correct: false,
        },
        {
          answer: 'Great',
          correct: false,
        }
      ],
      thumbnailUrl: 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    };

    const questionBody11 = {
      question: 'How are you today',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'Good',
          correct: false,
        },
        {
          answer: 'Nice',
          correct: false,
        },
        {
          answer: 'Bad',
          correct: true,
        }
      ],
      thumbnailUrl: ''
    };

    const questionBody12 = {
      question: 'How are you today',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'Good',
          correct: false,
        },
        {
          answer: 'Nice',
          correct: false,
        },
        {
          answer: 'Bad',
          correct: true,
        }
      ],
      thumbnailUrl: 'hjjhvhjvjvvhjvhj'
    };

    const questionBody14 = {
      question: 'How are you today',
      duration: 1,
      points: 5,
      answers: [
        {
          answer: 'Good',
          correct: false,
        },
        {
          answer: 'Nice',
          correct: false,
        },
        {
          answer: 'Bad',
          correct: true,
        }
      ],
      thumbnailUrl: 'https://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=10093831'
    };

    expect(() => updateQuestion(invalidQuizId, questionId1, questionBody2, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody2, createAuthToken2)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId2, questionId1, questionBody2, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody3, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody4, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody5, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody6, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody7, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody8, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody9, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody10, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody11, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody12, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody14, createAuthToken1)).toThrow(HTTPError[400]);
    expect(() => updateQuestion(quizId1, questionId1, questionBody15, createAuthToken1)).toThrow(HTTPError[400]);
  });
});

describe('/v2/admin/quiz/:quizid/question/:questionid', () => {
  test('Sucessfully delete a question', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

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

    const questionCreateStr1 = questionCreate(questionBody1, quizId1, createAuthToken1);
    const questionId1 = questionCreateStr1.questionId;

    expect(deleteQuestion(quizId1, questionId1, createAuthToken1)).toStrictEqual({});
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

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

    const questionCreateStr1 = questionCreate(questionBody1, quizId1, createAuthToken1);

    const questionId1 = questionCreateStr1.questionId;

    const invalidQuizId = quizId1 + 10086;

    expect(() => deleteQuestion(invalidQuizId, questionId1, createAuthToken1)).toThrow(HTTPError[400]);
  });

  test('Token is not a valid structure', () => {
    const Auth = requestRegister('ZhangSan@unsw.edu.au', '2023unswcom', 'San', 'Zhang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthToken = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthToken, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

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

    const questionCreateStr1 = questionCreate(questionBody1, quizId, createAuthToken);

    const questionId1 = questionCreateStr1.questionId;

    expect(() => deleteQuestion(quizId, questionId1, null)).toThrow(HTTPError[401]);
  });

  test('Provided token is valid structure, but is not for a currently logged in session', () => {
    const createAuth = requestRegister('Jordan.smith@unsw.edu.au', 'Jordansmith123', 'Jordan', 'Smith'); // :{token: 100000} JSON

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const invalidToken = (parseInt(createAuthData) + 10086).toString();

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

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

    const questionCreateStr1 = questionCreate(questionBody1, quizId, createAuthData);

    const questionId1 = questionCreateStr1.questionId;

    expect(() => deleteQuestion(quizId, questionId1, invalidToken)).toThrow(HTTPError[403]);
  });
});

describe('/v2/admin/quiz/:quizid/question/:questionid/move', () => {
  test('move a question successfully', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

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

    const questionCreateStr1 = questionCreate(questionBody1, quizId1, createAuthToken1);

    const questionId1 = questionCreateStr1.questionId;

    const newPosition = 2;

    expect(moveQuestion(quizId1, questionId1, newPosition, createAuthToken1)).toStrictEqual({});
  });

  test('Quiz ID does not refer to a valid quiz in move', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;
    const invalidQuizID = quizId1 + 10086;

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

    const questionCreateStr1 = questionCreate(questionBody1, quizId1, createAuthToken1);

    const questionId1 = questionCreateStr1.questionId;

    const newPosition = 1;

    expect(() => moveQuestion(invalidQuizID, questionId1, newPosition, createAuthToken1)).toThrow(HTTPError[400]);
  });

  test('Token is not a valid structure in move function', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

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

    const questionCreateStr1 = questionCreate(questionBody1, quizId1, createAuthToken1);

    const questionId1 = questionCreateStr1.questionId;

    const newPosition = 1;

    expect(() => moveQuestion(quizId1, questionId1, newPosition, null)).toThrow(HTTPError[401]);
  });

  test('Not for a currently logged in session in move function', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;
    const invalidToken = (parseInt(createAuthToken1) + 10086).toString();

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

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

    const questionCreateStr1 = questionCreate(questionBody1, quizId1, createAuthToken1);

    const questionId1 = questionCreateStr1.questionId;

    const newPosition = 2;

    expect(() => moveQuestion(quizId1, questionId1, newPosition, invalidToken)).toThrow(HTTPError[403]);
  });
});

describe('/v2/admin/quiz/:quizid/question/:questionid/duplicate', () => {
  test('Sucessfully duplicate a question', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

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

    const questionCreateStr1 = questionCreate(questionBody1, quizId1, createAuthToken1);

    const questionId1 = questionCreateStr1.questionId;

    expect(duplicateQuizQuestion(quizId1, questionId1, createAuthToken1)).toStrictEqual({ newQuestionId: expect.any(Number) });
  });
});
