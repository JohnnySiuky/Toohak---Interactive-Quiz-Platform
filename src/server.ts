import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';

import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminAuthLogout,
  adminAuthDetailsUpdate,
  adminAuthPasswordUpdate,
} from './auth';

import {
  adminQuizInfo,
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizTransfer,
  adminQuizRestore,
  adminQuizTrashEmpty,
  adminQuizUpdateThumbnail
} from './quiz';

import {
  adminQuestionCreate,
  adminQuestionUpdate,
  adminQuestionDelete,
  adminQuestionMove,
  adminQuestionDuplicate,
} from './question';

import {
  adminSessionStart,
  adminGetSessionStatus,
  adminUpdateSessionState,
  adminViewSessionsActivity,
  adminSessionFinalResults,
} from './session';

import {
  adminPlayerJoin,
  adminPlayerStatus,
  adminPlayerQuestionInfo,
  adminPlayerAnswer,
  adminPlayerQuestionResults,
  adminPlayerFinalResults,
  adminMessageSend,
  adminMessagesReview,
} from './player';

import { clear } from './other';

import { getData, setData } from './dataStore';

import {
  adminQuestionCreateV2,
  adminQuestionUpdateV2,
  adminQuizInfoV2
} from './v2ModifiedFunctions';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for producing the docs that define the API
const file = fs.readFileSync('./swagger.yaml', 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// for logging errors (print to terminal)
app.use(morgan('dev'));

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

/// ////////////////////////////////////////////////////////////////////////////////////////
// generate token function

function tokenGenerate(userId: number) {
  const data = getData();
  const token = {
    sessionId: Math.floor(Date.now() / 1000) * userId,
    userId: userId,
  };

  data.tokens.push(token);
  setData(data);

  return token.sessionId.toString();
  // return token;
}
/// ////////////////////////////////////////////////////////////////////////////////////////

app.use('/imageFile', express.static('src/imageFile'));

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;

  try {
    const result = adminAuthRegister(email, password, nameFirst, nameLast);
    const token = tokenGenerate(result.authUserId);
    res.status(200).json({ token: token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = adminAuthLogin(email, password);
    const token = tokenGenerate(result.authUserId);
    res.status(200).json({ token: token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminUserDetails(token);
  res.json(response);
});

// logout
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const response = adminAuthLogout(token);
  res.json(response);
});

// update the user details
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const response = adminAuthDetailsUpdate(token, email, nameFirst, nameLast);
  res.json(response);

  // const code400 = '400';

  // try {
  //   const result = adminAuthDetailsUpdate(token, email, nameFirst, nameLast);
  //   res.status(200).json(result);
  // } catch (error) {
  //   if (error.message === 'token is not a valid structure') {
  //     res.status(401).json({ error: error.message });
  //   } else if (error.message === 'this token has already been logged out') {
  //     res.status(403).json({ error: error.message });
  //   } else if (error.message.includes(code400)) {
  //     res.status(400).json({ error: error.message });
  //   }
  // }
});

// set a new password
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const response = adminAuthPasswordUpdate(token, oldPassword, newPassword);
  res.json(response);

  // const code400 = '400';

  // try {
  //   const result = adminAuthPasswordUpdate(token, oldPassword, newPassword);
  //   res.status(200).json(result);
  // } catch (error) {
  //   if (error.message === 'token is not a valid structure') {
  //     res.status(401).json({ error: error.message });
  //   } else if (error.message === 'this token has already been logged out') {
  //     res.status(403).json({ error: error.message });
  //   } else if (error.message.includes(code400)) {
  //     res.status(400).json({ error: error.message });
  //   }
  // }
});

