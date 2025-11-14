# Project Overview

This project is a web-based tool for software quality assessment, based on the ISO/IEC 15939 standard. It provides a user-friendly interface to define, collect, analyze, and plan software measurements, as well as to simulate measurement processes.

The project is a static website built with HTML, CSS, and JavaScript. It uses Tailwind CSS for styling and Chart.js for data visualization.

## Key Files

*   `index.html`: The main landing page of the application.
*   `measurement.html`: A page for defining and managing software measurements.
*   `simulator.html`: A multi-step tool for simulating software quality assessment.
*   `script.js`: Contains JavaScript for theme toggling.
*   `simulator.js`: Contains the core logic for the quality assessment simulator.
*   `styles.css`: Contains global styles for the application.

## Usage

The application can be used by opening the `index.html` file in a web browser. The user can then navigate to the simulator or measurement pages to use the tools.

The simulator guides the user through a four-step process:

1.  **Define Quality Dimensions:** Select a case study or define a custom scenario with specific quality dimensions.
2.  **Assign Weights:** Assign importance weights to the selected dimensions.
3.  **Collect Metric Values:** Input measured values for each dimension.
4.  **Analyze Results:** View the overall quality score, a radar chart of the dimensions, and recommendations for improvement.
