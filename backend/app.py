
# ==============================================================================
# AgriCare AI - Phase 2: Backend Server V2 (app.py)
#
# This version has two endpoints:
# 1. /analyze_image: Takes an image, returns a JSON report.
# 2. /generate_pdf: Takes JSON report text, returns a PDF file.
# ==============================================================================

import os
import io
import numpy as np
from PIL import Image
import tensorflow as tf
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import google.generativeai as genai
from fpdf import FPDF
from fpdf.enums import XPos, YPos

# --- CONFIGURATION ---

# IMPORTANT: Configure your Gemini API Key here
YOUR_GEMINI_API_KEY = "KHUD KI API KEY GEMINI K THROUGH BNA KE USE KRLO"

# IMPORTANT: Configure your Class Names here
CLASS_NAMES = {
    'Pepper__bell___Bacterial_spot': 0, 'Pepper__bell___healthy': 1, 
    'Potato___Early_blight': 2, 'Potato___Late_blight': 3, 'Potato___healthy': 4, 
    'Tomato_Bacterial_spot': 5, 'Tomato_Early_blight': 6, 'Tomato_Late_blight': 7, 
    'Tomato_Leaf_Mold': 8, 'Tomato_Septoria_leaf_spot': 9, 
    'Tomato_Spider_mites_Two_spotted_spider_mite': 10, 'Tomato__Target_Spot': 11, 
    'Tomato__Tomato_YellowLeaf__Curl_Virus': 12, 'Tomato__Tomato_mosaic_virus': 13, 
    'Tomato_healthy': 14
}


# --- INITIALIZATION ---
app = Flask(__name__)
CORS(app)

