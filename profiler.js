document.addEventListener('DOMContentLoaded', function () {
    const profilerTab = document.getElementById('profiler-tab');
    const profilerTracker = document.getElementById('profiler-tracker');

    profilerTab.addEventListener('click', function () {
        console.log("Switching to Product Profiler Tool tab.");
        activateTab(profilerTab, profilerTracker);
    });

    document.getElementById('pdf-upload-form').addEventListener('submit', function (event) {
        event.preventDefault();
        console.log("PDF Upload form submitted.");

        const fileInput = document.getElementById('pdf-upload');
        if (fileInput.files.length === 0) {
            alert('Please upload a PDF file.');
            console.error("No file uploaded.");
            return;
        }

        const file = fileInput.files[0];
        if (file.type !== 'application/pdf') {
            alert('Invalid file type. Please upload a PDF.');
            console.error("Invalid file type:", file.type);
            return;
        }

        console.log("Valid PDF file detected. Starting processing...");
        processPDF(file);
    });
});

async function processPDF(file) {
    console.log("Initializing PDF.js...");
    const pdfjsLib = window['pdfjsLib'] || window['pdfjs-dist/build/pdf']; // Support for different PDF.js setups

    if (!pdfjsLib) {
        console.error("PDF.js is not loaded. Ensure it is properly imported in the HTML.");
        alert("PDF.js library is missing. Check your configuration.");
        return;
    }

    if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.216/pdf.worker.min.js';
    } else {
        console.warn("GlobalWorkerOptions not found. Using default worker configuration.");
    }

    try {
        const pdfData = await file.arrayBuffer();
        console.log("PDF data loaded.");
        const pdfDocument = await pdfjsLib.getDocument(pdfData).promise;
        console.log("PDF document parsed.");

        const sections = [1, 2, 3, 9, 10, 13, 14];
        const outputDiv = document.getElementById('section-output');
        outputDiv.innerHTML = ''; // Clear previous output

        for (const section of sections) {
            if (section > pdfDocument.numPages) {
                console.warn(`Section ${section} does not exist in the PDF.`);
                continue;
            }
            const page = await pdfDocument.getPage(section);
            console.log(`Extracting Section ${section}...`);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map(item => item.str).join(' ');

            const sectionDiv = document.createElement('div');
            sectionDiv.innerHTML = `<h4>Section ${section}</h4><p>${textItems}</p>`;
            outputDiv.appendChild(sectionDiv);
        }

        console.log("PDF processing complete.");
    } catch (error) {
        console.error("Error processing PDF:", error);
        alert("Failed to process PDF. Check the console for details.");
    }
}
