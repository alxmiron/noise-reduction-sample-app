// const path = require('path');
import path from 'path';
import cors from 'cors';
import express from 'express';
import { neru, Assets } from 'neru-alpha';
import bodyParser from 'body-parser';
import { getCredentials, generateToken } from './server/opentok/index.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const app = express(); // create express app
// const opentok = require('./server/opentok');
// app.use(cors());
app.use(bodyParser.json());
// app.use(express.static('public'));

app.use(
  express.static('public', {
    setHeaders: (res) => {
      res.set('Cross-Origin-Opener-Policy', 'same-origin');
      res.set('Cross-Origin-Embedder-Policy', 'require-corp');
    },
  })
);

const sessions = {};
/**
 * renderRoom is used to render the ejs template
 * @param {Object} res
 * @param {String} sessionId
 * @param {String} token
 * @param {String} roomName
 * 
 
 */

app.get('/_/health', async (req, res) => {
  res.sendStatus(200);
});

const setSessionDataAndRenderRoom = async (res, roomName) => {
  const data = await getCredentials();
  sessions[roomName] = { sessionId: data.sessionId, connections: [] };
  sessions[data.sessionId] = roomName;
  console.log(data);
  res.send({ apiKey: data.apiKey, sessionId: data.sessionId, token: data.token, room: roomName });

  // renderRoom(res, data.apiKey, data.sessionId, data.token, roomName);
};

app.get('/room/:room', (req, res) => {
  const roomName = req.params.room;
  if (sessions[roomName]) {
    const sessionId = sessions[roomName].sessionId;
    const dataToken = generateToken(sessionId);
    res.send({ apiKey: dataToken.apiKey, sessionId: sessionId, token: dataToken.token, room: roomName });
    // renderRoom(res, dataToken.apiKey, sessionId, dataToken.token, roomName);
  } else {
    setSessionDataAndRenderRoom(res, roomName);
  }
});

const serverPort = process.env.PORT || 3000;

app.listen(serverPort, () => {
  console.log('server started on port', serverPort);
});
