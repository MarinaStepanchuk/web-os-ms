import express from 'express';
import { port } from './constants.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { updateDrive, getDrive } from './drive/drive.js';

const app = express();

app.use(express.json());

app.use(express.static('static'));

app.get('/drive', (req, res) => {
  res.sendFile(__dirname + '/drive' + '/VirtualHardDrive.js');
});

app.get('/driver', (req, res) => {
  res.sendFile(path.join(__dirname, '/drive', '/Mshvd.js'));
});

app.get('/executor', (req, res) => {
  res.sendFile(path.join(__dirname, '/drive', '/Executor.js'));
});

app.get('/load-drive', (req, res) => {
  res.json(getDrive());
});

app.post('/update-drive', (req, res) => {
  updateDrive(req.body.virtualDrive);
  res.json('success');
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
