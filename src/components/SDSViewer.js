const SDSViewer = () => {
    const [sdsData, setSdsData] = useState(null);
    
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('/upload-sds', {
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
    
    return (
        <div className="sds-viewer">
            <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileUpload}
            />
            {sdsData && (
                <div className="sds-content">
                    <pre>{sdsData}</pre>
                </div>
            )}
        </div>
    );
};
document.getElementById('sdsFile').addEventListener('change', async (event) => {
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
            document.getElementById('result').textContent = data.formatted_data;
        } else {
            document.getElementById('result').textContent = 'Error: ' + data.error;
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').textContent = 'Error: ' + error.message;
    }
});


export default SDSViewer;
