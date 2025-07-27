
# 🌾 AgriCare AI: Crop Disease Detection & Advisory System

**AgriCare AI** is a web-based application designed to help farmers in India identify crop diseases quickly and accurately. By uploading an image of a plant leaf, users receive an instant diagnosis powered by a deep learning model, along with a detailed advisory report generated using a large language model (LLM).

> 🚀 Developed as a final year B.Tech project to demonstrate the practical application of AI in solving real-world agricultural challenges.

---

## ✨ Features

- **🧠 AI-Powered Disease Detection**  
  Utilizes a Convolutional Neural Network (CNN) trained on the PlantVillage dataset to identify 15 different types of plant diseases.

- **📋 Instant Advisory Reports**  
  Generates comprehensive reports using the **Google Gemini API**, covering:
  - Disease impact  
  - Organic and chemical treatments  
  - Prevention strategies  

- **📱 Simple User Interface**  
  Clean, mobile-friendly web interface for quick and easy uploads.

- **🚫 No Signup Required**  
  Use the application instantly—no account needed.

- **📄 Downloadable PDF Reports**  
  Save AI-generated reports as PDFs for offline use.

---

## 🛠️ Tech Stack

- **Backend:** Python, Flask  
- **Machine Learning:** TensorFlow, Keras  
- **Generative AI:** Google Gemini API  
- **Frontend:** HTML, Tailwind CSS, JavaScript  
- **PDF Generation:** FPDF2  

---

## 📂 Project Structure

```
/crop-disease-project/
│
├── 📂 backend/
│   ├── 📂 models/
│   │   └── crop_disease_model.h5         # Trained CNN model
│   ├── app.py                            # Flask server
│   └── requirements.txt                  # Python dependencies
│
├── 📂 frontend/
│   └── index.html                        # Web interface
│
└── README.md                             # Project documentation
```

---

## 🚀 Setup and Installation

Follow these steps to run the project on your local machine.

### ✅ Prerequisites

- Python **3.11**
- `crop_disease_model.h5` (place this in `backend/models/`)
- Google Gemini API Key

---

### 🔧 1. Clone the Repository

```bash
git clone https:https://github.com/KushuCon/crop-disease-project.git
cd crop-disease-project
```

---

### ⚙️ 2. Set Up the Backend

```bash
cd backend

# Create a virtual environment with Python 3.11
python3.11 -m venv venv

# Activate the virtual environment
# Windows:
.env\Scriptsctivate

# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

### 🔐 3. Configure Gemini API Key

- Go to **[Google AI Studio](https://makersuite.google.com/)** and get your free API key.
- Open `backend/app.py` in your code editor.
- Find the line:
  ```python
  YOUR_GEMINI_API_KEY = "PASTE_YOUR_KEY_HERE"
  ```
  Replace `"PASTE_YOUR_KEY_HERE"` with your actual Gemini API key.

---

## ▶️ Running the Application

### 1. Start the Backend Server

```bash
# From backend directory with venv activated:
python app.py
```

The Flask server will start at:  
`http://127.0.0.1:5000`

---

### 2. Launch the Frontend

- Go to the `frontend` folder.
- Open `index.html` in your web browser (Chrome, Firefox, Edge, etc.).

---

## 📖 How to Use

1. Upload a plant leaf image using the upload box.
2. Click **"Analyze with AI"**.
3. Wait for the AI to analyze and generate the report.
4. View the diagnosis and treatment advisory directly on the page.
5. Click **"Download PDF Report"** to save a copy.

---

## 📌 Notes

- Ensure that your system has Python 3.11 installed.  
- The model file `crop_disease_model.h5` must be present at `backend/models/`.

---

## 📬 Contact

For any issues or feedback, feel free to open an issue or contact the developers.

---

**Made with ❤️ for farmers of India**
