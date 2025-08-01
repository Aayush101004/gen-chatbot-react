# Gem AI: A Dual-Capability React Chatbot
This is a modern, responsive React-based chatbot application that leverages the power of Google's Gemini for advanced conversational AI and the GNews API for fetching real-time news headlines.
The application is designed with a clean, intuitive user interface and can intelligently distinguish between a conversational query and a request for live news, providing the appropriate response for each.
## Features
- Conversational AI: Engage in natural, multi-turn conversations powered by the Google Gemini 1.5 Flash model.
- Real-time News: Ask for the latest news on various topics (e.g., "sports news," "latest technology headlines") to get up-to-the-minute information from around India.
- Intelligent Intent Detection: The chatbot automatically detects whether you are asking for news or having a conversation and uses the correct API.
- Markdown Rendering: The chatbot's responses are beautifully formatted, with support for bold text and multi-level nested lists.
- Custom Avatars: Features a custom image for the bot's avatar (diamond.png).
- Responsive Design: The user interface is built with Tailwind CSS and is fully responsive for both desktop and mobile use.
## Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.
### Prerequisites
- Node.js (which includes npm) installed on your computer.
- A code editor like Visual Studio Code.
### Setup Instructions
- Clone the repository (or download the project files) to your local machine.
- Navigate into the project directory in your terminal:
- cd gen-chatbot-react
### Install the necessary dependencies:
- npm install
### Create an Environment File:
- In the root of your project folder, create a new file named .env.
- This file will store your secret API keys.
### Add Your API Keys to the .env file:
- Google Gemini API Key:
  - Get your free key from Google AI Studio.
- GNews API Key:
  - Get your free key from GNews.io.
- Open your .env file and add the following lines, replacing the placeholder text with your actual keys:
  - REACT_APP_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
  - REACT_APP_GNEWS_API_KEY=YOUR_GNEWS_API_KEY_HERE
Note: The variables must start with REACT_APP_ for React to recognize them.
## How to Run the Application
Once you have completed the setup steps, you can start the application by running the following command in your terminal:
- npm start

This will open the chatbot application in your default web browser, usually at http://localhost:3000.
## Technologies Used
- React: A JavaScript library for building user interfaces.
- Tailwind CSS: A utility-first CSS framework for rapid UI development.
- Google Gemini API: For state-of-the-art conversational AI.
- GNews API: For fetching real-time news headlines.
## Important Notes
- Security: The .gitignore file is configured to ignore the .env file. Never commit your .env file or hardcode your API keys directly in the code if you plan to share it publicly or deploy it.
- Disclaimer: The chatbot includes a disclaimer in the footer: "Don't trust Gem blindly. It may generate false results." This is an important reminder about the nature of large language models.
