# Noise reduction with Vonage Video API

This sample application shows how to use a basic video application with the [Vonage noise reduction library]
(https://www.npmjs.com/package/@vonage/noise-suppression/v/1.0.0-beta.2?activeTab=readme).

## Running the sample app

### Running localy

1. Populate .env as per .env.sample
2. Run npm install
3. Run node index.js
4. Expose the port the app is running on with ngrok to test over HTTPs.

### Multithread.

To improve performance it is recommended to run the sample app with multiple threads. For that you need to change [this flag](https://github.com/nexmo-se/noise-reduction-sample-app/blob/main/public/js/app.js#L32) and specify the `assetsDirBaseUrl` where you are hosting the resources. This application implements cross origin isolation as long as it runs on HTTPs.

### Running on VCR

To be able to test the sample easily you can open index.html with Live server utility in VS code. If you need to test out of your local network you can use ngrok to expose the port of your local server

1. Populate neru.yml file as per neru.sample.yml
2. Init a neru project
3. Run neru deploy
