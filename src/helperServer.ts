import config from './config.json';
import request, { HttpVerb } from 'sync-request';
import { IncomingHttpHeaders } from 'http';
import HTTPError from 'http-errors';

const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 10000;

interface Payload {
  [key: string]: any;
}

/// //////////////////////////////////x
/// ////////helper functions//////////
/// //////////////////////////////////

export function requestRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const response = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: {
        email,
        password,
        nameFirst,
        nameLast
      }
    }
  );
  return response;
}

// request to login
export function requestLogin(email: string, password: string) {
  const response = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/login',
    {
      json: {
        email,
        password,
      }
    }
  );
  return response;
}

// request to get details
export function requestUserDetails(token: object) {
  const response = request(
    'GET',
    SERVER_URL + '/v1/admin/user/details',
    {
      qs: token,
    }
  );
  return response;
}

export function requestLogout(token: object) {
  const response = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/logout',
    {
      json: token,
    }
  );
  return response;
}

export function requestUpdateUserDetails(token: string, email: string, nameFirst: string, nameLast: string) {
  const response = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/details',
    {
      json: {
        token,
        email,
        nameFirst,
        nameLast,
      },
    }
  );
  return response;
}

export function requestChnageUserPassword(token: string, oldPassword: string, newPassword: string) {
  const response = request(
    'PUT',
    SERVER_URL + '/v1/admin/user/password',
    {
      json: {
        token,
        oldPassword,
        newPassword,
      },
    }
  );
  return response;
}

/// ////////quiz helpers function////////////

export function RequestQuizCreate(token: string, name: string, description: string) {
  const response = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    {
      json: {
        token,
        name,
        description,
      }
    }

  );
  return response;
}

export function requestQuizList(token: string) {
  const response = request(
    'GET',
    SERVER_URL + '/v1/admin/quiz/list',
    {
      qs: { token }
    }
  );
  return response;
}

export function requestQuizRestore(token: string, quizId: number) {
  const response = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/restore`,
    {
      json: { token }
    }
  );
  return response;
}

/// /// V2 helper functions///////
/// //////////////////////////////

/// URL解决以后是要改的
export interface Answer {
  answer: string;
  correct: boolean;
}

export interface QuestionInput {
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
  thumbnailUrl: string;
}

export interface Message {
  messageBody: string,
}

export const requestHelper = (
  method: HttpVerb,
  path: string,
  payload: Payload,
  headers: IncomingHttpHeaders = {}
): any => {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method.toUpperCase())) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }

  const url = SERVER_URL + path;
  const res = request(method, url, { qs, json, headers, timeout: TIMEOUT_MS });

  let responseBody: any;
  try {
    responseBody = JSON.parse(res.body.toString());
  } catch (err: any) {
    if (res.statusCode === 200) {
      throw HTTPError(500,
        `Non-jsonifiable body despite code 200: '${res.body}'.\nCheck that you are not doing res.json(undefined) instead of res.json({}), e.g. in '/clear'`
      );
    }
    responseBody = { error: `Failed to parse JSON: '${err.message}'` };
  }

  const errorMessage = `[${res.statusCode}] ` + responseBody?.error || responseBody || 'No message specified!';

  switch (res.statusCode) {
    case 400: // BAD_REQUEST
    case 401: // UNAUTHORIZED
      throw HTTPError(res.statusCode, errorMessage);
    case 404: // NOT_FOUND
      throw HTTPError(res.statusCode, `Cannot find '${url}' [${method}]\nReason: ${errorMessage}\n\nHint: Check that your server.ts have the correct path AND method`);
    case 500: // INTERNAL_SERVER_ERROR
      throw HTTPError(res.statusCode, errorMessage + '\n\nHint: Your server crashed. Check the server log!\n');
    default:
      if (res.statusCode !== 200) {
        throw HTTPError(res.statusCode, errorMessage + `\n\nSorry, no idea! Look up the status code ${res.statusCode} online!\n`);
      }
  }
  return responseBody;
};

// Function to block execution (i.e. sleep)
export function sleepSync(ms: number) {
  const startTime = new Date().getTime();

  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}

// wrapper functions
export function clear() {
  return requestHelper('DELETE', '/v1/clear', {});
}

// PROTECTED ROUTES
export function quizCreate(name: string, description: string, token: string) {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token: `${token}` });
}

export function questionCreate(questionBody: QuestionInput, quizId: number, token: string) {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question`, { questionBody }, { token: `${token}` });
}

