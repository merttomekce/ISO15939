# ISO 15939 Measurement & Simulation Tool

A web-based tool for defining, collecting, and analyzing software measurements according to the **ISO/IEC 15939** standard. It includes a comprehensive Measurement Wizard, a Simulator for "what-if" analysis, and an **AI-powered analysis** feature using Google Gemini.

## Features

-   **Measurement Wizard**: A 6-step guided process to define Information Needs, Measures, and Indicators.
-   **AI Analysis**: Generates detailed compliance reports and quality recommendations using Google's Gemini 1.5 Flash model.
-   **Simulator**: Interactive tool to simulate measurement scenarios and visualize outcomes.
-   **Reference Library**: built-in access to key ISO standards and project documentation.
-   **Secure Architecture**: Backend proxy ensures API keys are never exposed to the client.

## Technology Stack

-   **Frontend**: Vanilla HTML5, JavaScript (ES6+), Tailwind CSS (via CDN).
-   **Backend**: Node.js, Express.js.
-   **AI**: Google Gemini API via `generativelanguage.googleapis.com`.

## Getting Started

Follow these steps to run the application locally.

### Prerequisites
-   [Node.js](https://nodejs.org/) (v16 or higher) installed.
-   A generic text editor or IDE (VS Code recommended).

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/merttomekce/ISO15939.git
    cd ISO15939
    ```

2.  **Install Backend Dependencies**
    The application requires a lightweight backend server to handle secure API calls.
    ```bash
    cd backend
    npm install
    ```

3.  **Configure API Key**
    To use the AI features, you need a free Google Gemini API Key.
    1.  Get a key from [Google AI Studio](https://aistudio.google.com/).
    2.  Create a file named `.env` inside the `backend` folder.
    3.  Add your key to the file:
        ```env
        PORT=5000
        GEMINI_API_KEY=AIzaSy... (paste your actual key here)
        ```

4.  **Start the Application**
    From the `backend` directory, run:
    ```bash
    npm start
    ```
    The terminal should show: `Server running on http://localhost:5000`

### How to Use

1.  Open your browser and visit **`http://localhost:5000`**.
    > **Note**: Do not open the `.html` files directly (e.g., `file:///...`). The AI features require the server environment.
2.  Navigate to **Measurement**.
3.  Fill out the 6-step form.
4.  Click the purple **Analyze with AI** button to generate a report.

## Directory Structure

-   `backend/`: Node.js server and API routes.
    -   `server.js`: Main entry point, serves static files and API.
    -   `routes/`: API endpoint definitions.
-   `index.html`: Landing page.
-   `measurement.html`: Core measurement wizard interface.
-   `measurement.js`: Client-side logic for the wizard and AI integration.
-   `styles/`: Custom CSS (if any) alongside Tailwind.
