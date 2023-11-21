import { MediaProcessorConnector, MediaProcessor } from './mediaProcessor.js';

import { NoiseSuppressionTransformer } from './noiseSuppresion.js';

/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */
/* global MediaProcessorConnector */

let apiKey;
let sessionId;
let token;

let processor;
let transformer;
let state = 'noiseSuppressed';
const SAMPLE_SERVER_BASE_URL = window.location.origin;

const toggle = document.getElementById('toggle');
const noiseSuppresionState = document.getElementById('noiseSuppresionState');

toggle.addEventListener('click', function () {
  toggleNoiseReductor(transformer);
});

async function getNoiseSuppressionConnector() {
  try {
    processor = new MediaProcessor();
    transformer = new NoiseSuppressionTransformer();
    await transformer.init({
      //uncomment the line below pointing to where the assets are stored and set disableWasmMultiThread to false
      //to use multithreadding and improve performance
      // assetsDirBaseUrl: `${window.location.origin}/dist`,
      disableWasmMultiThread: true,
    });
    await processor.setTransformers([
      transformer,
      // my other audio transformers
    ]);
    return new MediaProcessorConnector(processor);
  } catch (e) {
    console.log('something went wrong');
    throw e;
  }
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
  const noiseSuppressionConnector = await getNoiseSuppressionConnector();

  const publisher = OT.initPublisher('publisher', {}, handleError);
  // Connect to the session
  session.connect(token, (error) => {
    if (error) {
      handleError(error);
    } else {
      // If the connection is successful, publish the publisher to the session
      // and transform stream
      session.publish(publisher);
      publisher.setAudioMediaProcessorConnector(noiseSuppressionConnector);
    }
  });
};

// See the config.js file.
// if (!API_KEY || !TOKEN || !SESSION_ID) {
//   throw new Error('no credentials provided');
// } else {
//   apiKey = API_KEY;
//   sessionId = SESSION_ID;
//   token = TOKEN;
//   await initializeSession();
// }

if (SAMPLE_SERVER_BASE_URL) {
  // Make a GET request to get the OpenTok API key, session ID, and token from the server
  fetch(SAMPLE_SERVER_BASE_URL + '/room/123', {
    // headers: {
    //   'Content-Type': 'application/json',
    //   'Cross-Origin-Opener-Policy': 'same-origin',
    //   'Cross-Origin-Embedder-Policy': 'require-corp',
    //   // 'Content-Type': 'application/x-www-form-urlencoded',
    // },
  })
    .then((response) => response.json())
    .then((json) => {
      apiKey = json.apiKey;
      sessionId = json.sessionId;
      token = json.token;
      // Initialize an OpenTok Session object
      initializeSession();
    })
    .catch((error) => {
      handleError(error);
      alert('Failed to get opentok sessionId and token. Make sure you have updated the config.js file.');
    });
}
