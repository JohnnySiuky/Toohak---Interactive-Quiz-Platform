import { getData, setData } from './dataStore';
import { tokenToUserId } from './helperFunctions';
import HTTPError from 'http-errors';
import request from 'sync-request';
import fs from 'fs';

export function adminQuizList (token: string) {
  const data = getData();

  const authUserId = tokenToUserId(token);

  // let isExistAuth = false;

  // for (const user of data.users) {
  //   if (user.userId === authUserId) {
  //     isExistAuth = true;
  //     break;
  //   }
  // }

  // if (isExistAuth === false) {
  //   // return {error: 'AuthUserId is not a valid user'}
  //   throw new Error('AuthUserId is not a valid user');
  // }

  const quizzes = [];

  for (const quiz of data.quizzes) {
    if (authUserId === quiz.authUserId) {
      const quizSimpleInfo = {
        quizId: quiz.quizId,
        name: quiz.name,
      };

      quizzes.push(quizSimpleInfo);
    }
  }

  return { quizzes };
}

export function adminQuizCreate (token: string, name: string, description: string) {
  const data = getData();

  const authUserId = tokenToUserId(token);

  // let isExistAuth = false;

  // for (const user of data.users) {
  //   if (user.userId === authUserId) {
  //     isExistAuth = true;
  //     break;
  //   }
  // }

  // if (isExistAuth === false) {
  //   throw new Error('AuthUserId is not a valid user');
  // }

  if (/[^a-zA-Z0-9\s]/.test(name) === true) {
    throw HTTPError(400, 'Name contains any characters that are not alphanumeric or are spaces');
  }

  if (name.length < 3) {
    throw HTTPError(400, 'The name is too short');
  } else if (name.length > 30) {
    throw HTTPError(400, 'The name is too long');
  }

  for (const quiz of data.quizzes) {
    if (quiz.name === name && quiz.authUserId === authUserId) {
      throw HTTPError(400, 'Name is already used by the current logged in user for another quiz');
    }
  }

  if (description.length > 100) {
    throw HTTPError(400, 'The description is too long');
  }

  const newQuiz = {
    quizId: 1 + data.quizzes.length,
    authUserId: authUserId,
    name: name,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
    description: description,
    numQuestions: 0,
    questions: [],
    duration: 0,
  };

  data.quizzes.push(newQuiz);

  setData(data);

  return { quizId: newQuiz.quizId };
}

export function adminQuizRemove (token: string, quizId: number) {
  const data = getData();
  const authUserId = tokenToUserId(token);

  /*
  let isExistAuth = false;

  for (const user of data.users) {
    if (user.userId === authUserId) {
      isExistAuth = true;
      break;
    }
  }

  if (isExistAuth === false) {
    throw new Error('AuthUserId is not a valid user');
  }
  */

  for (let quizI = 0; quizI < data.quizzes.length; quizI++) {
    if (data.quizzes[quizI].quizId === quizId) {
      if (data.quizzes[quizI].authUserId !== authUserId) {
        throw HTTPError(400, 'Quiz ID does not refer to a quiz that you own!');
      } else {
        const quizIntoTrash = { ...data.quizzes[quizI] };
        quizIntoTrash.timeLastEdited = Math.floor(Date.now() / 1000);
        data.trash.quizzes.push(quizIntoTrash);
        data.quizzes.splice(quizI, 1);
        setData(data);
        return { };
      }
    }
  }

  throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
}

export function adminQuizInfo(token: string, quizId: number) {
  const data = getData();

  const authUserId = tokenToUserId(token);

  // let isExistAuth = false;

  // for (const user of data.users) {
  //   if (user.userId === authUserId) {
  //     isExistAuth = true;
  //     break;
  //   }
  // }

  // if (isExistAuth === false) {
  //   // return {error: 'AuthUserId is not a valid user'}
  //   throw new Error('AuthUserId is not a valid user');
  // }

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      if (quiz.authUserId !== authUserId) {
        throw HTTPError(400, 'Quiz ID does not refer to a quiz that you own!');
      } else {
        return {
          quizId: quiz.quizId,
          name: quiz.name,
          timeCreated: quiz.timeCreated,
          timeLastEdited: quiz.timeLastEdited,
          description: quiz.description,
          numQuestions: quiz.numQuestions,
          questions: quiz.questions,
          duration: quiz.duration,
        };
      }
    }
  }

  throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
}

