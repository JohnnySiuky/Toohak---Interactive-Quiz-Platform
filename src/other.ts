
import { setData, getData } from './dataStore';
import fs from 'fs';
const path = require('path');

export function clear() {
  const data = getData();
  data.timers.forEach(timer => clearTimeout(timer.timer));

  const folderPath = 'src/imageFile';
  fs.readdir(folderPath, (err, files) => {
    for (const file of files) {
      fs.unlink(path.join(folderPath, file), (err) => {
        // write someting to avoid lint
      });
    }
  });

  setData({
    users: [],
    quizzes: [],
    tokens: [],
    trash: { quizzes: [] },
    sessions: [],
    players: [],
    scores: [],
    timers: [],
  });
  return { };
}