export function authLogout(token: string) {
  return requestHelper('POST', '/v2/admin/auth/logout', {}, { token: `${token}` });
}

export function getUserdetails(token: string) {
  return requestHelper('GET', '/v2/admin/user/details', {}, { token: `${token}` });
}

export function updateUserdetails(email: string, nameFirst: string, nameLast: string, token: string) {
  return requestHelper('PUT', '/v2/admin/user/details', { email, nameFirst, nameLast }, { token: `${token}` });
}

export function updatePassword(oldPassword: string, newPassword: string, token: string) {
  return requestHelper('PUT', '/v2/admin/user/password', { oldPassword, newPassword }, { token: `${token}` });
}
export function listQuiz(token: string) {
  return requestHelper('GET', '/v2/admin/quiz/list', {}, { token: `${token}` });
}

export function getQuizInfo(quizId: number, token: string) {
  return requestHelper('GET', `/v2/admin/quiz/${quizId}`, {}, { token: `${token}` });
}

export function updateName(quizId: number, name: string, token: string) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/name`, { name }, { token: `${token}` });
}

export function updateDescription(quizId: number, description: string, token: string) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/description`, { description }, { token: `${token}` });
}

export function quizTransfer(quizId: number, userEmail: string, token: string) {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/transfer`, { userEmail }, { token: `${token}` });
}

export function updateQuestion(quizId: number, questionId: number, questionBody: QuestionInput, token: string) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}`, { questionBody }, { token: `${token}` });
}

export function deleteQuestion(quizId: number, questionId: number, token: string) {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}/question/${questionId}`, {}, { token: `${token}` });
}

export function moveQuestion(quizId: number, questionId: number, newposition: number, token: string) {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}/move`, { newposition }, { token: `${token}` });
}

export function duplicateQuizQuestion(quizId: number, questionId: number, token: string) {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, {}, { token: `${token}` });
}
/// /////////////////////////////////////////////////////////
/// ////////////////iteration 3 new functions////////////////
/// /////////////////////////////////////////////////////////

export function sessionStart(quizId: number, token: string, autoStartNum: number) {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/session/start`, { autoStartNum }, { token: `${token}` });
}

export function playerJoin(sessionId: number, name: string) {
  return requestHelper('POST', '/v1/player/join', { sessionId, name });
}

export function getSessionStatus(quizId: number, sessionId: number, token: string) {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionId}`, {}, { token: `${token}` });
}

export function playerStatus(playerId: number) {
  return requestHelper('GET', `/v1/player/${playerId}`, { });
}

export function playerQuestionInfo(playerId: number, questionPosition: number) {
  return requestHelper('GET', `/v1/player/${playerId}/question/${questionPosition}`, { });
}

export function sessionStateUpdate(quizId: number, sessionId: number, token: string, action: string) {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/session/${sessionId}`, { action }, { token: `${token}` });
}

export function sessionActivity(quizId: number, token: string) {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/sessions`, { }, { token: `${token}` });
}

export function sessionFinalResults(quizId: number, sessionId: number, token: string) {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, { }, { token: `${token}` });
}

export function playerAnswer(answerIds: number[], playerId: number, questionPosition: number) {
  return requestHelper('PUT', `/v1/player/${playerId}/question/${questionPosition}/answer`, { answerIds });
}

export function playerQuestionResults(playerId: number, questionPosition: number) {
  return requestHelper('GET', `/v1/player/${playerId}/question/${questionPosition}/results`, { });
}

export function playerFinalResults(playerId: number) {
  return requestHelper('GET', `/v1/player/${playerId}/results`, { });
}

export function updateQuizThumbnail(token: string, quizId: number, imgUrl: string) {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/thumbnail`, { imgUrl }, { token: `${token}` });
}

export function messageSend(playerId: number, message: Message) {
  return requestHelper('POST', `/v1/player/${playerId}/chat`, { message });
}

export function messagesReview(playerId: number) {
  return requestHelper('GET', `/v1/player/${playerId}/chat`, { });
}
