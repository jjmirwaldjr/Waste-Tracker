from flask import Flask, request, jsonify, render_template
from sds_parser import SDSParser
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Ensure temp directory exists
if not os.path.exists('temp'):
    os.makedirs('temp')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload-sds', methods=['POST'])
def upload_sds():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    if file and file.filename.endswith('.pdf'):
        temp_path = os.path.join('temp', file.filename)
        file.save(temp_path)
        
        parser = SDSParser(temp_path)
        extracted_data = parser.extract_sections()
        formatted_output = parser.format_output(extracted_data)
        
        os.remove(temp_path)
        
        return jsonify({
            'success': True,
            'formatted_data': formatted_output,
            'raw_data': extracted_data
        })
    
    return jsonify({'error': 'Invalid file format'}), 400

if __name__ == '__main__':
    app.run(debug=True)
