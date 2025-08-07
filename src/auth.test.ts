import request from 'sync-request';
import config from './config.json';

import { requestRegister, requestLogin, requestUserDetails, requestUpdateUserDetails, requestLogout, requestChnageUserPassword } from './helperServer';

const ERROR = { error: expect.any(String) };
const TOKEN = { token: expect.any(String) };
const port = config.port;
const url = config.url;
const SERVER_URL = `${url}:${port}`;

/// ///////////////////////////////////////////////
/// ///////////////////////////////////////////////

beforeEach(() => {
  request(
    'DELETE',
    SERVER_URL + '/v1/clear'
  );
});

describe('/v1/clear', () => {
  test('Successful Clear', () => {
    const response = request(
      'DELETE',
      SERVER_URL + '/v1/clear'
    );
    expect(JSON.parse(response.getBody() as string)).toStrictEqual({});
    expect(response.statusCode).toBe(200);
  });
});

describe('/v1/admin/auth/register', () => {
  test('invalid email', () => {
    const response = requestRegister('hayden', 'haydensmith123', 'Hayden', 'Smith');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('invalid first name', () => {
    const response = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden_No.1', 'Smith');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('invalid first name(too short)', () => {
    const response = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'H', 'Smith');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('invalid last name', () => {
    const response = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith_No.1');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('invalid last name(too long)', () => {
    const response = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smithhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('too short password', () => {
    const response = requestRegister('hayden.smith@unsw.edu.au', 'HD', 'Hayden', 'Smith');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('invalid password', () => {
    const response = requestRegister('hayden.smith@unsw.edu.au', '1213456685458', 'Hayden', 'Smith');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('Successful registed', () => {
    const response = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(TOKEN);
    expect(response.statusCode).toBe(200);
  });

  test('email is used by another user', () => {
    requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const r = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const result = JSON.parse(r.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(r.statusCode).toBe(400);
  });
});

describe('/v1/admin/auth/login', () => {
  beforeEach(() => {
    requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
  });

  /// ///////////
  test('email address does not exist', () => {
    const response = requestLogin('jack@gmail.com', 'haydensmith123');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('incorrect password', () => {
    const response = requestLogin('hayden.smith@unsw.edu.au', 'jack123123');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('successful login', () => {
    const response = requestLogin('hayden.smith@unsw.edu.au', 'haydensmith123');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(TOKEN);
    expect(response.statusCode).toBe(200);
  });
});

describe('/v1/admin/user/details', () => {
  test('invalid token structure', () => {
    const response = requestUserDetails(null);
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('invalid empty session', () => {
    const response = requestUserDetails({ token: '' });

    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual(ERROR);

    expect(response.statusCode).toBe(401);
  });

  test('invalid session', () => {
    const response = requestUserDetails({ token: '111' });
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });

  test('getting user details successfully', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const createAuthStr = JSON.parse(createAuth.body.toString());
    const response = requestUserDetails(createAuthStr);
    const result = JSON.parse(response.body.toString());

    expect(result).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Hayden Smith',
        email: 'hayden.smith@unsw.edu.au',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });

    expect(response.statusCode).toBe(200);
  });
});

describe('/v1/admin/auth/logout', () => {
  test('invalid token structure', () => {
    const response = requestLogout(null);
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('invalid token structure (empty session)', () => {
    const response = requestLogout({ token: '' });
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('token does not exist', () => {
    const response = requestLogout({ token: '123' });
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('successfully logged out', () => {
    const createAuth = requestRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    requestLogin('hayden.smith@unsw.edu.au', 'haydensmith123');
    const haydenToken1 = JSON.parse(createAuth.body.toString());

    const response = requestLogout(haydenToken1);
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual({});
    expect(response.statusCode).toBe(200);

    const response2 = requestLogout(haydenToken1);
    const result2 = JSON.parse(response2.body.toString());
    expect(result2).toStrictEqual(ERROR);
    expect(response2.statusCode).toBe(400);
  });
});

// tests for updating user details
describe('/v1/admin/user/details', () => {
  test('invalid token structure', () => {
    const response = requestUpdateUserDetails(null, 'jack@gmail.com', 'Jack', 'Wang');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('invalid token structure (empty session)', () => {
    const response = requestUpdateUserDetails('', 'jack@gmail.com', 'Jack', 'Wang');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('token does not exist', () => {
    const response = requestUpdateUserDetails('123', 'jack@gmail.com', 'Jack', 'Wang');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });

  test('email is used by another user', () => {
    const userCreate1 = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    requestRegister('shibo@gmail.com', 'shibo123123', 'Shibo', 'Wang');

    const userToken1 = JSON.parse(userCreate1.body.toString());

    const response = requestUpdateUserDetails(userToken1.token, 'shibo@gmail.com', 'Jack', 'Wang');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('invalid email', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestUpdateUserDetails(userToken.token, 'jack111', 'Jack', 'Wang');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('invalid first name', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestUpdateUserDetails(userToken.token, 'shibo@gmail.com', 'Jack_No.1', 'Wang');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('invalid first name (too long)', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestUpdateUserDetails(userToken.token, 'shibo@gmail.com', 'Jackkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk', 'Wang');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('invalid last name', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestUpdateUserDetails(userToken.token, 'shibo@gmail.com', 'Jack', 'Wang.....');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('invalid last name (too short)', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestUpdateUserDetails(userToken.token, 'shibo@gmail.com', 'Jack', 'W');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('updated successfully', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestUpdateUserDetails(userToken.token, 'shibo@gmail.com', 'Shibo', 'Wang');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual({});
    expect(response.statusCode).toBe(200);

    const newDetails = requestUserDetails(userToken);
    const detailsStr = JSON.parse(newDetails.body.toString());

    expect(detailsStr).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Shibo Wang',
        email: 'shibo@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });

  test('updated successfully with the same email', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestUpdateUserDetails(userToken.token, 'jack@gmail.com', 'Shibo', 'Wang');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual({});
    expect(response.statusCode).toBe(200);

    const newDetails = requestUserDetails(userToken);
    const detailsStr = JSON.parse(newDetails.body.toString());

    expect(detailsStr).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: 'Shibo Wang',
        email: 'jack@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});

// tests for setting a new password of a user
describe('/v1/admin/user/password', () => {
  test('invalid token structure', () => {
    const response = requestChnageUserPassword(null, 'jack123123', 'shibo123123');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('invalid token structure (empty session)', () => {
    const response = requestChnageUserPassword('', 'jack123123', 'shibo123123');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(401);
  });

  test('token does not exist', () => {
    const response = requestChnageUserPassword('123', 'jack123123', 'shibo123123');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(403);
  });

  test('Old password is not the correct old password', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestChnageUserPassword(userToken.token, 'qodcf29e829', 'shibo123123');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('New password has already been used before by this user', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestChnageUserPassword(userToken.token, 'jack123123', 'jack123123');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('too short new password', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestChnageUserPassword(userToken.token, 'jack123123', 'shibo1');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('new password has to contain at least one number and at least one letter(2)', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestChnageUserPassword(userToken.token, 'jack123123', '193461639020');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('new password has to contain at least one number and at least one letter(3)', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestChnageUserPassword(userToken.token, 'jack123123', 'ajshsuvdvUGUuyvuy');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual(ERROR);
    expect(response.statusCode).toBe(400);
  });

  test('successfully updated password', () => {
    const userCreate = requestRegister('jack@gmail.com', 'jack123123', 'Jack', 'Wang');
    const userToken = JSON.parse(userCreate.body.toString());

    const response = requestChnageUserPassword(userToken.token, 'jack123123', 'shibo123123');
    const result = JSON.parse(response.body.toString());
    expect(result).toStrictEqual({});
    expect(response.statusCode).toBe(200);

    const userLogin = requestLogin('jack@gmail.com', 'jack123123');
    const loginRes = JSON.parse(userLogin.body.toString());
    expect(loginRes).toStrictEqual(ERROR);
    expect(userLogin.statusCode).toBe(400);

    const userLogin2 = requestLogin('jack@gmail.com', 'shibo123123');
    const loginRes2 = JSON.parse(userLogin2.body.toString());
    expect(loginRes2).toStrictEqual(TOKEN);
    expect(userLogin2.statusCode).toBe(200);
  });
});
