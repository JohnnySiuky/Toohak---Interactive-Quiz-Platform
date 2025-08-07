import { getData, setData } from './dataStore';
import validator from 'validator';
import { tokenToUserId } from './helperFunctions';
import HTTPError from 'http-errors';

export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const data = getData();

  if (!validator.isEmail(email)) {
    throw new Error('invalid email!');
  }

  let isExistEmail = false;

  for (const user of data.users) {
    if (email === user.email) {
      isExistEmail = true;
      break;
    }
  }

  if (isExistEmail === true) {
    throw new Error('this email already exists');
  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    throw new Error('too long or too short first name');
  } else if (nameLast.length < 2 || nameLast.length > 20) {
    throw new Error('too long or too short last name');
  } else if (/^[a-zA-Z\s\-']+$/.test(nameFirst) === false) {
    throw new Error('invalid character for first name');
  } else if (/^[a-zA-Z\s\-']+$/.test(nameLast) === false) {
    throw new Error('invalid character for last name');
  } else if (password.length < 8) {
    throw new Error('too short password length');
  } else if (/^(?![a-zA-Z]*$)(?!\d*$)/.test(password) === false) {
    throw new Error('there must be at least one letter and at least one number for the password');
  }

  let authUserId = 10000;
  authUserId += data.users.length;

  const newUser = {
    userId: authUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  };
  data.users.push(newUser);
  setData(data);

  return {
    authUserId: authUserId,
  };
}

export function adminAuthLogin(email: string, password: string) {
  const data = getData();

  let isExistEmail = false;
  let emailPosition = 0;

  for (let i = 0; i < data.users.length; i++) {
    if (email === data.users[i].email) {
      isExistEmail = true;
      emailPosition = i;
      break;
    }
  }

  if (isExistEmail === false) {
    throw new Error('this email does not exist');
  } else if (password !== data.users[emailPosition].password) {
    data.users[emailPosition].numFailedPasswordsSinceLastLogin++;
    setData(data);
    throw new Error('incorrect password');
  }

  data.users[emailPosition].numSuccessfulLogins++;
  data.users[emailPosition].numFailedPasswordsSinceLastLogin = 0;
  setData(data);

  return {
    authUserId: data.users[emailPosition].userId,
  };
}

export function adminUserDetails(token: string) {
  const data = getData();
  const authUserId = tokenToUserId(token);

  /*
  const data = getData();

  let authUserIdexist = false;

  for (const user of data.users) {
    if (authUserId === user.userId) {
      authUserIdexist = true;
    }
  }

  if (authUserIdexist === false) {
    throw new Error('AuthUserId is not a valid user');
  }
  */

  for (const user of data.users) {
    if (authUserId === user.userId) {
      return {
        user: {
          userId: user.userId,
          name: user.nameFirst + ' ' + user.nameLast,
          email: user.email,
          numSuccessfulLogins: user.numSuccessfulLogins,
          numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin
        }
      };
    }
  }
}

export function adminAuthLogout(token: string) {
  const data = getData();

  if (token === undefined || token === '') {
    throw HTTPError(401, 'token is not a valid structure');
  }

  if (isNaN(parseInt(token))) {
    throw HTTPError(401, 'token is not a valid structure');
  }

  const userToken = data.tokens.find(session => session.sessionId === parseInt(token));
  if (userToken === undefined) {
    throw HTTPError(400, 'this token has already been logged out');
  }

  // 这里为什么不直接 data.tokens = .......
  const newTokens = data.tokens.filter(session => session.sessionId !== parseInt(token));
  data.tokens = newTokens;
  setData(data);

  return { };
}

export function adminAuthDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string) {
  const data = getData();

  const userId = tokenToUserId(token);

  /* if (token === undefined || token === '') {
    throw new Error('token is not a valid structure');
  }

  if (isNaN(parseInt(token))) {
    throw new Error('token is not a valid structure');
  }

  const userToken = data.tokens.find(session => session.sessionId === parseInt(token));
  if (userToken === undefined) {
    throw new Error('this token has already been logged out');
  }

  const userId = userToken.userId; */

  const userEmail = data.users.find(user => user.email === email);

  if (userEmail !== undefined) {
    const user = data.users.find(user => user.userId === userId);
    if (user.email !== email) {
      throw HTTPError(400, 'Email is currently used by another user(400)');
    }
  } else if (!validator.isEmail(email)) {
    throw HTTPError(400, 'invalid email!(400)');
  } else if (/^[a-zA-Z\s\-']+$/.test(nameFirst) === false) {
    throw HTTPError(400, 'NameFirst contains invalid characters(400)');
  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    throw HTTPError(400, 'too long or too short first name(400)');
  } else if (/^[a-zA-Z\s\-']+$/.test(nameLast) === false) {
    throw HTTPError(400, 'invalid character for last name(400)');
  } else if (nameLast.length < 2 || nameLast.length > 20) {
    throw HTTPError(400, 'too long or too short last name(400)');
  }

  for (let i = 0; i < data.users.length; i++) {
    if (userId === data.users[i].userId) {
      data.users[i].email = email;
      data.users[i].nameFirst = nameFirst;
      data.users[i].nameLast = nameLast;
      setData(data);
      break;
    }
  }

  return { };
}

export function adminAuthPasswordUpdate(token: string, oldPassword: string, newPassword: string) {
  const data = getData();
  /*
  if (token === undefined || token === '') {
    throw HTTPError(401, 'token is not a valid structure');
  }

  if (isNaN(parseInt(token))) {
    throw HTTPError(401, 'token is not a valid structure');
  }

  const userToken = data.tokens.find(session => session.sessionId === parseInt(token));
  if (userToken === undefined) {
    throw HTTPError(403,'this token has already been logged out');
  }
*/

  const authUserId = tokenToUserId(token);

  const currentUserPassword = data.users.find(user => user.password === oldPassword);
  if (currentUserPassword === undefined) {
    throw HTTPError(400, 'Old password is not the correct old password(400)');
  } else if (currentUserPassword.password === newPassword) {
    throw HTTPError(400, 'New password has already been used before by this user(400)');
  } else if (newPassword.length < 8) {
    throw HTTPError(400, 'too short password length(400)');
  } else if (/^(?![a-zA-Z]*$)(?!\d*$)/.test(newPassword) === false) {
    throw HTTPError(400, 'there must be at least one letter and at least one number for the new password(400)');
  }

  for (let i = 0; i < data.users.length; i++) {
    if (data.users[i].userId === authUserId) {
      data.users[i].password = newPassword;
      setData(data);
      break;
    }
  }

  return { };
}
