import fs from 'fs';

const DATABASE_LOCATION = 'dataBase.json';

interface Answer {
  answerId: number;
  answer: string;
  correct: boolean;
  colour: string;
}

interface QuestionV2 {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
  thumbnailUrl: string;
}

interface Question {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
}

interface User {
  userId: number;
  nameFirst: string;
  nameLast: string;
  email: string;
  password: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

interface QuizV2 {
  quizId: number;
  authUserId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[] | QuestionV2[];
  duration: number;
  thumbnailUrl: string;
}

interface Quiz {
  quizId: number;
  authUserId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[] | QuestionV2[];
  duration: number;
}

interface Token {
  sessionId: number;
  userId: number;
}

interface Trash {
  quizzes: Quiz[] | QuizV2[];
}

interface Metadata {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[] | QuestionV2[];
  duration: number;
}

interface Message {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
}

interface Session {
  state: string;
  autoStartNum: number;
  atQuestion: number;
  players: string[];
  metadata: Metadata;
  sessionId: number;
  messages: Message[];
}

interface Player {
  name: string;
  playerId: number;
  sessionId: number;
}

interface UserRankedByScore {
  name: string;
  score: number;
}

interface QuestionCorrectBreakdown {
  answerId: number;
  playersCorrect: string[];
}

interface QuestionResult {
  questionId: number;
  questionCorrectBreakdown: QuestionCorrectBreakdown[];
  averageAnswerTime: number;
  percentCorrect: number;
}

interface AnswerTime {
  name: string;
  time: number;
}

interface QuestionRecord {
  questionId: number;
  answerTimes: AnswerTime[];
  startTime: number;
  completeCorrect: string[];
}

interface Score {
  sessionId: number;
  usersRankedByScore: UserRankedByScore[];
  questionResults: QuestionResult[];
  questionRecords: QuestionRecord[];
}

interface Timer {
  sessionId: number;
  timer: any;
}

interface data {
  users: User[];
  quizzes: Quiz[] | QuizV2[];
  tokens: Token[];
  trash: Trash;
  sessions: Session[];
  players: Player[];
  scores: Score[];
  timers: Timer[];
}

export const dataStore = (): data => {
  return {
    users: [],
    quizzes: [],
    tokens: [],
    trash: { quizzes: [] },
    sessions: [],
    players: [],
    scores: [],
    timers: [],
  };
};

const loadData = ():data => {
  if (!fs.existsSync(DATABASE_LOCATION)) {
    return dataStore();
  }
  // const data2 = fs.readFileSync(DATABASE_LOCATION);
  // return JSON.parse(data2.toString('utf-8'));
};

// export const saveData = () => {
//   fs.writeFileSync(
//     DATABASE_LOCATION,
//     JSON.stringify(dataStore)
//   );
// };

let data2 = loadData();

const getData = (): data => {
  return data2;
};

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: data) {
  data2 = newData;
}

export { getData, setData };
