from flask import Blueprint, request, jsonify
from .sds_parser import SDSParser
import os

profiler = Blueprint('profiler', __name__)

@profiler.route('/upload-sds', methods=['POST'])
def upload_sds():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    if file and file.filename.endswith('.pdf'):
        # Save uploaded file temporarily
        temp_path = os.path.join('temp', file.filename)
        file.save(temp_path)
        
        # Parse SDS
        parser = SDSParser(temp_path)
        extracted_data = parser.extract_sections()
        formatted_output = parser.format_output(extracted_data)
        
        # Clean up temporary file
        os.remove(temp_path)
        
        return jsonify({
            'success': True,
            'formatted_data': formatted_output,
            'raw_data': extracted_data
        })
    
    return jsonify({'error': 'Invalid file format'}), 400
