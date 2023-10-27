import { MediaProcessorConnector, MediaProcessor } from '../node_modules/@vonage/media-processor/dist/media-processor.es.js';

import { NoiseSuppressionTransformer } from '../node_modules/@vonage/noise-suppression/dist/noise-suppression.es.js';
/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */
/* global MediaProcessorConnector */

let apiKey;
let sessionId;
let token;

let processor;
let transformer;
let state;

const toggle = document.getElementById('toggle');
const noiseSuppresionState = document.getElementById('noiseSuppresionState');

toggle.addEventListener('click', function () {
  toggleNoiseReductor(transformer);
});

async function suppressNoiseFromAudioStream(source) {
  processor = new MediaProcessor();
  transformer = new NoiseSuppressionTransformer();
  await transformer.init({});
  await processor.setTransformers([
    transformer,
    // my other audio transformers
  ]);
  const connector = new MediaProcessorConnector(processor);
  const track = await connector.setTrack(source.getAudioTracks()[0]);
  const output = new MediaStream();
  output.addTrack(track);
  return output;
}

async function toggleNoiseReductor(transformer) {
  if (state === 'noiseSuppressed') {
    console.log('disabling noise reduction');
    transformer.disable();
    noiseSuppresionState.innerText = 'Noise suppression : OFF';
    state = 'noise';
  } else {
    console.log('enabling noise reduction');
    transformer.enable();
    noiseSuppresionState.innerText = 'Noise suppression : ON';
    state = 'noiseSuppressed';
  }
}

const handleError = (error) => {
  if (error) {
    console.error(error);
  }
};

const initializeSession = async () => {
  const session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', (event) => {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
    };
    session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError);
  });
  const stream = await OT.getUserMedia({ audio: true, video: true });
  const noiseSuppresedStream = await suppressNoiseFromAudioStream(stream);
  console.log(noiseSuppresedStream);

  const publisher = OT.initPublisher('publisher', { audioSource: noiseSuppresedStream.getAudioTracks()[0] }, handleError);

  // Connect to the session
  session.connect(token, (error) => {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      // and transform stream
      session.publish(publisher);
    }
  });
};

// See the config.js file.
if (!API_KEY || !TOKEN || !SESSION_ID) {
  throw new Error('no credentials provided');
} else {
  apiKey = API_KEY;
  sessionId = SESSION_ID;
  token = TOKEN;
  await initializeSession();
}
