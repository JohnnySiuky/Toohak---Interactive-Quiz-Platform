import { getData, setData } from './dataStore';
import { tokenToUserId } from './helperFunctions';
import HTTPError from 'http-errors';
import request from 'sync-request';
import fs from 'fs';

enum colours {
  RED = 'red',
  BLUE = 'blue',
  YELLOW = 'yellow',
  GREEN = 'green',
  BROWN = 'brown',
  PURPLE = 'purple',
  ORANGE = 'orange',
}

interface Answer {
  answer: string;
  correct: boolean;
}

interface QuestionInput {
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
  thumbnailUrl: string;
}

// helper function
function generateRandomColour(): colours {
  const colourValues = Object.values(colours);
  const randomIndex = Math.floor(Math.random() * colourValues.length);
  return colourValues[randomIndex];
}

/// ///////////////////////////////////////////////////////////////////////////////////////
/// ///////////////// New V2 Functions/////////////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////

export function adminQuestionCreateV2(token: string, quizId: number, questionBody: QuestionInput) {
  const data = getData();

  const authUserId = tokenToUserId(token);

  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (targetQuiz === undefined) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (targetQuiz.authUserId !== authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    throw HTTPError(400, 'Question string is less than 5 characters in length or greater than 50 characters in length');
  }

  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    throw HTTPError(400, 'The question has more than 6 answers or less than 2 answers');
  }

  if (questionBody.duration <= 0) {
    throw HTTPError(400, 'The question duration is not a positive number');
  }

  const totalDuration = targetQuiz.duration + questionBody.duration;
  if (totalDuration > 180) {
    throw HTTPError(400, 'The sum of the question durations in the quiz exceeds 3 minutes');
  }

  if (questionBody.points < 1 || questionBody.points > 10) {
    throw HTTPError(400, 'The points awarded for the question are less than 1 or greater than 10');
  }

  if (questionBody.answers.find(answer => answer.answer.length < 1) !== undefined) {
    throw HTTPError(400, 'The length of one of the answers is shorter than 1 character long');
  } else if (questionBody.answers.find(answer => answer.answer.length > 30) !== undefined) {
    throw HTTPError(400, 'The length of one of the answers is longer than 30 characters long');
  }

  if (questionBody.thumbnailUrl === '') {
    throw HTTPError(400, 'The thumbnailUrl is an empty string');
  }

  let response;
  try {
    response = request(
      'GET',
      questionBody.thumbnailUrl
    );
  } catch (error) {
    throw HTTPError(400, 'The thumbnailUrl does not return to a valid file');
  }

  const url = questionBody.thumbnailUrl;
  const fileExtensionMatch = url.match(/\.(jpg|png|jpeg)/i);
  if (!fileExtensionMatch) {
    throw HTTPError(400, 'The thumbnailUrl, when fetched, is not a JPG or PNG file type');
  }

  const answerSet = new Set();
  for (const answerObject of questionBody.answers) {
    const answerString = answerObject.answer;

    if (answerSet.has(answerString)) {
      throw HTTPError(400, 'The repeated answer in a question');
    }

    answerSet.add(answerString);
  }

  if (questionBody.answers.find(answer => answer.correct === true) === undefined) {
    throw HTTPError(400, 'There are no correct answers');
  }

  // update the timeLastEdited for the particular quiz
  targetQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  targetQuiz.duration = totalDuration;
  const totalNumQuestions = targetQuiz.numQuestions + 1;
  targetQuiz.numQuestions = totalNumQuestions;

  // generate new questionId number;
  const questionId = targetQuiz.questions.length;

  // answersInput part
  const answersInput = questionBody.answers.map((obj, index) => ({
    ...obj,
    answerId: index + 1,
    colour: generateRandomColour(),
  }));

  const newQuestion = {
    questionId: questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: answersInput,
    thumbnailUrl: url,
  };

  targetQuiz.questions.push(newQuestion);

  const fileExtension = fileExtensionMatch[0];
  const body = response.getBody();
  const addressStr = 'src/imageFile/' + `quiz${quizId}_question${questionId}` + fileExtension;
  fs.writeFileSync(addressStr, body, { flag: 'w' });
  setData(data);

  return { questionId: questionId };
}

