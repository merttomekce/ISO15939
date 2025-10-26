# ISO15939 Measurement and Simulation Tool

This project is a web-based tool for software measurement and simulation, based on the ISO/IEC 15939 standard. It provides a user-friendly interface to define, collect, analyze, and plan software measurements, as well as to simulate measurement processes.

## Features

*   **Dashboard:** A central dashboard to visualize measurement data and get an overview of the measurement process.
*   **Measurement Wizard:** A step-by-step wizard to guide users through the process of defining and performing software measurements according to the ISO/IEC 15939 standard.
*   **Simulator:** A tool to simulate software measurement processes, allowing users to experiment with different scenarios and parameters.
*   **Process Overview:** A graphical representation of the measurement process, helping users to understand the relationships between different measurement activities.
*   **Themeable:** The application includes a theme provider and a theme toggle to switch between light and dark modes.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v22 or later)
*   [pnpm](https://pnpm.io/)

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/merttomekce/ISO15939.git
    ```
2.  Install NPM packages
    ```sh
    pnpm install
    ```
3.  Run the development server
    ```sh
    pnpm dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Technologies Used

*   [Next.js](https://nextjs.org/) - React framework for building server-side rendered and static web applications.
*   [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript that compiles to plain JavaScript.
*   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapidly building custom designs.
*   [shadcn/ui](https://ui.shadcn.com/) - A collection of re-usable components built using Radix UI and Tailwind CSS.
*   [Recharts](https://recharts.org/) - A composable charting library built on React components.
*   [Framer Motion](https://www.framer.com/motion/) - A production-ready motion library for React.

## File Structure

The project follows the standard Next.js `app` directory structure.

*   `app/`: Contains the main application logic, including pages, layouts, and components.
*   `components/`: Contains re-usable React components used throughout the application.
*   `hooks/`: Contains custom React hooks.
*   `lib/`: Contains utility functions and libraries.
*   `public/`: Contains static assets such as images and fonts.
*   `styles/`: Contains global styles and CSS modules.

