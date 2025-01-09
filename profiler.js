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

const TOXIC_CHARACTERISTICS = {
    'D001': ['ignitable', 'flash point', 'flammable aerosols', 'aerosol', 'spray can'],
    'D003': ['reactive', 'reactivity'],
    'D004': ['arsenic'],
    'D005': ['barium'],
    'D006': ['cadmium'],
    'D007': ['chromium'],
    'D008': ['lead'],
    'D009': ['mercury'],
    'D010': ['selenium'],
    'D011': ['silver']
};

const CFR_REFERENCES = {
    '262.30': 'Packaging Requirements',
    '262.31': 'Labeling Requirements',
    '262.32': 'Marking Requirements',
    '262.33': 'Placarding Requirements',
    '262.34': 'Accumulation Time'
};

function detectAerosols(sectionText) {
    const aerosolKeywords = [
        'aerosol',
        'spray can',
        'pressurized container',
        'flammable aerosol',
        'spray product'
    ];
    
    const isAerosol = aerosolKeywords.some(keyword => 
        sectionText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (isAerosol) {
        return {
            classification: 'D001 - Flammable Aerosol',
            handling: 'Must be managed as hazardous waste under 40 CFR 261.21'
        };
    }
    
    return null;
}

function extractHazardousCharacteristics(sectionText, sectionNumber) {
    const characteristics = {};
    
    if (sectionNumber === 9) {
        const phMatch = sectionText.match(/pH\s*:?\s*([\d.]+)/i);
        if (phMatch) {
            const phValue = parseFloat(phMatch[1]);
            characteristics.pH = phMatch[1];
            
            if (phValue <= 2 || phValue >= 12.5) {
                if (!characteristics.dList) characteristics.dList = [];
                characteristics.dList.push('D002 - Corrosive');
                characteristics.corrosivityNote = `pH ${phValue} meets D002 criteria`;
            }
        }
        
        const flashMatch = sectionText.match(/flash\s*point\s*:?\s*([-\d.]+)\s*[°℃℉]/i);
        if (flashMatch) characteristics.flashPoint = flashMatch[1];
    }
    
    if (sectionNumber === 10) {
        const reactivityMatch = sectionText.match(/reactivity\s*:?\s*([^.]+)/i);
        if (reactivityMatch) characteristics.reactivity = reactivityMatch[1].trim();
    }
    
    if (sectionNumber === 3) {
        for (const [code, keywords] of Object.entries(TOXIC_CHARACTERISTICS)) {
            if (keywords.some(keyword => sectionText.toLowerCase().includes(keyword.toLowerCase()))) {
                if (!characteristics.dList) characteristics.dList = [];
                characteristics.dList.push(code);
            }
        }
    }

    if (sectionNumber === 2 || sectionNumber === 3) {
        const aerosolInfo = detectAerosols(sectionText);
        if (aerosolInfo) {
            characteristics.aerosol = aerosolInfo;
        }
    }
    
    return characteristics;
}

function matchCFRReferences(textContent) {
    const matches = [];
    for (const [section, title] of Object.entries(CFR_REFERENCES)) {
        if (textContent.toLowerCase().includes(section.toLowerCase())) {
            matches.push({
                section: section,
                title: title,
                reference: `40 CFR ${section}`
            });
        }
    }
    return matches;
}

async function processPDF(file) {
    console.log("Initializing PDF.js...");
    const pdfjsLib = window['pdfjsLib'] || window['pdfjs-dist/build/pdf'];

    if (!pdfjsLib) {
        console.error("PDF.js is not loaded.");
        alert("PDF.js library is missing. Check your configuration.");
        return;
    }

    if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.216/pdf.worker.min.js';
    }

    try {
        const pdfData = await file.arrayBuffer();
        const pdfDocument = await pdfjsLib.getDocument(pdfData).promise;
        const sections = [1, 2, 3, 8, 9, 10, 11];
        const outputDiv = document.getElementById('section-output');
        outputDiv.innerHTML = '';

        const sectionLabels = {
            1: "Product Identification",
            2: "Hazard Identification",
            3: "Composition Information",
            8: "Exposure Controls",
            9: "Physical Properties",
            10: "Stability and Reactivity",
            11: "Toxicological Information"
        };

        let allTextItems = '';
        let hazardousProperties = {};

        for (const section of sections) {
            if (section > pdfDocument.numPages) {
                console.warn(`Section ${section} does not exist in the PDF.`);
                continue;
            }
            const page = await pdfDocument.getPage(section);
            const textContent = await page.getTextContent();
            const sectionText = textContent.items.map(item => item.str).join(' ');
            allTextItems += sectionText;

            const characteristics = extractHazardousCharacteristics(sectionText, section);
            hazardousProperties = { ...hazardousProperties, ...characteristics };

            const sectionDiv = document.createElement('div');
            sectionDiv.innerHTML = `
                <h4>Section ${section}: ${sectionLabels[section]}</h4>
                <p>${sectionText}</p>
            `;
            outputDiv.appendChild(sectionDiv);
        }

        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'hazard-summary';
        summaryDiv.innerHTML = `
            <h3>Hazardous Waste Characteristics Summary</h3>
            <ul>
                ${Object.entries(hazardousProperties).map(([key, value]) => {
                    if (key === 'aerosol') {
                        return `<li>
                            <strong>Aerosol Classification:</strong> ${value.classification}<br>
                            <strong>Regulatory Note:</strong> ${value.handling}
                        </li>`;
                    }
                    return `<li><strong>${key}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</li>`;
                }).join('')}
            </ul>
        `;
        outputDiv.appendChild(summaryDiv);

        const cfrDiv = document.createElement('div');
        cfrDiv.className = 'cfr-references';
        cfrDiv.innerHTML = '<h3>Title 40 CFR Part 262 Subpart C References</h3>';
        
        const cfrMatches = matchCFRReferences(allTextItems);
        if (cfrMatches.length > 0) {
            const matchList = document.createElement('ul');
            cfrMatches.forEach(match => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${match.reference}</strong>: ${match.title}`;
                matchList.appendChild(li);
            });
            cfrDiv.appendChild(matchList);
        } else {
            cfrDiv.innerHTML += '<p>No direct CFR references found in this section.</p>';
        }
        
        outputDiv.appendChild(cfrDiv);

    } catch (error) {
        console.error("Error processing PDF:", error);
        alert("Failed to process PDF. Check the console for details.");
    }
}

function addSearchFilter() {
    const outputDiv = document.getElementById('section-output');
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search within sections...';
    searchInput.className = 'section-search';
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const sections = outputDiv.getElementsByTagName('div');
        
        Array.from(sections).forEach(section => {
            const text = section.textContent.toLowerCase();
            section.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });
    
    outputDiv.parentNode.insertBefore(searchInput, outputDiv);
}

addSearchFilter();