/// ///quiz//////
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminQuizList(token);
  res.json(response);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;

  const response = adminQuizCreate(token, name, description);
  res.json(response);

  /*

  if (token === undefined || token === '') {
    res.status(401).json({ error: 'Token is not provided or is not a valid structure' });
    return;
  }

  const sessionId = parseInt(token);

  if (isNaN(sessionId)) {
    res.status(401).json({ error: 'Token is not a valid structure' });
    return;
  }

  const data = getData();
  for (const token of data.tokens) {
    if (token.sessionId === sessionId) {
      const authUserId = token.userId;
      try {
        const result = adminQuizCreate(authUserId, name, description);
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  }

  res.status(403).json({ error: 'Provided token is valid structure, but is not for a currently logged in session' });
  */
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizid);

  const response = adminQuizRemove(token, quizId);
  res.json(response);

  /*
  if (tokenStr === undefined || tokenStr === '') {
    res.status(401).json({ error: 'Token is not provided or is not a valid structure' });
    return;
  }

  const sessionId = parseInt(tokenStr);

  if (isNaN(sessionId)) {
    res.status(401).json({ error: 'Token is not a valid structure' });
    return;
  }

  const data = getData();

  for (const token of data.tokens) {
    if (token.sessionId === sessionId) {
      const authUserId = token.userId;

      try {
        const result = adminQuizRemove(authUserId, quizId);
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  }

  res.status(403).json({ error: 'Provided token is valid structure, but is not for a currently logged in session' });
  */
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizID = parseInt(req.params.quizid);

  const response = adminQuizInfo(token, quizID);
  res.json(response);

/*
  if (tokenStr === undefined || tokenStr === '') {
    res.status(401).json({ error: 'Token is not provided or is not a valid structure' });
    return;
  }

  const sessionId = parseInt(tokenStr);

  if (isNaN(sessionId)) {
    res.status(401).json({ error: 'Token is not a valid structure' });
    return;
  }

  const data = getData();
  for (const token of data.tokens) {
    if (token.sessionId === sessionId) {
      const authUserId = token.userId;

      try {
        const response = adminQuizInfo(authUserId, quizID);
        res.status(200).json(response);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  }

  res.status(403).json({ error: 'Provided token is valid structure, but is not for a currently logged in session' });
  */
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const { token, name } = req.body;
  const quizId = parseInt(req.params.quizid);

  const response = adminQuizNameUpdate(token, quizId, name);
  res.json(response);

/*
  if (token === undefined || token === '') {
    res.status(401).json({ error: 'Token is not a valid structure' });
  }

  const sessionId = parseInt(token);

  if (isNaN(sessionId)) {
    res.status(401).json({ error: 'Token is not a valid structure' });
    return;
  }

  const data = getData();
  for (const token of data.tokens) {
    if (token.sessionId === sessionId) {
      const authUserId = token.userId;

      try {
        const result = adminQuizNameUpdate(authUserId, quizId, name);
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  }

  res.status(403).json({ error: 'Provided token is valid structure, but is not for a currently logged in session' });
*/
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { token, description } = req.body;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuizDescriptionUpdate(token, quizId, description);
  res.json(response);

  /*
  if (token === undefined || token === '') {
    res.status(401).json({ error: 'Token is not a valid structure' });
  }

  const sessionId = parseInt(token);

  if (isNaN(sessionId)) {
    res.status(401).json({ error: 'Token is not a valid structure' });
    return;
  }

  const data = getData();
  for (const token of data.tokens) {
    if (token.sessionId === sessionId) {
      const authUserId = token.userId;

      try {
        const result = adminQuizDescriptionUpdate(authUserId, quizId, description);
        res.status(200).json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
  }

  res.status(403).json({ error: 'Provided token is valid structure, but is not for a currently logged in session' });
  */
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const { token, userEmail } = req.body;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuizTransfer(token, quizId, userEmail);
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuestionCreate(token, quizId, questionBody);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const response = adminQuestionUpdate(token, quizId, questionId, questionBody);
  res.json(response);
});

app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const response = adminQuestionDelete(token, quizId, questionId);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const { token, newPosition } = req.body;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);

  const response = adminQuestionMove(token, quizId, questionId, newPosition);
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);

  const response = adminQuestionDuplicate(token, quizId, questionId);
  res.json(response);
});

// app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
//   const token = req.query.token as string;

