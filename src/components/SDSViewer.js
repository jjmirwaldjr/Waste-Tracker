document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('sdsForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSDSUpload();
        });
    }
});

const SDSViewer = () => {
    const [sdsData, setSdsData] = useState(null);
    
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('http://localhost:5000/upload-sds', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            if (data.success) {
                setSdsData(data.formatted_data);
            }
        } catch (error) {
            console.error('Error uploading SDS:', error);
        }
    };
};

export default SDSViewer;

import React, { useState } from 'react';