try:
    genai.configure(api_key=YOUR_GEMINI_API_KEY)
    llm = genai.GenerativeModel('gemini-1.5-flash-latest')
    print("Gemini API configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    llm = None

model_path = os.path.join('models', 'crop_disease_model.h5')
try:
    model = tf.keras.models.load_model(model_path, compile=False)
    print(f"Model loaded successfully from {model_path}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

if isinstance(CLASS_NAMES, dict):
    class_indices_to_names = {v: k for k, v in CLASS_NAMES.items()}
else:
    print("CLASS_NAMES is not a valid dictionary.")
    class_indices_to_names = {}


# --- HELPER FUNCTIONS ---

def preprocess_image(image_file):
    img = Image.open(image_file.stream).convert('RGB')
    img = img.resize((224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def generate_advisory_report(disease_name):
    if not llm:
        return "Error: Gemini API is not configured."

    clean_disease_name = disease_name.replace('___', ' ').replace('__', ' ').replace('_', ' ')

    # [FIX] Made the prompt stricter to ensure clean output.
    prompt = f"""
    You are an expert agricultural scientist. Your task is to generate a detailed advisory report for a farmer in Jaipur, Rajasthan, India, about the crop disease: "{clean_disease_name}".

    IMPORTANT INSTRUCTIONS:
    - Do NOT include any preamble, introduction, or letter formatting like "To:", "From:", "Date:", or "Subject:".
    - The response MUST start directly with the first section heading.
    - Use markdown for formatting: Use **Section Title** for headings. Use * for bullet points.

    Generate the report with these exact sections:

    **Disease Overview:** What is {clean_disease_name}? Explain it simply.
    **Immediate Impact & Symptoms:** How does this disease harm the plant right now? What are the visible signs?
    **Disease Timeline & Spread:** How fast does it progress? Can it spread to other plants?
    **Economic Impact (per Acre):** Estimate the potential yield loss in percentage and approximate financial loss per acre for a typical crop in Rajasthan if left untreated. Mention the cost to cure per acre.
    **Organic & Biological Cures:** List 3-4 practical, non-chemical treatment methods suitable for the region.
    **Chemical Cures:** List specific, commonly available fungicides or pesticides, including application instructions.
    **Prevention Plan:** A checklist of 5-6 steps the farmer can take to prevent this in the future.
    **Related Diseases:** What other diseases might occur alongside or be mistaken for this one?
    """
    try:
        response = llm.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating content with Gemini: {e}")
        return f"Error generating report: {e}"

def clean_text_for_pdf(text):
    """Clean text to remove characters that might cause PDF generation issues"""
    # Replace problematic characters with ASCII equivalents
    replacements = {
        '"': '"',
        '"': '"',
        ''': "'",
        ''': "'",
        '–': '-',
        '—': '-',
        '…': '...',
        '•': '-',  # Replace bullet with dash
        '°': ' degrees',
        '™': '(TM)',
        '®': '(R)',
        '©': '(C)'
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Remove any remaining non-ASCII characters
    text = ''.join(char if ord(char) < 128 else '?' for char in text)
    
    return text

class PDF(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 12)
        self.cell(0, 10, 'AgriCare AI - Crop Health Report', new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

def create_pdf_report(report_text, disease_name):
    pdf = PDF()
    pdf.add_page()
    
    # Clean the disease name and report text
    clean_disease_name = disease_name.replace('___', ' ').replace('_', ' ')
    clean_disease_name = clean_text_for_pdf(clean_disease_name)
    report_text = clean_text_for_pdf(report_text)
    
    # Title
    pdf.set_font('Helvetica', 'B', 16)
    pdf.cell(0, 10, f"Identified Disease: {clean_disease_name}", new_x=XPos.LMARGIN, new_y=YPos.NEXT, align='C')
    pdf.ln(10)

    # Process report content
    for line in report_text.split('\n'):
        line = line.strip()
        if not line:
            continue  # Skip empty lines

        try:
            if line.startswith('**') and line.endswith('**'):
                # Section heading
                pdf.set_font('Helvetica', 'B', 12)
                pdf.ln(5)
                heading_text = line.strip('* ')
                pdf.multi_cell(0, 5, heading_text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
                pdf.ln(2)
            elif line.startswith('* '):
                # Bullet point - use dash instead of bullet character
                pdf.set_font('Helvetica', '', 11)
                bullet_text = f"  - {line.strip('* ')}"
                pdf.multi_cell(0, 5, bullet_text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            else:
                # Regular text
                pdf.set_font('Helvetica', '', 11)
                pdf.multi_cell(0, 5, line, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        except Exception as e:
            print(f"Error processing line: {line[:50]}... - {e}")
            continue
    
    return pdf.output()


# --- API ENDPOINTS ---

@app.route('/analyze_image', methods=['POST'])
def analyze_image():
    if model is None or not class_indices_to_names:
        return jsonify({"error": "Server is not configured properly."}), 500
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        processed_image = preprocess_image(file)
        prediction = model.predict(processed_image)
        predicted_class_index = np.argmax(prediction, axis=1)[0]
        disease_name = class_indices_to_names.get(predicted_class_index, "Unknown Disease")
        report_text = generate_advisory_report(disease_name)
        
        return jsonify({
            "disease_name": disease_name,
            "report_text": report_text
        })

    except Exception as e:
        print(f"An error occurred during analysis: {e}")
        return jsonify({"error": f"An internal server error occurred: {e}"}), 500

@app.route('/generate_pdf', methods=['POST'])
def generate_pdf():
    data = request.get_json()
    if not data or 'report_text' not in data or 'disease_name' not in data:
        return jsonify({"error": "Missing report data"}), 400
        
    try:
        report_text = data['report_text']
        disease_name = data['disease_name']
        pdf_bytes = create_pdf_report(report_text, disease_name)
        
        # Clean filename for download
        clean_filename = clean_text_for_pdf(disease_name.replace(' ', '_'))
        
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'AgriCare_Report_{clean_filename}.pdf'
        )
    except Exception as e:
        print(f"An error occurred during PDF generation: {e}")
        return jsonify({"error": f"An internal server error occurred during PDF generation: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy", "message": "AgriCare AI Backend is running"})

# --- MAIN EXECUTION ---

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
