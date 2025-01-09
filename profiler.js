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
    'D001': ['ignitable', 'flash point'],
    'D002': ['corrosive', 'ph', 'pH'],
    'D003': ['reactive', 'reactivity'],
    'D004': ['arsenic'],
    'D005': ['barium'],
    'D006': ['cadmium'],
    'D007': ['chromium'],
    'D008': ['lead'],
    'D009': ['mercury'],
    'D010': ['selenium'],
    'D011': ['silver'],
    'D012': ['endrin'],
    'D013': ['lindane'],
    'D014': ['methoxychlor'],
    'D015': ['toxaphene'],
    'D016': ['2,4-d'],
    'D017': ['2,4,5-tp (Silvex)'],
    'D018': ['benzene'],
    'D019': ['carbon tetrachloride'],
    'D020': ['chlordane'],
    'D021': ['chlorobenzene'],
    'D022': ['chloroform'],
    'D023': ['o-cresol'],
    // Add more D-list codes as needed
};

function extractHazardousCharacteristics(sectionText, sectionNumber) {
    const characteristics = {};
    
    if (sectionNumber === 9) {
        // Extract pH value
        const phMatch = sectionText.match(/pH\s*:?\s*([\d.]+)/i);
        if (phMatch) characteristics.pH = phMatch[1];
        
        // Extract flash point
        const flashMatch = sectionText.match(/flash\s*point\s*:?\s*([-\d.]+)\s*[°℃℉]/i);
        if (flashMatch) characteristics.flashPoint = flashMatch[1];
    }
    
    if (sectionNumber === 10) {
        // Extract reactivity information
        const reactivityMatch = sectionText.match(/reactivity\s*:?\s*([^.]+)/i);
        if (reactivityMatch) characteristics.reactivity = reactivityMatch[1].trim();
    }
    
    if (sectionNumber === 3) {
        // Scan for D-list characteristics
        for (const [code, keywords] of Object.entries(TOXIC_CHARACTERISTICS)) {
            if (keywords.some(keyword => sectionText.toLowerCase().includes(keyword.toLowerCase()))) {
                if (!characteristics.dList) characteristics.dList = [];
                characteristics.dList.push(code);
            }
        }
    }
    
    return characteristics;
}

async function processPDF(file) {
    console.log("Initializing PDF.js...");
    const pdfjsLib = window['pdfjsLib'] || window['pdfjs-dist/build/pdf'];

    if (!pdfjsLib) {
        console.error("PDF.js is not loaded. Ensure it is properly imported in the HTML.");
        alert("PDF.js library is missing. Check your configuration.");
        return;
    }

    if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.13.216/pdf.worker.min.js';
    }

    const CFR_REFERENCES = {
        '262.30': 'Packaging Requirements',
        '262.31': 'Labeling Requirements',
        '262.32': 'Marking Requirements',
        '262.33': 'Placarding Requirements',
        '262.34': 'Accumulation Time'
    };

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

    try {
        const pdfData = await file.arrayBuffer();
        console.log("PDF data loaded.");
        const pdfDocument = await pdfjsLib.getDocument(pdfData).promise;
        console.log("PDF document parsed.");

        const sections = [1, 2, 3, 8, 9, 11];
        const outputDiv = document.getElementById('section-output');
        outputDiv.innerHTML = '';

        const sectionLabels = {
            1: "Product Identification",
            2: "Hazard Identification",
            3: "Composition Information",
            8: "Exposure Controls",
            9: "Physical Properties",
            11: "Toxicological Information"
        };

        let allTextItems = '';  // Store all text content
        let hazardousProperties = {};

        for (const section of sections) {
            if (section > pdfDocument.numPages) {
                console.warn(`Section ${section} does not exist in the PDF.`);
                continue;
            }
            const page = await pdfDocument.getPage(section);
            console.log(`Extracting Section ${section}...`);
            const textContent = await page.getTextContent();
            const sectionText = textContent.items.map(item => item.str).join(' ');
            allTextItems += sectionText;  // Append section text to all text

            const sectionDiv = document.createElement('div');
            sectionDiv.innerHTML = `
                <h4>Section ${section}: ${sectionLabels[section]}</h4>
                <p>${sectionText}</p>
            `;

            const characteristics = extractHazardousCharacteristics(sectionText, section);
            hazardousProperties = { ...hazardousProperties, ...characteristics };

            // Add characteristics to the section display if found
            if (Object.keys(characteristics).length > 0) {
                sectionDiv.innerHTML += `
                    <div class="hazard-characteristics">
                        ${characteristics.pH ? `<p>pH: ${characteristics.pH}</p>` : ''}
                        ${characteristics.flashPoint ? `<p>Flash Point: ${characteristics.flashPoint}°</p>` : ''}
                        ${characteristics.reactivity ? `<p>Reactivity: ${characteristics.reactivity}</p>` : ''}
                        ${characteristics.dList ? `<p>D-List Codes: ${characteristics.dList.join(', ')}</p>` : ''}
                    </div>
                `;
            }

            outputDiv.appendChild(sectionDiv);
        }

        // CFR reference analysis using allTextItems
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

        // Add a summary section
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'hazard-summary';
        summaryDiv.innerHTML = `
            <h3>Hazardous Waste Characteristics Summary</h3>
            <ul>
                ${Object.entries(hazardousProperties).map(([key, value]) => 
                    `<li><strong>${key}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</li>`
                ).join('')}
            </ul>
        `;
        outputDiv.appendChild(summaryDiv);

        console.log("PDF processing complete.");
    } catch (error) {
        console.error("Error processing PDF:", error);
        alert("Failed to process PDF. Check the console for details.");
    }
}

// Add this function to filter content
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

// Call this after processing the PDF
addSearchFilter();

// Add this function to provide CFR guidance
function showCFRGuidance(section) {
    const guidanceContent = {
        '262.30': `
            <h4>Packaging Guidance</h4>
            <ul>
                <li>Must meet DOT requirements under 49 CFR parts 173, 178, and 179</li>
                <li>Packaging must be compatible with the waste</li>
                <li>Containers must be in good condition</li>
            </ul>
        `,
        '262.31': `
            <h4>Labeling Guidance</h4>
            <ul>
                <li>Each package must be labeled according to DOT requirements</li>
                <li>Labels must be durable and weather-resistant</li>
                <li>Must include proper shipping name and ID number</li>
            </ul>
        `
        // Add more sections as needed
    };
    
    return guidanceContent[section] || '<p>Detailed guidance not available for this section.</p>';
}
