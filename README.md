# Surya Namaskar App - Sun Salutation Guide & Practice Timer

![Surya Namaskar App Screenshot](link_to_your_screenshot.png) 

A simple, responsive web application designed to guide users through the Surya Namaskar (Sun Salutation) yoga sequence. It provides a step-by-step visual guide and a customizable timer for guided practice sessions, complete with audio cues.

## Features

*   **🧘‍♀️ Pose Guide:** Detailed breakdown of the 12 steps of Surya Namaskar, including:
    *   Clear pose images.
    *   Concise instructions for each pose.
    *   Breathing cues (Inhale, Exhale, Hold Breath, Normal).
*   **⏱️ Guided Practice:** A timer-based practice mode:
    *   Visual display of the current pose and the upcoming pose.
    *   Remaining time countdown for the current pose.
    *   Progress bar showing time elapsed in the current pose.
    *   Round counter to track progress.
    *   Start, Pause, and Reset controls.
*   **⚙️ Customization (Timing Tab):**
    *   Adjust the duration (2-30 seconds) for each of the 12 poses individually using sliders.
    *   Select the total number of practice rounds (3, 5, 10, 12, 24, 108).
    *   Toggle optional audio cues:
        *   **Voice Guidance:** Plays sounds for "Inhale", "Exhale", and "Hold Breath" corresponding to the pose.
        *   **Transition Sounds:** Plays a soft beep between poses.
    *   Settings are automatically saved in your browser's `localStorage` for persistence.
*   **🔊 Audio Cues:** Includes `.mp3` files for inhale, exhale, hold breath, and transition sounds (used in Guided Practice based on settings).
*   **▶️ Video Demonstration:** Embedded YouTube video showing the full sequence.
*   **📱 Responsive Design:** Built with Tailwind CSS for adaptability across different screen sizes (mobile-first approach).
*   **⚡ PWA Enabled:**
    *   **Installable:** Can be installed on supported desktop and mobile devices for an app-like experience.
    *   **Offline Access:** Works offline after the first visit, thanks to the Service Worker caching essential assets (HTML, CSS, JS, images, audio).

## Tech Stack

*   **HTML5:** Structure of the application.
*   **CSS3:** Styling.
    *   **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
*   **JavaScript (Vanilla JS):** Application logic, timer, settings management, PWA registration, audio playback.
*   **Font Awesome:** Icons.
*   **Service Worker API:** For PWA features (offline caching).

## Getting Started

To run this application locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    ```
2.  **Navigate to the directory:**
    ```bash
    cd your-repo-name
    ```
3.  **Serve the files:**
    Since the app uses a Service Worker, you need to serve the files using a local web server. You cannot simply open the `index.html` file directly via the `file:///` protocol.

    *   **Using Python (if installed):**
        ```bash
        # Python 3.x
        python -m http.server
        # Python 2.x
        python -m SimpleHTTPServer
        ```
        Then open your browser to `http://localhost:8000`.

    *   **Using VS Code Live Server:**
        If you use Visual Studio Code, you can install the "Live Server" extension, right-click on `index.html`, and choose "Open with Live Server".

4.  **Access the App:** Open your web browser and navigate to the local address provided by your server (e.g., `http://localhost:8000` or `http://127.0.0.1:5500`).

## Usage

*   **Navigation:** Use the tabs (Guide, Practice, Timing, Video) at the top to switch between sections.
*   **Pose Guide:** Scroll through the 12 poses to learn the sequence, instructions, and breathing.
*   **Timing:**
    *   Use the sliders to set the desired duration for each pose.
    *   Select the total number of rounds from the dropdown.
    *   Check/uncheck the boxes for Voice Guidance and Transition Sounds.
    *   Click "Save Settings". Your preferences will be stored locally.
*   **Guided Practice:**
    *   Click "Start" to begin the timed practice based on your saved settings.
    *   Use "Pause" to temporarily stop and "Start" again to resume.
    *   Use "Reset" to return to the beginning of Round 1, Pose 1.
    *   Follow the visual cues (current/next pose) and audio cues (if enabled).
*   **Video:** Watch the embedded video for a visual demonstration.

## PWA Features

*   On supported browsers (like Chrome, Edge on Desktop/Android), you may see an "Install" icon in the address bar or be prompted to add the app to your home screen.
*   Once installed, the app can be launched like a native application.
*   After your first visit with an internet connection, the app should load and function offline, using the cached assets.

## File Structure

├── assets/
│ ├── Surya-Namaskar-step-1.jpg # Pose images...
│ ├── ...
│ ├── Surya-Namaskar-step-9.jpg
│ ├── exhale.mp3 # Audio cues...
│ ├── hold.mp3
│ ├── inhale.mp3
│ └── soft_beep.mp3
├── index.html # Main application file
├── sw.js # Service Worker script
├── icon.png # App icon (for PWA/favicon)
└── README.md # This file

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/your-username/your-repo-name/issues) if you want to contribute.

## Future Enhancements (Ideas)

*   Integrate corresponding mantras for each pose.
*   Add different speed presets (e.g., Slow, Medium, Fast) that adjust all pose timings.
*   Include brief descriptions of pose benefits or modifications.
*   Smoother visual transitions or animations between poses in practice mode.
*   User accounts/progress tracking (more complex).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details (Optional: Add a LICENSE file if you wish).
