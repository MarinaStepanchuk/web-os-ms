import express from 'express';
import { port } from './constants.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static('static'));

app.get('/drive', (req, res) => {
  res.sendFile(__dirname + '/drive' + '/VirtualHardDrive.js');
});

app.get('/driver', (req, res) => {
  res.sendFile(path.join(__dirname, '/drive', '/Mshvd.js'));
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
