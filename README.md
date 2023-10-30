# Noise reduction with Vonage Video API

This sample application shows how to use a basic video application with the [Vonage noise reduction library]
(https://www.npmjs.com/package/@vonage/noise-suppression/v/1.0.0-beta.2?activeTab=readme).

## Running the sample app

### Running localy

1. Populate .env as per .env.sample
2. Run npm install
3. Run node index.js
4. Expose the port the app is running on with ngrok.

### Running on VCR

To be able to test the sample easily you can open index.html with Live server utility in VS code. If you need to test out of your local network you can use ngrok to expose the port of your local server

1. Populate neru.yml file as per neru.sample.yml
2. Init a neru project
3. Run neru deploy
