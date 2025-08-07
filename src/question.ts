import { getData, setData } from './dataStore';
import { tokenToUserId } from './helperFunctions';
import HTTPError from 'http-errors';

export enum colours {
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
}

// helper functions
function generateRandomColour(): colours {
  const colourValues = Object.values(colours);
  const randomIndex = Math.floor(Math.random() * colourValues.length);
  return colourValues[randomIndex];
}

// functions

export function adminQuestionCreate(token: string, quizId: number, questionBody: QuestionInput) {
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
  };

  targetQuiz.questions.push(newQuestion);

  return { questionId: questionId };
}

export function adminQuestionDelete(token: string, quizId: number, questionId: number) {
  const data = getData();

  const authUserId = tokenToUserId(token);

  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (targetQuiz === undefined) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (targetQuiz.authUserId !== authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  const targetQuestion = targetQuiz.questions.find(questionObject => questionObject.questionId === questionId);
  if (targetQuestion === undefined) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }
  targetQuiz.duration = targetQuiz.duration - targetQuestion.duration;
  const totalNumQuestions = targetQuiz.numQuestions - 1;
  targetQuiz.numQuestions = totalNumQuestions;
  targetQuiz.timeLastEdited = Math.floor(Date.now() / 1000);
  targetQuiz.questions = targetQuiz.questions.filter(questionObject => questionObject.questionId !== questionId);
  targetQuiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);

  return { };
}

export function adminQuestionUpdate(token: string, quizId: number, questionId: number, questionBody: QuestionInput) {
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

  return { };
}

export function adminQuestionMove(token: string, quizId: number, questionId: number, newPosition: number) {
  const data = getData();

  const authUserId = tokenToUserId(token);

  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (targetQuiz === undefined) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }

  if (targetQuiz.authUserId !== authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  if (targetQuiz.questions.find(questionObject => questionObject.questionId === questionId) === undefined) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }

  const movedQuestion = { ...targetQuiz.questions.find(questionObject => questionObject.questionId === questionId) };

  if (newPosition < 0) {
    throw HTTPError(400, 'NewPosition is less than 0');
  } else if (newPosition > (targetQuiz.questions.length - 1)) {
    throw HTTPError(400, 'NewPosition is over the range of the array');
  }

  const movedQuestionPosition = targetQuiz.questions.findIndex(questionObject => questionObject.questionId === questionId);
  if (newPosition === movedQuestionPosition) {
    throw HTTPError(400, 'NewPosition is the position of the current question');
  }

  // Delete the movedQuestion first
  targetQuiz.questions = targetQuiz.questions.filter(questionObject => questionObject.questionId !== questionId);

  // move the question to the new position
  targetQuiz.questions.splice(newPosition, 0, movedQuestion);

  return { };
}

export function adminQuestionDuplicate(token: string, quizId: number, questionId: number) {
  const data = getData();

  const authUserId = tokenToUserId(token);

  const targetQuiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (targetQuiz === undefined) {
    throw HTTPError(400, 'Quiz ID does not refer to a valid quiz');
  }
  // Create a newQuestionId here
  const newQuestionId = targetQuiz.questions.length;

  if (targetQuiz.authUserId !== authUserId) {
    throw HTTPError(400, 'Quiz ID does not refer to a quiz that this user owns');
  }

  if (targetQuiz.questions.find(questionObject => questionObject.questionId === questionId) === undefined) {
    throw HTTPError(400, 'Question Id does not refer to a valid question within this quiz');
  }

  const copiedQuestion = { ...targetQuiz.questions.find(questionObject => questionObject.questionId === questionId) };

  copiedQuestion.questionId = newQuestionId;

  // Quiz change factor：
  // 1. numquestions:
  const totalNumQuestions = targetQuiz.numQuestions + 1;
  targetQuiz.numQuestions = totalNumQuestions;
  // 2. Total duration:
  targetQuiz.duration = targetQuiz.duration + copiedQuestion.duration;
  // 3. update the timeLastEdited for the particular quiz
  targetQuiz.timeLastEdited = Math.floor(Date.now() / 1000);

  const position = targetQuiz.questions.findIndex(questionObject => questionObject.questionId === questionId);

  targetQuiz.questions.splice(position + 1, 0, copiedQuestion);

  return { newQuestionId: newQuestionId };
}
