import request from 'sync-request';
import config from './config.json';

import { requestRegister, RequestQuizCreate } from './helperServer';

const ERROR = { error: expect.any(String) };
const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/v1/clear'
  );
});

/// ////////////////////////
describe('/v1/admin/quiz/:quizid/question', () => {
  test('Sucessfully create a question', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());
    const questionId = result.questionId;

    expect(result).toStrictEqual({ questionId: questionId });
    expect(response.statusCode).toBe(200);
  });

  test('invalid token structure', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: null,
          questionBody: {
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
            ]
          }
        }
      }
    );
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('Not loggin session', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;
    const invalidToken = (parseInt(createAuthToken1) + 10086).toString();

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: invalidToken,
          questionBody: {
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
            ]
          }
        }
      }
    );
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });

  test('quizId Errors', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const createAuth2 = requestRegister('Caiqi@unsw.edu.au', '2022zysjcsj', 'Qi', 'Cai');
    const createAuthStr2 = JSON.parse(createAuth2.body.toString());
    const createAuthToken2 = createAuthStr2.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;
    const invalidQuizId = quizId1 + 2002;

    let response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${invalidQuizId}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    let result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);

    response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken2,
          questionBody: {
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
            ]
          }
        }
      }
    );

    result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('The questions string is too long or too short', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    let response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'what',
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
            ]
          }
        }
      }
    );

    let result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);

    response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'what is the index to measure the inflation and I assuem eveyone shoud know this otherwise you are not going to pass our survey wahahahahahahahahahaah',
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
            ]
          }
        }
      }
    );

    result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Answers are too much or too view', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    let response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'what is the index to measure the inflation',
            duration: 5,
            points: 5,
            answers: [
              {
                answer: 'Gini index',
                correct: false,
              },
            ]
          }
        }
      }
    );

    let result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);

    response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'what is the index to measure the inflation',
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
              },
              {
                answer: 'CPU',
                correct: false,
              },
              {
                answer: 'KFC',
                correct: false,
              },
              {
                answer: '.DJI',
                correct: false,
              },
              {
                answer: 'SHA',
                correct: false,
              }
            ]
          }
        }
      }
    );

    result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('zero duration', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'What is the index to measure the inflation',
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
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('duration exceeds 3 minutes', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'What is the index to measure the inflation',
            duration: 90,
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
            ]
          }
        }
      }
    );

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'What is the index to measure the inequality',
            duration: 91,
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
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('zero points', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'What is the index to measure the inflation',
            duration: 10,
            points: 0,
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
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('The length of the answer is too short or too long', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    let response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'What is the index to measure the inflation',
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
            ]
          }
        }
      }
    );

    let result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);

    response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'What is the index to measure the inflation',
            duration: 10,
            points: 5,
            answers: [
              {
                answer: 'You can protest to the government if the inflation is too high!',
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
            ]
          }
        }
      }
    );

    result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('repeated answers', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'What is the index to measure the inflation',
            duration: 5,
            points: 5,
            answers: [
              {
                answer: 'CPI',
                correct: true,
              },
              {
                answer: 'CPI',
                correct: true,
              },
              {
                answer: 'GNI',
                correct: false,
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('All of the answers are false', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'What is the index to measure the inflation',
            duration: 5,
            points: 5,
            answers: [
              {
                answer: 'GDP',
                correct: false,
              },
              {
                answer: 'Gini',
                correct: false,
              },
              {
                answer: 'GNI',
                correct: false,
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });
});

describe('PUT /v1/admin/quiz/:quizid/question/:questionid', () => {
  test('Update the question successfully', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateStr2 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'What is central gov policy',
            duration: 5,
            points: 5,
            answers: [
              {
                answer: 'Monetary Policy',
                correct: true,
              },
              {
                answer: 'Fiscal Policy',
                correct: false,
              },
              {
                answer: 'International trade policy',
                correct: false,
              }
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const questionCreateData2 = JSON.parse(questionCreateStr2.body.toString());
    const questionId2 = questionCreateData2.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId2}`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual({ });
    expect(response.statusCode).toBe(200);

    const quizInfoStr = request(
      'GET',
      SERVER_URL + `/v1/admin/quiz/${quizId1}`,
      {
        qs: createAuthStr1
      }
    );

    const quizInfoData = JSON.parse(quizInfoStr.body.toString());
    expect(quizInfoData).toStrictEqual(
      {
        quizId: quizId1,
        name: 'Economic Survey',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Test peoples knowledge about economics',
        numQuestions: 2,
        questions: [
          {
            questionId: questionId1,
            question: 'What is the index to measure the inflation',
            duration: 5,
            points: 5,
            answers: [
              {
                answerId: 1,
                answer: 'Gini index',
                correct: false,
                colour: expect.any(String),
              },
              {
                answerId: 2,
                answer: 'CPI',
                correct: true,
                colour: expect.any(String),
              },
              {
                answerId: 3,
                answer: 'GNI',
                correct: false,
                colour: expect.any(String),
              }
            ]
          },
          {
            questionId: questionId2,
            question: 'How are you',
            duration: 1,
            points: 1,
            answers: [
              {
                answerId: 1,
                answer: 'Bad',
                correct: false,
                colour: expect.any(String),
              },
              {
                answerId: 2,
                answer: 'Not Good',
                correct: false,
                colour: expect.any(String),
              },
              {
                answerId: 3,
                answer: 'Good',
                correct: true,
                colour: expect.any(String),
              }
            ]
          },
        ],
        duration: 6,
      }
    );
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const invalidQuizId = quizId1 + 10086;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${invalidQuizId}/question/${questionId1}`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'and?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true,
              },
              {
                answer: 'James',
                correct: true,
              },
              {
                answer: 'Simith',
                correct: true,
              },
              {
                answer: 'Carols',
                correct: true
              }
            ]
          }
        }
      }
    );
    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const createAuth1 = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuth2 = requestRegister('jack.wang@unsw.edu.au', 'jackwang123', 'Jack', 'Wang');

    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthData1 = createAuthStr1.token;
    const createAuthStr2 = JSON.parse(createAuth2.body.toString());
    const createAuthData2 = createAuthStr2.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthData1, 'lab02', 'First test');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthData1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}`,
      {
        json: {
          token: createAuthData2,
          questionBody: {
            question: 'and?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true,
              },
              {
                answer: 'James',
                correct: true,
              },
              {
                answer: 'Simith',
                correct: true,
              },
              {
                answer: 'Carols',
                correct: true
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Question string is less than 5 characters in length', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        json: {
          token: createAuthData,
          questionBody: {
            question: 'and?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Question string is greater than 50 characters in length', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        json: {
          token: createAuthData,
          questionBody: {
            question: 'dsjadskad skdjhakh djsahdkja dsakjhjk dakjshdk asdkahkjdsa dhsjkadhjkadhsjkadkad sadhsjkadhjakdhskahdkajdksa dsakjdhsajkhdkja and?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true,
              },
              {
                answer: 'James',
                correct: true,
              },
              {
                answer: 'Simith',
                correct: true,
              },
              {
                answer: 'Carols',
                correct: true
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Question string is less than 2 answers', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        json: {
          token: createAuthData,
          questionBody: {
            question: 'Who is the Monarch of England??',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Question string is more than 6 answers', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        json: {
          token: createAuthData,
          questionBody: {
            question: 'Who is the Monarch of England??',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true
              },
              {
                answer: 'Prince Charles',
                correct: true
              },
              {
                answer: 'James',
                correct: true
              },
              {
                answer: 'Simith',
                correct: true
              },
              {
                answer: 'Carols',
                correct: true
              },
              {
                answer: 'Zachary',
                correct: true
              },
              {
                answer: 'Adam',
                correct: true
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('The question duration is not a positive number', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        json: {
          token: createAuthData,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: -4,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true,
              },
              {
                answer: 'James',
                correct: true,
              },
              {
                answer: 'Simith',
                correct: true,
              },
              {
                answer: 'Carols',
                correct: true
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Invalid questionId', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;
    const invalidQuestionId = questionId1 + 10086;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${invalidQuestionId}`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('If this question were to be updated, the sum of the question durations in the quiz exceeds 3 minutes', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        json: {
          token: createAuthData,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 181,
            points: 5,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true,
              },
              {
                answer: 'James',
                correct: true,
              },
              {
                answer: 'Simith',
                correct: true,
              },
              {
                answer: 'Carols',
                correct: true
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('The points awarded for the question are less than 1', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        json: {
          token: createAuthData,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 0,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true,
              },
              {
                answer: 'James',
                correct: true,
              },
              {
                answer: 'Simith',
                correct: true,
              },
              {
                answer: 'Carols',
                correct: true
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('The points awarded for the question are greater than 10', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        json: {
          token: createAuthData,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 15,
            answers: [
              {
                answer: 'Prince Charles',
                correct: true,
              },
              {
                answer: 'James',
                correct: true,
              },
              {
                answer: 'Simith',
                correct: true,
              },
              {
                answer: 'Carols',
                correct: true
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('The length of any answer is shorter than 1 character long', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        json: {
          token: createAuthData,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: '',
                correct: true,
              },
              {
                answer: 'James',
                correct: true,
              },
              {
                answer: 'Simith',
                correct: true,
              },
              {
                answer: 'Carols',
                correct: true
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('The length of any answer is longer than 30 character long', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        json: {
          token: createAuthData,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 4,
            points: 5,
            answers: [
              {
                answer: 'James Adam Smith Hhwehsuaddsahdjakdhkja Kdjsahdkahdksahdk Ahhsakjhskjahkhkjahdksahkdhsajk',
                correct: true,
              },
              {
                answer: 'James',
                correct: true,
              },
              {
                answer: 'Simith',
                correct: true,
              },
              {
                answer: 'Carols',
                correct: true
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Any answer strings are duplicates of one another (within the same question)', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        json: {
          token: createAuthData,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 5,
            points: 5,
            answers: [
              {
                answer: 'Yes',
                correct: true,
              },
              {
                answer: 'Yes',
                correct: true,
              },
              {
                answer: 'No',
                correct: false,
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('There are no correct answers', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData1.questionId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        json: {
          token: createAuthData,
          questionBody: {
            question: 'Who is the Monarch of England?',
            duration: 5,
            points: 5,
            answers: [
              {
                answer: 'Smith',
                correct: false,
              },
              {
                answer: 'Adam',
                correct: false,
              },
              {
                answer: 'Carol',
                correct: false,
              }
            ]
          }
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });
});

describe('DELETE /v1/admin/quiz/:quizid/question/:questionid', () => {
  test('Sucessfully delete a question', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}`,
      {
        qs: { token: createAuthToken1 }
      }
    );

    const quizInfoStr = request(
      'GET',
      SERVER_URL + `/v1/admin/quiz/${quizId1}`,
      {
        qs: createAuthStr1
      }
    );

    const quizInfoData = JSON.parse(quizInfoStr.body.toString());
    expect(quizInfoData).toStrictEqual(
      {
        quizId: quizId1,
        name: 'Economic Survey',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Test peoples knowledge about economics',
        numQuestions: 0,
        questions: [],
        duration: 0,
      }
    );
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const invalidQuizId = quizId1 + 10086;

    const response = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${invalidQuizId}/question/${questionId1}`,
      {
        qs: { token: createAuthToken1 }
      }
    );
    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const createAuth1 = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuth2 = requestRegister('jack.wang@unsw.edu.au', 'jackwang123', 'Jack', 'Wang');

    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthData1 = createAuthStr1.token;
    const createAuthStr2 = JSON.parse(createAuth2.body.toString());
    const createAuthData2 = createAuthStr2.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthData1, 'lab02', 'First test');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthData1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const response = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}`,
      {
        qs: {
          token: createAuthData2,
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Question Id does not refer to a valid question within this quiz', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;
    const invalidQuestionId = questionId1 + 10086;

    const response = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${invalidQuestionId}`,
      {
        qs: {
          token: createAuthToken1,
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Token is not a valid structure', () => {
    const Auth = requestRegister('ZhangSan@unsw.edu.au', '2023unswcom', 'San', 'Zhang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthToken = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthToken, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthToken,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData.questionId;

    const response = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        qs: {
          token: null
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('Provided token is valid structure, but is not for a currently logged in session', () => {
    const createAuth = requestRegister('Jordan.smith@unsw.edu.au', 'Jordansmith123', 'Jordan', 'Smith'); // :{token: 100000} JSON

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const invalidToken = (parseInt(createAuthData) + 10086).toString();

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const questionCreateStr = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
      {
        json: {
          token: createAuthData,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData = JSON.parse(questionCreateStr.body.toString());
    const questionId = questionCreateData.questionId;

    const response = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId}/question/${questionId}`,
      {
        qs: { token: invalidToken }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });
});

describe('/v1/admin/quiz/:quizid/question/:questionid/move', () => {
  test('move a question successfully', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateStr2 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'What is central gov policy',
            duration: 5,
            points: 5,
            answers: [
              {
                answer: 'Monetary Policy',
                correct: true,
              },
              {
                answer: 'Fiscal Policy',
                correct: false,
              },
              {
                answer: 'International trade policy',
                correct: false,
              }
            ]
          }
        }
      }
    );

    const questionCreateStr3 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'what is not int trade policy',
            duration: 5,
            points: 5,
            answers: [
              {
                answer: 'Tarriffs',
                correct: false,
              },
              {
                answer: 'Quota',
                correct: false,
              },
              {
                answer: 'Infras invest',
                correct: true,
              }
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const questionCreateData2 = JSON.parse(questionCreateStr2.body.toString());
    const questionId2 = questionCreateData2.questionId;

    const questionCreateData3 = JSON.parse(questionCreateStr3.body.toString());
    const questionId3 = questionCreateData3.questionId;

    const newPosition = 2;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}/move`,
      {
        json: {
          token: createAuthToken1,
          newPosition: newPosition,
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual({ });
    expect(response.statusCode).toBe(200);

    const quizInfoStr = request(
      'GET',
      SERVER_URL + `/v1/admin/quiz/${quizId1}`,
      {
        qs: createAuthStr1
      }
    );

    const quizInfoData = JSON.parse(quizInfoStr.body.toString());
    expect(quizInfoData).toStrictEqual(
      {
        quizId: quizId1,
        name: 'Economic Survey',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Test peoples knowledge about economics',
        numQuestions: 3,
        questions: [
          {
            questionId: questionId2,
            question: 'What is central gov policy',
            duration: 5,
            points: 5,
            answers: [
              {
                answerId: 1,
                answer: 'Monetary Policy',
                correct: true,
                colour: expect.any(String),
              },
              {
                answerId: 2,
                answer: 'Fiscal Policy',
                correct: false,
                colour: expect.any(String),
              },
              {
                answerId: 3,
                answer: 'International trade policy',
                correct: false,
                colour: expect.any(String),
              }
            ]
          },
          {
            questionId: questionId3,
            question: 'what is not int trade policy',
            duration: 5,
            points: 5,
            answers: [
              {
                answerId: 1,
                answer: 'Tarriffs',
                correct: false,
                colour: expect.any(String),
              },
              {
                answerId: 2,
                answer: 'Quota',
                correct: false,
                colour: expect.any(String),
              },
              {
                answerId: 3,
                answer: 'Infras invest',
                correct: true,
                colour: expect.any(String),
              }
            ]
          },
          {
            questionId: questionId1,
            question: 'What is the index to measure the inflation',
            duration: 5,
            points: 5,
            answers: [
              {
                answerId: 1,
                answer: 'Gini index',
                correct: false,
                colour: expect.any(String),
              },
              {
                answerId: 2,
                answer: 'CPI',
                correct: true,
                colour: expect.any(String),
              },
              {
                answerId: 3,
                answer: 'GNI',
                correct: false,
                colour: expect.any(String),
              }
            ]
          },
        ],
        duration: 15,
      }
    );
  });

  test('Quiz ID does not refer to a valid quiz in move', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;
    const invalidQuizID = quizId1 + 10086;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const newPosition = 1;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${invalidQuizID}/question/${questionId1}/move`,
      {
        json: {
          token: createAuthToken1,
          newPosition: newPosition,
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Question Id does not refer to a valid question within this quiz in move', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
            question: 'What is central gov policy',
            duration: 5,
            points: 5,
            answers: [
              {
                answer: 'Monetary Policy',
                correct: true,
              },
              {
                answer: 'Fiscal Policy',
                correct: false,
              },
              {
                answer: 'International trade policy',
                correct: false,
              }
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    // const questionCreateData2 = JSON.parse(questionCreateStr2.body.toString());
    // const questionId2 = questionCreateData2.questionId;

    const invalidQuestionId = questionId1 + 10086;
    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${invalidQuestionId}/move`,
      {
        json: {
          token: createAuthToken1,
          newPosition: 1,
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Quiz ID does not refer to a quiz that this user owns in move', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const createAuth2 = requestRegister('caixukun@unsw.edu.au', '2023abcde', 'Xukun', 'Cai');
    const createAuthStr2 = JSON.parse(createAuth2.body.toString());
    const createAuthToken2 = createAuthStr2.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const quizCreateStr2 = RequestQuizCreate(createAuthToken2, 'History Survey', 'Test peoples knowledge about History');
    const quizCreateData2 = JSON.parse(quizCreateStr2.getBody() as string);
    const quizId2 = quizCreateData2.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const newPosition = 2;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId2}/question/${questionId1}/move`,
      {
        json: {
          token: createAuthToken1,
          newPosition: newPosition,
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('NewPosition is less than 0', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const newPosition = -1;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}/move`,
      {
        json: {
          token: createAuthToken1,
          newPosition: newPosition,
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('NewPosition is greater than n-1 where n is the number of questions', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const newPosition = 1;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}/move`,
      {
        json: {
          token: createAuthToken1,
          newPosition: newPosition,
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('NewPosition is the position of the current question', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const newPosition = 0;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}/move`,
      {
        json: {
          token: createAuthToken1,
          newPosition: newPosition,
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Token is not a valid structure in move function', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const newPosition = 1;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}/move`,
      {
        json: {
          token: null,
          newPosition: newPosition,
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('Not for a currently logged in session in move function', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;
    const invalidToken = (parseInt(createAuthToken1) + 10086).toString();

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const newPosition = 2;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}/move`,
      {
        json: {
          token: invalidToken,
          newPosition: newPosition,
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });
});

describe('/v1/admin/quiz/:quizid/question/:questionid/duplicate', () => {
  test('Sucessfully duplicate a question', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}/duplicate`,
      {
        json: { token: createAuthToken1 }
      }
    );
    const result = JSON.parse(response.body.toString());
    const newQuestionId = result.newQuestionId;

    expect(result).toStrictEqual({ newQuestionId: newQuestionId });
    expect(response.statusCode).toBe(200);

    const quizInfoStr = request(
      'GET',
      SERVER_URL + `/v1/admin/quiz/${quizId1}`,
      {
        qs: createAuthStr1
      }
    );

    const quizInfoData = JSON.parse(quizInfoStr.body.toString());
    expect(quizInfoData).toStrictEqual(
      {
        quizId: quizId1,
        name: 'Economic Survey',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Test peoples knowledge about economics',
        numQuestions: 2,
        questions: [
          {
            questionId: questionId1,
            question: 'What is the index to measure the inflation',
            duration: 5,
            points: 5,
            answers: [
              {
                answerId: 1,
                answer: 'Gini index',
                correct: false,
                colour: expect.any(String),
              },
              {
                answerId: 2,
                answer: 'CPI',
                correct: true,
                colour: expect.any(String),
              },
              {
                answerId: 3,
                answer: 'GNI',
                correct: false,
                colour: expect.any(String),
              }
            ]
          },
          {
            questionId: newQuestionId,
            question: 'What is the index to measure the inflation',
            duration: 5,
            points: 5,
            answers: [
              {
                answerId: 1,
                answer: 'Gini index',
                correct: false,
                colour: expect.any(String),
              },
              {
                answerId: 2,
                answer: 'CPI',
                correct: true,
                colour: expect.any(String),
              },
              {
                answerId: 3,
                answer: 'GNI',
                correct: false,
                colour: expect.any(String),
              }
            ]
          },
        ],
        duration: 10,
      }

    );
  });

  test('Quiz ID does not refer to a valid quiz in duplicate', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;
    const invalidquizid = quizId1 + 10086;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${invalidquizid}/question/${questionId1}/duplicate`,
      {
        json: { token: createAuthToken1 }
      }
    );
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Question Id does not refer to a valid question within this quiz in duplicate', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;
    const invalidQuestionId = questionId1 + 10086;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${invalidQuestionId}/duplicate`,
      {
        json: { token: createAuthToken1 }
      }
    );
    const result = JSON.parse(response.body.toString());
    // const newQuestionId = result.newQuestionId;

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Quiz ID does not refer to a quiz that this user owns in duplicate', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const createAuth2 = requestRegister('Caixukun@unsw.edu.au', '2012abyzl', 'Xukun', 'Cai');
    const createAuthStr2 = JSON.parse(createAuth2.body.toString());
    const createAuthToken2 = createAuthStr2.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const quizCreateStr2 = RequestQuizCreate(createAuthToken2, 'History Survey', 'Test peoples knowledge about history');
    const quizCreateData2 = JSON.parse(quizCreateStr2.getBody() as string);
    const quizId2 = quizCreateData2.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId2}/question/${questionId1}/duplicate`,
      {
        json: { token: createAuthToken1 }
      }
    );
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Token is not a valid structure in duplicate', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}/duplicate`,
      {
        json: { token: null }
      }
    );
    const result = JSON.parse(response.body.toString());
    // const newQuestionId = result.newQuestionId;

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('Not for a currently logged in session in duplicate', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;
    const invalidToken = (parseInt(createAuthToken1) + 10086).toString();

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Economic Survey', 'Test peoples knowledge about economics');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const questionCreateStr1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question`,
      {
        json: {
          token: createAuthToken1,
          questionBody: {
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
            ]
          }
        }
      }
    );

    const questionCreateData1 = JSON.parse(questionCreateStr1.body.toString());
    const questionId1 = questionCreateData1.questionId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/question/${questionId1}/duplicate`,
      {
        json: { token: invalidToken }
      }
    );
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });
});