export function adminQuizNameUpdate(token: string, quizId: number, name: string) {
  const data = getData();
  const authUserId = tokenToUserId(token);

  /*
  let isExistAuth = false;

  for (const user of data.users) {
    if (user.userId === authUserId) {
      isExistAuth = true;
      break;
    }
  }

  if (isExistAuth === false) {
    throw new Error('AuthUserId is not a valid user');
  }
  */

  if (/[^a-zA-Z0-9\s]/.test(name) === true) {
    throw HTTPError(400, 'Name contains any characters that are not alphanumeric or are spaces');
  }

  if (name.length < 3) {
    throw HTTPError(400, 'The name is too short');
  } else if (name.length > 30) {
    throw HTTPError(400, 'The name is too long');
  }

  for (const quiz of data.quizzes) {
    if (quiz.name === name && quiz.authUserId === authUserId) {
      throw HTTPError(400, 'Name is already used by the current logged in user for another quiz');
    }
  }

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      if (quiz.authUserId !== authUserId) {
        throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
      } else {
        quiz.name = name;
        const newTimeLastEdited = Math.floor(Date.now() / 1000);
        quiz.timeLastEdited = newTimeLastEdited;
        setData(data);
        return { };
      }
    }
  }

  throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
}

export function adminQuizDescriptionUpdate(token: string, quizId: number, description: string) {
  const data = getData();

  const authUserId = tokenToUserId(token);

  // let isExistAuth = false;

  // for (const user of data.users) {
  //   if (user.userId === authUserId) {
  //     isExistAuth = true;
  //     break;
  //   }
  // }

  // if (isExistAuth === false) {
  //   throw new Error('AuthUserId is not a valid user');
  // }

  if (description.length > 100) {
    throw HTTPError(400, 'Description is more than 100 characters in length');
  }

  for (const quiz of data.quizzes) {
    if (quiz.quizId === quizId) {
      if (quiz.authUserId !== authUserId) {
        throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
      } else {
        quiz.description = description;
        const newTimeLastEdited = Math.floor(Date.now() / 1000);
        quiz.timeLastEdited = newTimeLastEdited;
        setData(data);
        return { };
      }
    }
  }

  throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
}

