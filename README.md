AgriCare AI: Crop Disease Detection
An AI-powered web app to identify plant diseases from leaf images and generate advisory reports.

Tech Stack
Backend: Python, Flask, TensorFlow

Frontend: HTML, Tailwind CSS, JavaScript

AI: Google Gemini API

🚀 Quick Start Guide
1. Prerequisites:

Python 3.11 must be installed.

The trained model crop_disease_model.h5 must be in the backend/models/ folder.

2. Setup Backend:

# Go to the backend folder
cd backend

# Create and activate a virtual environment
python3.11 -m venv venv
# On Windows: .\venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

3. Add API Key:

Open backend/app.py.

Paste your Google Gemini API key into the YOUR_GEMINI_API_KEY variable.

4. Run the Application:

# Start the backend server (from the backend folder)
python app.py

Open the frontend/index.html file in your web browser.
