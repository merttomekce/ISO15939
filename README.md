# ISO 15939 Measurement & Simulation Tool

A web-based tool for defining, collecting, and analyzing software measurements according to the **ISO/IEC 15939** standard. It includes a comprehensive Measurement Wizard, a Simulator for "what-if" analysis, and an **AI-powered analysis** feature using Google Gemini.

The project is now fully backed by a **MongoDB database** to persist simulation results and measurement drafts.

## Features

-   **Measurement Wizard**: A 6-step guided process to define Information Needs, Measures, and Indicators.
-   **Database Persistence**: Save measurement drafts and simulation history to MongoDB to access them anytime.
-   **AI Analysis**: Generates detailed compliance reports and quality recommendations using Google's Gemini 1.5 Flash model.
-   **Simulator**: Interactive tool to simulate measurement scenarios, visualize outcomes with Radar Charts, and perform "what-if" analysis.
-   **PDF Reporting**: Export detailed simulation reports and measurement definitions as professional PDF documents.
-   **Secure Architecture**: Backend proxy ensures API keys and database credentials are never exposed to the client.

## Technology Stack

-   **Frontend**: Vanilla HTML5, JavaScript (ES6+), Tailwind CSS (via CDN), Chart.js, jsPDF.
-   **Backend**: Node.js, Express.js.
-   **Database**: MongoDB, Mongoose (ODM).
-   **AI**: Google Gemini API.

## Getting Started

Follow these steps to run the application locally.

### Prerequisites
-   [Node.js](https://nodejs.org/) (v16 or higher) installed.
-   A generic text editor or IDE (VS Code recommended).
-   A **MongoDB Connection URI** (You can use [MongoDB Atlas](https://www.mongodb.com/atlas/database) for a free cloud database or install MongoDB Community Server locally).

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/merttomekce/ISO15939.git](https://github.com/merttomekce/ISO15939.git)
    cd ISO15939
    ```

2.  **Install Backend Dependencies**
    The application requires a backend server to handle the database and AI API calls.
    ```bash
    cd backend
    npm install
    ```

3.  **Configure Environment Variables**
    You need to configure your API keys and Database connection.
    1.  Create a file named `.env` inside the `backend` folder.
    2.  Add the following configurations:
        ```env
        PORT=5000
        # Google Gemini API Key (Get one from aistudio.google.com)
        GEMINI_API_KEY=AIzaSy...
        
        # MongoDB Connection String
        # Example for Local: mongodb://127.0.0.1:27017/iso15939_db
        # Example for Atlas: mongodb+srv://<user>:<pass>@cluster0...
        MONGO_URI=mongodb://127.0.0.1:27017/iso15939_db
        ```

4.  **Start the Application**
    From the `backend` directory, run:
    ```bash
    npm start
    ```
    The terminal should show: 
    - `Server running on http://localhost:5000`
    - `✅ MongoDB Connected Successfully`

### How to Use

1.  Open your browser and visit **`http://localhost:5000`**.
    > **Note**: Do not open the `.html` files directly. The app must be served via the backend to access the database.
2.  **Simulator**: Run simulations, define quality dimensions, and click "Finish" to save results to the DB and download a PDF report.
3.  **Measurement**: Fill out the form. Use "Save Draft" to persist your progress to the database.
4.  **AI Analysis**: Click "Analyze with AI" in the Measurement section for intelligent feedback.

## Directory Structure

-   `backend/`: Server-side logic.
    -   `server.js`: Main entry point, database connection, and static file serving.
    -   `models/`: Mongoose schemas (Measurement.js, Simulation.js).
    -   `routes/`: API endpoint definitions.
-   `index.html`: Landing page.
-   `measurement.html`: Core measurement wizard interface.
-   `simulator.html`: Simulation and Charting interface.
-   `measurement.js`: Client-side logic for the wizard and API integration.
-   `simulator.js`: Logic for the simulator, charts, and PDF generation.