export function adminQuizTransfer(token: string, quizId: number, userEmail: string) {
  const data = getData();

  const authUserId = tokenToUserId(token);

  const transferredQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (transferredQuiz === undefined) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (transferredQuiz.authUserId !== authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  const transferredUser = data.users.find(user => user.email === userEmail);
  if (transferredUser === undefined) {
    throw HTTPError(400, 'userEmail is not a real user');
  }
  const transferredUserId = transferredUser.userId;

  if (transferredUser.userId === authUserId) {
    throw HTTPError(400, 'userEmail is the current logged in user');
  }

  for (const quiz of data.quizzes) {
    if (quiz.authUserId === transferredUserId && quiz.name === transferredQuiz.name) {
      throw HTTPError(400, 'Quiz ID refers to a quiz that has a name that is already used by the target user');
    }
  }

  transferredQuiz.authUserId = transferredUserId;
  return { };
}
/*
export function adminQuizViewTrash(token: string) {
  if (token === undefined || token === '') {
    throw new Error('token is not a valid structure');
  }

  if (isNaN(parseInt(token))) {
    throw new Error('token is not a valid structure');
  }

  const data = getData();

  const userToken = data.tokens.find(session => session.sessionId === parseInt(token));
  if (userToken === undefined) {
    throw new Error('Provided token is valid structure, but is not for a currently logged in session');
  }

  const userTrash = data.trash.quizzes.filter(trashQuiz => trashQuiz.authUserId === userToken.userId);
  const returnedArr = [];

  for (const quizzes of userTrash) {
    const trashDetails = {
      quizId: quizzes.quizId,
      name: quizzes.name,
    };
    returnedArr.push(trashDetails);
  }

  return {
    quizzes: returnedArr,
  };
}
*/
// Restore a particular quiz from the trash back to an active quiz
export function adminQuizRestore(token: string, quizId: number) {
  if (token === undefined || token === '') {
    throw new Error('token is not a valid structure');
  }

  if (isNaN(parseInt(token))) {
    throw new Error('token is not a valid structure');
  }

  const data = getData();

  const userToken = data.tokens.find(session => session.sessionId === parseInt(token));
  if (userToken === undefined) {
    throw new Error('Provided token is valid structure, but is not for a currently logged in session');
  }

  const trashQuiz = data.trash.quizzes.find(quiz => quiz.quizId === quizId);
  const userQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (trashQuiz === undefined && userQuiz === undefined) {
    throw new Error('Quiz ID does not refer to a valid quiz');
  }

  if ((trashQuiz === undefined && userQuiz.authUserId !== userToken.userId) || (trashQuiz.authUserId !== userToken.userId && userQuiz === undefined)) {
    throw new Error('Quiz ID does not refer to a quiz that user owns');
  }

  // if (trashQuiz === undefined) {
  //   throw new Error('Quiz ID refers to a quiz that is not currently in the trash');
  // }

  const quizToRestore = { ...trashQuiz };
  data.quizzes.push(quizToRestore);
  data.trash.quizzes = data.trash.quizzes.filter(trashQuiz => trashQuiz.quizId !== quizId);
  setData(data);

  return {};
}

// permanently delete specific quizzes currently sitting in the trash
export function adminQuizTrashEmpty(token: string, quizIds: Array) {
  if (token === undefined || token === '') {
    throw new Error('token is not a valid structure');
  }

  if (isNaN(parseInt(token))) {
    throw new Error('token is not a valid structure');
  }

  const data = getData();

  const userToken = data.tokens.find(session => session.sessionId === parseInt(token));
  if (userToken === undefined) {
    throw new Error('Provided token is valid structure, but is not for a currently logged in session');
  }

  // for (const id of quizIds) {
  //   const trashQuiz = data.trash.quizzes.find(quiz => quiz.quizId === id);
  //   const userQuiz = data.quizzes.find(quiz => quiz.quizId === id);
  //   if (trashQuiz === undefined && userQuiz === undefined) {
  //     throw new Error('One or more of the quiz ids is not a valid quiz');
  //   }
  //   if ((trashQuiz === undefined && userQuiz.authUserId !== userToken.userId) || (trashQuiz.authUserId !== userToken.userId && userQuiz === undefined)) {
  //     throw new Error('one or more quiz IDs does not refer to a quiz that user owns');
  //   }
  //   if (trashQuiz === undefined) {
  //     throw new Error('one or more quiz IDs refers to a quiz that is not currently in the trash');
  //   }
  // }

  // for (const id of quizIds) {
  //   data.trash.quizzes = data.trash.quizzes.filter(quiz => quiz.quizId !== id);
  //   setData(data);
  // }

  return {};
}

export function adminQuizUpdateThumbnail(token: string, quizId: number, imgUrl: string) {
  const data = getData();
  const authUserId = tokenToUserId(token);

  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (targetQuiz === undefined) {
    throw HTTPError(400, 'QuizId does not refer to a valid quiz');
  }

  if (targetQuiz.authUserId !== authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  let response;
  try {
    response = request(
      'GET',
      imgUrl
    );
  } catch (error) {
    throw HTTPError(400, 'The thumbnailUrl does not return to a valid file');
  }

  const fileExtensionMatch = imgUrl.match(/\.(jpg|png|jpeg)/i);
  if (!fileExtensionMatch) {
    throw HTTPError(400, 'The thumbnailUrl, when fetched, is not a JPG or PNG file type');
  }

  targetQuiz.thumbnailUrl = imgUrl;
  setData(data);

  const fileExtension = fileExtensionMatch[0];
  const body = response.getBody();
  const addressStr = 'src/imageFile/' + `quiz${quizId}` + fileExtension;
  fs.writeFileSync(addressStr, body, { flag: 'w' });

  return {};
}
