# Aura
### Daily Reflection App
<img width="381" height="676" alt="Screenshot 2026-02-02 at 3 08 28 PM" src="https://github.com/user-attachments/assets/05c1b27d-dabf-4317-9c0f-b108d1dc5cbd" />
Aura is a minimal daily reflection application that generates an image, provided by Gemini, based on the user's location. 
It contains a reflection statement and offers the user an opportunity to dialogue with a Chatbot via voice or text. 
Deployed on Google Cloud Run at: https://aura-daily-reflection-898700652948.us-west1.run.app/

# Google AI Studio App
## Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1OnnNzWClAqwehqQJn2UwYyfdU5OvUIO6

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
