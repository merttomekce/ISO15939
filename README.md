# ISO 15939 Measurement & Simulation Tool

A web-based tool for defining, collecting, and analyzing software measurements according to the **ISO/IEC 15939** standard. It includes a comprehensive Measurement Wizard, a Simulator for "what-if" analysis, and an **AI-powered analysis** feature using Google Gemini.

The project has been modernized to use **Next.js** for the frontend and **Node.js/Express** for the backend, with a **MongoDB database** for persistence.

## Features

-   **Measurement Wizard**: A 6-step guided process to define Information Needs, Measures, and Indicators.
-   **Database Persistence**: Save measurement drafts and simulation history to MongoDB.
-   **AI Analysis**: Generates detailed compliance reports and quality recommendations using Google's Gemini 1.5 Flash model.
-   **Simulator**: Interactive tool to simulate measurement scenarios, visualize outcomes with Radar Charts, and perform "what-if" analysis.
-   **PDF Reporting**: Export detailed simulation reports and measurement definitions as professional PDF documents.
-   **Modern UI**: Responsive design built with Next.js and Tailwind CSS, featuring dark mode support.

## Technology Stack

### Frontend
-   **Framework**: [Next.js](https://nextjs.org/) (React)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Charts**: Chart.js
-   **State Management**: React Hooks & Context API

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB, Mongoose (ODM)
-   **AI**: Google Gemini API

## Getting Started

Follow these steps to run the application locally. You will need to run both the backend and frontend servers.

### Prerequisites
-   [Node.js](https://nodejs.org/) (v16 or higher) installed.
-   A **MongoDB Connection URI** (Local or Atlas).

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/merttomekce/ISO15939.git
    cd ISO15939
    ```

2.  **Backend Setup**
    The backend handles database interactions and AI requests.
    ```bash
    cd backend
    npm install
    ```
    
    Create a `.env` file in the `backend` folder:
    ```env
    PORT=5001
    GEMINI_API_KEY=AIzaSy...
    MONGO_URI=mongodb://127.0.0.1:27017/iso15939_db
    ```
    
    Start the backend server:
    ```bash
    npm start
    ```
    > The backend will run on **http://localhost:5001**.
    > Note: Ensure your `PORT` in .env matches the port you expect (default is often 5000 or 5001).

3.  **Frontend Setup**
    The frontend is a Next.js application.
    Open a new terminal window in the root directory.
    ```bash
    cd frontend
    npm install
    ```
    
    Start the frontend development server:
    ```bash
    npm run dev
    ```
    > The frontend will run on **http://localhost:3000**.

### How to Use

1.  Open your browser and visit **`http://localhost:3000`**.
2.  **Dashboard**: Navigate to different tools from the main dashboard.
3.  **Measurement**: Define your measurement plan.
4.  **Simulator**: Run simulations and visualize results.
5.  **AI Analysis**: Get intelligent insights on your measurement definitions.

## Directory Structure

-   `backend/`: Node.js/Express server and API routes.
-   `frontend/`: Next.js application (App Router).
    -   `app/`: Pages and layouts.
    -   `components/`: Reusable React components.
    -   `public/`: Static assets.
-   `legacy_src/`: Old vanilla HTML/JS implementation (kept for reference).
