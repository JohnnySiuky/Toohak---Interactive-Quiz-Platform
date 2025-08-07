import request from 'sync-request';
import config from './config.json';
import HTTPError from 'http-errors';

import {
  requestRegister,
  RequestQuizCreate,
  requestQuizList,
  requestQuizRestore,
  updateQuizThumbnail,
  getQuizInfo,
  questionCreate,
  quizCreate,
} from './helperServer';

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

describe('/v1/admin/quiz', () => {
  test('Create a quiz succefully', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    let createAuthStr = JSON.parse(createAuth.body.toString());
    createAuthStr = createAuthStr.token;

    const response = RequestQuizCreate(createAuthStr, 'lab02', 'First test to count the marks');
    const result = JSON.parse(response.body.toString());
    const quizId = result.quizId;
    expect(result).toStrictEqual({ quizId: quizId });
    expect(response.statusCode).toBe(200);
  });

  test('Quiz name contains invalid characters', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    let createAuthStr = JSON.parse(createAuth.body.toString());
    createAuthStr = createAuthStr.token;

    const response = RequestQuizCreate(createAuthStr, 'lab_02', 'First test to count the marks');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Quiz name Input less than 3 words', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    let createAuthStr = JSON.parse(createAuth.body.toString());
    createAuthStr = createAuthStr.token;

    const response = RequestQuizCreate(createAuthStr, 'l2', 'First test to count the marks');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Quiz name input more than 30 words', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    let createAuthStr = JSON.parse(createAuth.body.toString());
    createAuthStr = createAuthStr.token;

    const response = RequestQuizCreate(createAuthStr, 'laboratary02wewewewewewewrewrrrrrrrfffvfvfffrfrrrgrrgrgrgrgrgrgrgrgrgrgrggtyygy', 'First test to count the marks');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Quiz Name used in another quiz', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    let createAuthStr = JSON.parse(createAuth.body.toString());
    createAuthStr = createAuthStr.token;

    RequestQuizCreate(createAuthStr, 'lab02', 'First test to count the marks');
    const response2 = RequestQuizCreate(createAuthStr, 'lab02', 'First test to count the marks');
    const result = JSON.parse(response2.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response2.statusCode).toBe(400);
  });

  test('Description more than 100 words', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    let createAuthStr = JSON.parse(createAuth.body.toString());
    createAuthStr = createAuthStr.token;

    const response = RequestQuizCreate(createAuthStr, 'lab02', 'axasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasasac vfewsddd');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Wrong Structure in quiz', () => {
    const response = RequestQuizCreate(null, 'lab02', 'First test to count the marks');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('Wrong Structure in quiz (empty string)', () => {
    const response = RequestQuizCreate('', 'lab02', 'First test to count the marks');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('Not for a currently logged in session in quiz', () => {
    const response = RequestQuizCreate('12', 'lab02', 'First test to count the marks');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });
});

describe('DELETE /v1/admin/quiz/:quizid', () => {
  test('delete a quiz succefully', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId}`,
      {
        qs: createAuthStr
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual({});
    expect(response.statusCode).toBe(200);
  });

  test('Quiz ID does not refer to a valid quiz in delete QuizID', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;
    const invalidQuizID = quizId + 10086;

    const response = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${invalidQuizID}`,
      {
        qs: createAuthStr
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Quiz ID does not refer to a quiz that this user owns in delete QuizID', () => {
    const createAuth1 = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuth2 = requestRegister('jack.wang@unsw.edu.au', 'jackwang123', 'Jack', 'Wang');

    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthData1 = createAuthStr1.token;
    const createAuthStr2 = JSON.parse(createAuth2.body.toString());

    const quizCreateStr1 = RequestQuizCreate(createAuthData1, 'lab02', 'First test');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    // const response = RequestQuizRemove(quizId, createAuth);

    const response = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId1}`,
      {
        qs: createAuthStr2
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Token is not a valid structure in delete QuizID', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId}`,
      {
        qs: null
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('not for a currently logged in session in delete QuizID', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const invalidToken = (parseInt(createAuthData) + 10086).toString();

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId}`,
      {
        qs: { token: invalidToken }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });
});

describe('/v1/admin/quiz/list', () => {
  test('Create a quizlist succefully', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    let createAuthStr = JSON.parse(createAuth.body.toString());
    createAuthStr = createAuthStr.token;
    const createQuiz = RequestQuizCreate(createAuthStr, 'quiz1', 'a quiz');
    const quizId = JSON.parse(createQuiz.body.toString()).quizId;

    const response = requestQuizList(createAuthStr);
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'quiz1'
        }
      ]
    });
    expect(response.statusCode).toBe(200);
  });

  test('Wrong Structure in quizlist', () => {
    const response = requestQuizList(null);
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('Wrong Structure in quizlist(empty string)', () => {
    const response = requestQuizList('');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('Not for a currently logged in session in quizlist', () => {
    const response = requestQuizList('123');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });
});

describe('GET /v1/admin/quiz/{quizid}', () => {
  test('Quiz ID does not refer to a valid quiz in {quiz}', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;
    const invalidQuizID = quizId + 10086;

    const response = request(
      'GET',
      SERVER_URL + `/v1/admin/quiz/${invalidQuizID}`,
      {
        qs: createAuthStr
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Quiz ID does not refer to a quiz that this user owns in {quiz}', () => {
    const createAuth1 = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuth2 = requestRegister('jack.wang@unsw.edu.au', 'jackwang123', 'Jack', 'Wang');

    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthData1 = createAuthStr1.token;
    const createAuthStr2 = JSON.parse(createAuth2.body.toString());

    const quizCreateStr1 = RequestQuizCreate(createAuthData1, 'lab02', 'First test');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const response = request(
      'GET',
      SERVER_URL + `/v1/admin/quiz/${quizId1}`,
      {
        qs: createAuthStr2
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Token is not a valid structure in {quiz}', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'GET',
      SERVER_URL + `/v1/admin/quiz/${quizId}`,
      {
        qs: null
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('Not for a currently logged in session in {quiz}', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const invalidToken = (parseInt(createAuthData) + 10086).toString();

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'GET',
      SERVER_URL + `/v1/admin/quiz/${quizId}`,
      {
        qs: { token: invalidToken }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });
});

describe('/v1/admin/quiz/:quizid/name', () => {
  test('Token is not a valid structure', () => {
    const Auth = requestRegister('ZhangSan@unsw.edu.au', '2023unswcom', 'San', 'Zhang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthToken = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthToken, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/name`,
      {
        json: {
          token: null,
          name: 'Fixbug',
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu123456', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab03', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);

    const quizId = quizCreateData.quizId;
    const invalidQuizID = quizId + 10086;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${invalidQuizID}/name`,
      {
        json: {
          token: createAuthData,
          name: 'Fixbug',
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const Auth1 = requestRegister('GuanYu@unsw.edu.au', 'Passd12345', 'Yu', 'Guan');
    const Auth2 = requestRegister('JuneSun@unsw.edu.au', 'junesun123', 'Sun', 'June');

    const createAuthStr1 = JSON.parse(Auth1.body.toString());
    const createAuthData1 = createAuthStr1.token;
    const createAuthStr2 = JSON.parse(Auth2.body.toString());
    const createAuthData2 = createAuthStr2.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthData1, 'lab02', 'First test');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/name`,
      {
        json: {
          token: createAuthData2,
          name: 'Fixbugs'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Name contains invalid characters. Valid characters are alphanumeric and spaces', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu123456', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab03', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const nameData = quizCreateData.quizId;
    const invalidName = nameData + '&';

    // const response = RequestQuizRemove(quizId, createAuth);

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${invalidName}/name`,
      {
        json: {
          token: createAuthData,
          name: '&&&(((&'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Name is more than 30 characters long', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu123456', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/name`,
      {
        json: {
          token: createAuthData,
          name: 'lab123456789123456789123456789888111'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Name is less than 3 characters long', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu1234', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/name`,
      {
        json: {
          token: createAuthData,
          name: 'L1'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Name is already used by the current logged in user for another quiz', () => {
    const Auth = requestRegister('GuanYu@unsw.edu.au', 'Passd12345', 'Yu', 'Guan');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/name`,
      {
        json: {
          token: createAuthData,
          name: 'lab01'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Provided token is valid structure, but is not for a currently logged in session', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const invalidToken = (parseInt(createAuthData) + 10086).toString();

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/name`,
      {
        json: {
          token: invalidToken,
          name: 'fixbugs'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });

  test('updated quiz name', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const invalidToken = parseInt(createAuthData).toString();

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/name`,
      {
        json: {
          token: invalidToken,
          name: 'fixbugs'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual({});
    expect(response.statusCode).toBe(200);
  });
});

describe('/v1/admin/quiz/:quizid/description', () => {
  test('Token is not a valid structure', () => {
    const Auth = requestRegister('ZhangSan@unsw.edu.au', '2023unswcom', 'San', 'Zhang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthToken = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthToken, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/description`,
      {
        json: {
          token: null,
          description: 'I fix this bug!'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu123456', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab03', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;
    const invalidQuizID = quizId + 10086;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${invalidQuizID}/description`,
      {
        json: {
          token: createAuthData,
          description: 'I fix this bug!'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const Auth1 = requestRegister('GuanYu@unsw.edu.au', 'Passd12345', 'Yu', 'Guan');
    const Auth2 = requestRegister('JuneSun@unsw.edu.au', 'junesun123', 'Sun', 'June');

    const createAuthStr1 = JSON.parse(Auth1.body.toString());
    const createAuthData1 = createAuthStr1.token;
    const createAuthStr2 = JSON.parse(Auth2.body.toString());
    const createAuthData2 = createAuthStr2.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthData1, 'lab02', 'First test');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/description`,
      {
        json: {
          token: createAuthData2,
          description: 'I fix this bug!'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Name is more than 100 characters in length', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu123456', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab01', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/description`,
      {
        json: {
          token: createAuthData,
          description: 'This is a lab 21321342214241421421414214214214141414142141421424141414214124242141414142142141414141424214141414214141321324324131412421242142141313412313124231'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Provided token is valid structure, but is not for a currently logged in session', () => {
    const createAuth = requestRegister('Jordan.smith@unsw.edu.au', 'Jordansmith123', 'Jordan', 'Smith');

    const createAuthStr = JSON.parse(createAuth.body.toString());
    const createAuthData = createAuthStr.token;
    const invalidToken = (parseInt(createAuthData) + 10086).toString();

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab02', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/description`,
      {
        json: {
          token: invalidToken,
          descrition: 'I fix this bug!'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });

  test('updated discription', () => {
    const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu123456', 'Wu', 'Wang');

    const createAuthStr = JSON.parse(Auth.body.toString());
    const createAuthData = createAuthStr.token;

    const quizCreateStr = RequestQuizCreate(createAuthData, 'lab03', 'First test');
    const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
    const quizId = quizCreateData.quizId;

    const response = request(
      'PUT',
      SERVER_URL + `/v1/admin/quiz/${quizId}/description`,
      {
        json: {
          token: createAuthData,
          description: 'I fix this bug!'
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual({});
    expect(response.statusCode).toBe(200);
  });
});

describe('/v1/admin/quiz/:quizid/transfer', () => {
  test('Successfully transfer the ownership of a quiz', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    requestRegister('Caiqi@unsw.edu.au', '2022zysjcsj', 'Qi', 'Cai');

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Yearly Survey', 'About peoples performence');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const response = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/transfer`,
      {
        json: {
          token: createAuthToken1,
          userEmail: 'Caiqi@unsw.edu.au',
        }
      }
    );

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual({});
    expect(response.statusCode).toBe(200);
  });

  test('401 and 403 type of errors', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    requestRegister('Caiqi@unsw.edu.au', '2022zysjcsj', 'Qi', 'Cai');

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Yearly Survey', 'About peoples performence');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;

    const response1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/transfer`,
      {
        json: {
          token: 'lalalalalala',
          userEmail: 'Caiqi@unsw.edu.au',
        }
      }
    );

    const result1 = JSON.parse(response1.body.toString());
    const notLogToken = createAuthToken1 - 403;

    expect(result1).toStrictEqual(ERROR);
    expect(response1.statusCode).toBe(401);

    const response2 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/transfer`,
      {
        json: {
          token: notLogToken,
          userEmail: 'Caiqi@unsw.edu.au',
        }
      }
    );

    const result2 = JSON.parse(response2.body.toString());

    expect(result2).toStrictEqual(ERROR);
    expect(response2.statusCode).toBe(403);
  });

  test('400 type of errors', () => {
    const createAuth1 = requestRegister('LiQiang@unsw.edu.au', '2022gwyzl', 'Qiang', 'Li');
    const createAuthStr1 = JSON.parse(createAuth1.body.toString());
    const createAuthToken1 = createAuthStr1.token;

    const createAuth2 = requestRegister('Caiqi@unsw.edu.au', '2022zysjcsj', 'Qi', 'Cai');
    const createAuthStr2 = JSON.parse(createAuth2.body.toString());
    const createAuthToken2 = createAuthStr2.token;

    const quizCreateStr1 = RequestQuizCreate(createAuthToken1, 'Yearly Survey', 'About peoples performence');
    const quizCreateData1 = JSON.parse(quizCreateStr1.getBody() as string);
    const quizId1 = quizCreateData1.quizId;
    /// ////////
    const response6 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/transfer`,
      {
        json: {
          token: createAuthToken1,
          userEmail: 'LiQiang@unsw.edu.au',
        }
      }
    );

    const result6 = JSON.parse(response6.body.toString());

    expect(result6).toStrictEqual(ERROR);
    expect(response6.statusCode).toBe(400);
    /// ////////
    const response1 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/transfer`,
      {
        json: {
          token: createAuthToken1,
          userEmail: 'Dingxuexiang@unsw.edu.au',
        }
      }
    );

    const result1 = JSON.parse(response1.body.toString());

    expect(result1).toStrictEqual(ERROR);
    expect(response1.statusCode).toBe(400);

    const response2 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/transfer`,
      {
        json: {
          token: createAuthToken1,
          userEmail: 'Liqiang@unsw.edu.au',
        }
      }
    );

    const result2 = JSON.parse(response2.body.toString());

    expect(result2).toStrictEqual(ERROR);
    expect(response2.statusCode).toBe(400);

    const invalidQuizId = quizId1 - 1000;
    const response3 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${invalidQuizId}/transfer`,
      {
        json: {
          token: createAuthToken1,
          userEmail: 'Caiqi@unsw.edu.au',
        }
      }
    );

    const result3 = JSON.parse(response3.body.toString());

    expect(result3).toStrictEqual(ERROR);
    expect(response3.statusCode).toBe(400);

    const response4 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/transfer`,
      {
        json: {
          token: createAuthToken2,
          userEmail: 'Caiqi@unsw.edu.au',
        }
      }
    );

    const result4 = JSON.parse(response4.body.toString());

    expect(result4).toStrictEqual(ERROR);
    expect(response4.statusCode).toBe(400);

    RequestQuizCreate(createAuthToken2, 'Yearly Survey', 'About Economic development');

    const response5 = request(
      'POST',
      SERVER_URL + `/v1/admin/quiz/${quizId1}/transfer`,
      {
        json: {
          token: createAuthToken1,
          userEmail: 'Caiqi@unsw.edu.au',
        }
      }
    );

    const result5 = JSON.parse(response5.body.toString());

    expect(result5).toStrictEqual(ERROR);
    expect(response5.statusCode).toBe(400);
  });
});

describe('/v1/admin/quiz/trash', () => {
  test('token is not a valid structure', () => {
    const response = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/trash',
      {
        json: {
          token: ''
        }
      }
    );
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('token is not a valid structure', () => {
    const response = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/trash',
      {
        qs: {
          token: 'jjjjjj'
        }
      }
    );
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('invalid session', () => {
    const response = request(
      'GET',
      SERVER_URL + '/v1/admin/quiz/trash',
      {
        qs: {
          token: '0'
        }
      }
    );
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });

  // test('viewed trash', () => {
  //   const Auth = requestRegister('WangWu@unsw.edu.au', 'Wangwu123456', 'Wu', 'Wang');

  //   const createAuthStr = JSON.parse(Auth.body.toString());
  //   const createAuthData = createAuthStr.token;

  //   const quizCreateStr = RequestQuizCreate(createAuthData, 'lab03', 'First test');
  //   const quizCreateData = JSON.parse(quizCreateStr.getBody() as string);
  //   const quizId = quizCreateData.quizId;
  //   const response = request(
  //     'GET',
  //     SERVER_URL + '/v1/admin/quiz/trash',
  //     {
  //       qs: {
  //         token: createAuthData
  //       }
  //     }
  //   );
  //   const result = JSON.parse(response.body.toString());
  //   expect(result).toStrictEqual({quizzes: []});
  //   expect(response.statusCode).toBe(200);
  // });
});

// tests for quiz restore
describe('/v1/admin/quiz/:quizid/restore', () => {
  test('invalid token structure', () => {
    const response = requestQuizRestore('', 12312344322);
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('invalid token structure', () => {
    const response = requestQuizRestore('jghjjv', 12312344322);
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('invalid token session', () => {
    const response = requestQuizRestore('1', 12312344322);
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });

  test('invalid quizId', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());
    const quizCreate = RequestQuizCreate(userToken.token, 'A quiz', 'quizzzzz');
    const quizId = JSON.parse(quizCreate.getBody() as string);
    const response = requestQuizRestore(userToken.token, quizId.quizId + 121);

    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('not your quiz!', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userCreate2 = requestRegister('shibo@gmail.com', 'shibo123123', 'Shibo', 'Wang');

    const userToken = JSON.parse(userCreate.body.toString());
    const userToken2 = JSON.parse(userCreate2.body.toString());

    const quizCreate = RequestQuizCreate(userToken.token, 'A quiz', 'quizzzzz');
    const quizId = JSON.parse(quizCreate.getBody() as string);

    const response = requestQuizRestore(userToken2.token, quizId.quizId);
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('invalid quizId', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());
    const quizCreate = RequestQuizCreate(userToken.token, 'A quiz', 'quizzzzz');
    const quizId = JSON.parse(quizCreate.getBody() as string);
    const response = requestQuizRestore(userToken.token, quizId.quizId);

    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('not in trash', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());
    const quizCreate = RequestQuizCreate(userToken.token, 'A quiz', 'quizzzzz');
    const quizId = JSON.parse(quizCreate.getBody() as string);

    const quizToRestore = requestQuizRestore(userToken.token, quizId.quizId);
    const result = JSON.parse(quizToRestore.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(quizToRestore.statusCode).toBe(400);
  });

  test('successfully restored', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());
    const quizCreate = RequestQuizCreate(userToken.token, 'A quiz', 'quizzzzz');
    const quizId = JSON.parse(quizCreate.getBody() as string);

    request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId.quizId}`,
      {
        qs: {
          token: userToken.token,
        }
      }
    );

    const quizToRestore = requestQuizRestore(userToken.token, quizId.quizId);
    const result = JSON.parse(quizToRestore.body.toString());
    expect(result).toStrictEqual({});
    expect(quizToRestore.statusCode).toBe(200);
  });
});

describe('/v1/admin/quiz/trash/empty', () => {
  test('invalid token structure', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());
    RequestQuizCreate(userToken.token, 'A quiz', 'quizzzzz');

    const response = request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/trash/empty',
      {
        qs: {
          token: '',
        }
      }
    );
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('invalid token structure', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());
    RequestQuizCreate(userToken.token, 'A quiz', 'quizzzzz');

    const response = request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/trash/empty',
      {
        qs: {
          token: 'jjjjj',
        }
      }
    );
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('invalid token session', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());
    RequestQuizCreate(userToken.token, 'A quiz', 'quizzzzz');

    const response = request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/trash/empty',
      {
        qs: {
          token: userToken.token + '18347',
        }
      }
    );
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });

  test('invalid quizId', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());
    const quizCreate = RequestQuizCreate(userToken.token, 'A quiz', 'quizzzzz');
    const quizId = JSON.parse(quizCreate.getBody() as string);
    const quizId1 = parseInt(quizId);

    request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/trash/empty',
      {
        qs: {
          token: userToken.token,
          quizId: quizId1 + 10000
        }
      }
    );
  });

  test('success', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());
    const quizCreate = RequestQuizCreate(userToken.token, 'A quiz', 'quizzzzz');
    const quizId = JSON.parse(quizCreate.getBody() as string);
    const quizId1 = parseInt(quizId);

    request(
      'DELETE',
      SERVER_URL + `/v1/admin/quiz/${quizId1}`,
      {
        qs: {
          token: userToken.token,
        }
      }
    );

    request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/trash/empty',
      {
        qs: {
          token: userToken.token,
          quizId: [quizId1]
        }
      }
    );
  });

  test('successfully empty the trash', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());
    RequestQuizCreate(userToken.token, 'A quiz', 'quizzzzz');

    request(
      'DELETE',
      SERVER_URL + '/v1/admin/quiz/trash/empty',
      {
        qs: {
          token: userToken.token,
        }
      }
    );
  });
});

describe('/v1/admin/quiz/:quizid/thumbnail', () => {
  test('successfully updated the url', () => {
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
    const imgUrl = 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
    questionCreate(questionBody1, quizId1, createAuthData);
    updateQuizThumbnail(createAuthData, quizId1, imgUrl);
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
      thumbnailUrl: imgUrl,
    });
  });

  test('400 Errors', () => {
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

    const invalidUrl = 'lalalalalala';
    const pdfUrl = 'https://www.africau.edu/images/default/sample.pdf';
    const imgUrl = 'https://images.pexels.com/photos/12811157/pexels-photo-12811157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
    questionCreate(questionBody1, quizId1, createAuthData);

    expect(() => updateQuizThumbnail(createAuthData1, quizId1, imgUrl)).toThrow(HTTPError[400]);
    expect(() => updateQuizThumbnail(createAuthData, invalidQuizId, imgUrl)).toThrow(HTTPError[400]);
    expect(() => updateQuizThumbnail(createAuthData, quizId1, invalidUrl)).toThrow(HTTPError[400]);
    expect(() => updateQuizThumbnail(createAuthData, quizId1, pdfUrl)).toThrow(HTTPError[400]);
  });
});