// update a question
export function adminQuestionUpdateV2(token: string, quizId: number, questionId: number, questionBody: QuestionInput) {
  const data = getData();

  const authUserId = tokenToUserId(token);

  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (targetQuiz === undefined) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (targetQuiz.authUserId !== authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  const updateQuestion = targetQuiz.questions.find(question => question.questionId === questionId);
  if (updateQuestion === undefined) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }

  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    throw HTTPError(400, 'Question string is less than 5 characters in length or greater than 50 characters in length');
  }

  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    throw HTTPError(400, 'The question has more than 6 answers or less than 2 answers');
  }

  if (questionBody.duration <= 0) {
    throw HTTPError(400, 'The question duration is not a positive number');
  }

  const totalDuration = targetQuiz.duration + questionBody.duration - updateQuestion.duration;

  if (totalDuration > 180) {
    throw HTTPError(400, 'The sum of the question durations in the quiz exceeds 3 minutes');
  }

  if (questionBody.points < 1 || questionBody.points > 10) {
    throw HTTPError(400, 'The points awarded for the question are less than 1 or greater than 10');
  }

  if (questionBody.answers.find(answer => answer.answer.length < 1) !== undefined) {
    throw HTTPError(400, 'The length of one of the answers is shorter than 1 character long');
  } else if (questionBody.answers.find(answer => answer.answer.length > 30) !== undefined) {
    throw HTTPError(400, 'The length of one of the answers is longer than 30 characters long');
  }

  const answerSet = new Set();
  for (const answerObject of questionBody.answers) {
    const answerString = answerObject.answer;

    if (answerSet.has(answerString)) {
      throw HTTPError(400, 'The repeated answer in a question');
    }

    answerSet.add(answerString);
  }

  if (questionBody.answers.find(answer => answer.correct === true) === undefined) {
    throw HTTPError(400, 'There are no correct answers');
  }

  // url errors
  if (questionBody.thumbnailUrl === '') {
    throw HTTPError(400, 'The thumbnailUrl is an empty string');
  }

  let response;
  try {
    response = request(
      'GET',
      questionBody.thumbnailUrl
    );
  } catch (error) {
    throw HTTPError(400, 'The thumbnailUrl does not return to a valid file');
  }

  const url = questionBody.thumbnailUrl;
  const fileExtensionMatch = url.match(/\.(jpg|png|jpeg)/i);
  if (!fileExtensionMatch) {
    throw HTTPError(400, 'The thumbnailUrl, when fetched, is not a JPG or PNG file type');
  }

  // Change in the targetquiz:
  targetQuiz.duration = totalDuration;
  targetQuiz.timeLastEdited = Math.floor(Date.now() / 1000);

  // answersInput part
  const answersInput = questionBody.answers.map((obj, index) => ({
    ...obj,
    answerId: index + 1,
    colour: generateRandomColour(),
  }));

  // Change in updatequestion
  updateQuestion.question = questionBody.question;
  updateQuestion.duration = questionBody.duration;
  updateQuestion.points = questionBody.points;
  updateQuestion.answers = answersInput;
  updateQuestion.thumbnailUrl = url;

  const fileExtension = fileExtensionMatch[0];
  const body = response.getBody();
  const addressStr = 'src/imageFile/' + `quiz${quizId}_question${questionId}` + fileExtension;
  fs.writeFileSync(addressStr, body, { flag: 'w' });
  setData(data);

  return { };
}

// get quiz Info
export function adminQuizInfoV2(token: string, quizId: number) {
  const data = getData();
  const authUserId = tokenToUserId(token);

  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (targetQuiz === undefined) {
    throw HTTPError(400, 'QuizId does not refer to a valid quiz');
  }

  if (targetQuiz.authUserId !== authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  return {
    quizId: targetQuiz.quizId,
    name: targetQuiz.name,
    timeCreated: targetQuiz.timeCreated,
    timeLastEdited: targetQuiz.timeLastEdited,
    description: targetQuiz.description,
    numQuestions: targetQuiz.numQuestions,
    questions: targetQuiz.questions,
    duration: targetQuiz.duration,
    thumbnailUrl: targetQuiz.thumbnailUrl,
  };
}
