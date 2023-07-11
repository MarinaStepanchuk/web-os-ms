import express from 'express';
import { port } from './constants.js';
import Msvhd from './driver/Mshvd.js';

const app = express();

app.use(express.static('static'));

app.get('/start', (req, res) => {
  res.json(Msvhd.readFile('/apps/start.js'));
});

app.get('/drive', (req, res) => {
  res.json(Msvhd.readFolder('/'));
});

const start = async () => {
  try {
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
