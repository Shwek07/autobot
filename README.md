# AutoBot – AI Chatbot for Auto Parts Search

AutoBot is an AI-powered chatbot developed to assist users in finding compatible car parts through a conversational interface. 
Instead of manually browsing product catalogs, users can ask questions in natural language, such as:
"Do you have spark plugs for a Toyota Hilux 2020?"
The chatbot collects missing information, understands the user's intent, and searches the database for compatible parts.
This project is built using **Next.js**, **TypeScript**, **PostgreSQL (Neon)** and **LLM integration via Groq API**.


# Features
- AI chatbot interface
- Intent detection system
- Automatic collection of required search information
- Car part compatibility search
- Database integration
- Chat summaries stored for conversation context
- Google Authentication via NextAuth
- Scalable architecture for AI-based search

Intent types supported:
- SEARCH
- RESERVATION
- GENERAL
- SMALLTALK

# Tech Stack

### Frontend
- Next.js
- React
- TypeScript

### Backend
- Next.js API Routes
- Node.js

### Database
- PostgreSQL (Neon)

### AI / LLM
- Groq API

### Authentication
- NextAuth with Google Login

### Deployment
- Vercel: https://autobot-unasat.vercel.app/


# How AutoBot Works

1. The user sends a message in the chat interface.
2. The backend receives the message.
3. System and developer prompts are added.
4. The LLM determines the intent of the message.
5. Based on the detected intent, the correct handler is triggered.
6. For search requests, the chatbot collects required information such as:
   - car brand
   - model
   - year
   - part name
7. Once enough information is available, a database search is performed.
8. The results are returned to the user.
9. The conversation summary is updated and stored for context in future messages.


# Database Structure

The chatbot uses several tables to retrieve product and compatibility information.

Main tables used:

- categories
- products
- auto_model
- product_compatibility
- chats
- chat_summary

These tables allow AutoBot to determine which car parts are compatible with specific vehicles.

# Authentication

The application uses NextAuth with Google Authentication.

Users can sign in using an existing Google account.


## Local System Requirements

Before running the application locally, ensure that the following requirements are met:

- Node.js installed (Next.js 16 requires Node.js 18 or higher)
- npm installed
- Access to the Neon Database
- Database credentials available

# Clone the Repository

Open Visual Studio Code and run:

git clone https://github.com/Shwek07/autobot.git

## Install Dependencies
npm install

The project uses the following main libraries:

- next
- react
- next-auth
- pg
- @neondatabase/serverless
- groq-sdk
- framer-motion
- lucide-react
- react-icons
- react-to-print

## Run the Project

Start the development server:
npm run dev
Open: http://localhost:3000

# Authors

Developed by the AutoBot Project Team:
Ramkhelawan Riaaz
Sodipo Sherreskly
Sangham Rishika
Ramdhiansing Shakeel
Sariman Jalen