//   try {
//     const result = adminQuizViewTrash(token);
//     res.status(200).json(result);
//   } catch (error) {
//     if (error.message === 'token is not a valid structure') {
//       res.status(401).json({ error: error.message });
//     } else if (error.message === 'Provided token is valid structure, but is not for a currently logged in session') {
//       res.status(403).json({ error: error.message });
//     }
//   }
// });

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = parseInt(req.params.quizid);

  try {
    const result = adminQuizRestore(token, quizId);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'token is not a valid structure') {
      res.status(401).json({ error: error.message });
    } else if (error.message === 'Provided token is valid structure, but is not for a currently logged in session') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizIds = req.query.quizIds;
  const numericQuizIds = Array.isArray(quizIds)
    ? quizIds.map(Number)
    : [];

  try {
    const result = adminQuizTrashEmpty(token, numericQuizIds);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'token is not a valid structure') {
      res.status(401).json({ error: error.message });
    } else if (error.message === 'Provided token is valid structure, but is not for a currently logged in session') {
      res.status(403).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

/// //////

app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();
  res.status(200).json(response);
  // res.json(response);
});

/// ///////v2 routes//////////

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const response = adminAuthLogout(token);
  res.json(response);
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const { name, description } = req.body;
  const response = adminQuizCreate(token, name, description);
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const { questionBody } = req.body;

  const response = adminQuestionCreateV2(token, quizId, questionBody);
  res.json(response);
});

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const response = adminUserDetails(token);
  res.json(response);
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const { email, nameFirst, nameLast } = req.body;
  const token = req.headers.token as string;
  const response = adminAuthDetailsUpdate(token, email, nameFirst, nameLast);
  res.json(response);
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.headers.token as string;
  const response = adminAuthPasswordUpdate(token, oldPassword, newPassword);
  res.json(response);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const response = adminQuizList(token);
  res.json(response);
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const { name, description } = req.body;
  const token = req.headers.token as string;
  const response = adminQuizCreate(token, name, description);
  res.json(response);
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizID = parseInt(req.params.quizid);

  const response = adminQuizInfoV2(token, quizID);
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const { name } = req.body;
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);

  const response = adminQuizNameUpdate(token, quizId, name);
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { description } = req.body;
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuizDescriptionUpdate(token, quizId, description);
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const { userEmail } = req.body;
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const response = adminQuizTransfer(token, quizId, userEmail);
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const { questionBody } = req.body;
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const response = adminQuestionUpdateV2(token, quizId, questionId, questionBody);
  res.json(response);
});

app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const response = adminQuestionDelete(token, quizId, questionId);
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const { newPosition } = req.body;
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);

  const response = adminQuestionMove(token, quizId, questionId, newPosition);
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);

  const response = adminQuestionDuplicate(token, quizId, questionId);
  res.json(response);
});

/// ///////////////////////////////////////////////////////////////////////
/// /////////Iteration 3 new functions/////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////

app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const { autoStartNum } = req.body;
  const response = adminSessionStart(quizId, token, autoStartNum);
  res.json(response);
});

app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;
  const response = adminPlayerJoin(sessionId, name);
  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const response = adminGetSessionStatus(quizId, sessionId, token);
  res.json(response);
});

app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const response = adminPlayerStatus(playerId);
  res.json(response);
});

app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionposition = parseInt(req.params.questionposition);
  const response = adminPlayerQuestionInfo(playerId, questionposition);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const { action } = req.body;
  const response = adminUpdateSessionState(quizId, sessionId, token, action);
  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const response = adminViewSessionsActivity(quizId, token);
  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const response = adminSessionFinalResults(quizId, sessionId, token);
  res.json(response);
});

app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const { answerIds } = req.body;
  const response = adminPlayerAnswer(answerIds, playerId, questionPosition);
  res.json(response);
});

app.get('/v1/player/:playerid/question/:questionposition/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const response = adminPlayerQuestionResults(playerId, questionPosition);
  res.json(response);
});

app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const response = adminPlayerFinalResults(playerId);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const token = req.headers.token as string;
  const quizId = parseInt(req.params.quizid);
  const { imgUrl } = req.body;
  const response = adminQuizUpdateThumbnail(token, quizId, imgUrl);
  res.json(response);
});

app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const { message } = req.body;
  const response = adminMessageSend(playerId, message);
  res.json(response);
});

app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const response = adminMessagesReview(playerId);
  res.json(response);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
