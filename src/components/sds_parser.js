document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('sdsForm');
    const fileInput = document.getElementById('sdsFile');
    
    if (!form) {
        console.warn('SDS Form not found in the document');
        return;
    }
    
    if (!fileInput) {
        console.warn('File input not found in the document');
        return;
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleSDSUpload();
    });
});

function handleSDSUpload() {
    const fileInput = document.getElementById('sdsFile');
    const file = fileInput.files[0];
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const extractedData = parseSDSContent(content);
        updateUIWithData(extractedData);
    };
    reader.readAsText(file);
}

function updateUIWithData(data) {
    // Update your form fields with the extracted data
    Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = data[key];
        }
    });
}

function parseSDSContent(content) {
    console.log('Parsing content:', content);
    // Your existing parsing logic here
    const extractedData = {};
    // Add your parsing rules
    console.log('Extracted data:', extractedData);
    return extractedData;
}