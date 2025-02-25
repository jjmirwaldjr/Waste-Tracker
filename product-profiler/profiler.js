

// Constants organized by category
const WASTE_CHARACTERISTICS = {
    D001: {
      keywords: ['ignitable', 'flash point', 'flammable aerosols', 'aerosol', 'spray can'],
      criteria: {
        conditions: [
          'flash point less than 60°C (140°F)',
          'capable of causing fire through friction',
          'ignitable compressed gas',
          'oxidizer'
        ],
        flashPointThreshold: 60 // in Celsius
      },
      oxidizers: [
        'oxidizer', 'oxidizing', 'oxidant', 'oxygen-rich', 'supports combustion',
        'yields oxygen', 'chlorate', 'permanganate', 'peroxide'
      ]
    },
    D002: {
      metalCorrosion: {
        keywords: [
          'corrodes steel', 'corrodes metal', 'metal corrosion',
          'dissolves metal', 'steel corrosion rate', 'corrodes at a rate'
        ],
        threshold: '6.35 mm per year'
      },
      pHThresholds: { min: 2, max: 12.5 }
    },
    D003: {
      criteria: [
        'normally unstable and readily undergoes violent change without detonating',
        'reacts violently with water',
        'forms potentially explosive mixtures with water',
        'generates toxic gases when mixed with water',
        'cyanide or sulfide bearing waste',
        'capable of detonation if subjected to strong initiating source',
        'capable of detonation at standard temperature and pressure'
      ]
    },
    TOXICITY: {
      'D004': { chemical: 'Arsenic', limit: 5.0 },
      'D005': { chemical: 'Barium', limit: 100.0 },
      'D006': { chemical: 'Cadmium', limit: 1.0 },
      'D007': { chemical: 'Chromium', limit: 5.0 },
      'D008': { chemical: 'Lead', limit: 5.0 },
      'D009': { chemical: 'Mercury', limit: 0.2 },
      'D010': { chemical: 'Selenium', limit: 1.0 },
      'D011': { chemical: 'Silver', limit: 5.0 },
      'D018': { chemical: 'Benzene', limit: 0.5 },
      'D019': { chemical: 'Carbon tetrachloride', limit: 0.5 },
      'D021': { chemical: 'Chlorobenzene', limit: 100.0 },
      'D022': { chemical: 'Chloroform', limit: 6.0 },
      'D035': { chemical: 'Methyl ethyl ketone', limit: 200.0 },
      'D039': { chemical: 'Tetrachloroethylene', limit: 0.7 },
      'D040': { chemical: 'Trichloroethylene', limit: 0.5 }
    }
  };
  
  const CFR_REFERENCES = {
    '262.30': 'Packaging Requirements',
    '262.31': 'Labeling Requirements',
    '262.32': 'Marking Requirements',
    '262.33': 'Placarding Requirements',
    '262.34': 'Accumulation Time'
  };
  
  const STATES_OF_MATTER = {
    SOLID: ['solid', 'powder', 'crystalline', 'granular', 'pellet'],
    LIQUID: ['liquid', 'fluid', 'solution', 'viscous'],
    GAS: ['gas', 'vapor', 'gaseous'],
    AEROSOL: ['aerosol', 'spray', 'mist']
  };
  
  const SPECIAL_MATERIALS = {
    HYPOCHLOR: {
      keywords: [
        'sodium hypochlorite', 'naocl', 'bleach', 
        'hypochlorite solution', 'liquid chlorine'
      ],
      classification: 'HypoChlor',
      handling: 'Must be managed as oxidizer and corrosive material'
    },
    AEROSOL: {
      keywords: [
        'aerosol', 'spray can', 'pressurized container',
        'flammable aerosol', 'spray product'
      ],
      classification: 'D001 - Flammable Aerosol',
      handling: 'Must be managed as hazardous waste under 40 CFR 261.21'
    }
  };
  
  const SECTION_LABELS = {
    1: "Product Identification",
    2: "Hazard Identification",
    3: "Composition Information",
    8: "Exposure Controls",
    9: "Physical Properties",
    10: "Stability and Reactivity",
    11: "Toxicological Information"
  };
  
  const UN_NUMBER_INFO = {
    pattern: /\bUN\s*(?:No\.|Number|#)?\s*(\d{4})\b/gi,
    commonNumbers: {
      '1170': 'Ethanol',
      '1202': 'Diesel fuel',
      '1203': 'Gasoline',
      '1263': 'Paint',
      '1760': 'Corrosive liquid',
      '1789': 'Hydrochloric acid',
      '1791': 'Hypochlorite solution',
      '1814': 'Potassium hydroxide solution',
      '1830': 'Sulfuric acid',
      '1993': 'Flammable liquid, n.o.s.',
      '3077': 'Environmentally hazardous substance, solid',
      '3082': 'Environmentally hazardous substance, liquid',
      '3264': 'Corrosive liquid, acidic, inorganic',
      '3265': 'Corrosive liquid, acidic, organic'
    }
  };
  
  // DOM initialization
  document.addEventListener('DOMContentLoaded', function() {
    // Check if section-output exists, create it if it doesn't
    if (!document.getElementById('section-output')) {
      console.log("Creating missing section-output element");
      const container = document.querySelector('#profiler-tracker') || document.body;
      const outputDiv = document.createElement('div');
      outputDiv.id = 'section-output';
      container.appendChild(outputDiv);
    }
    
    initializeTabNavigation();
    initializePdfUpload();
    addSearchFilter();
  });
  
  function initializeTabNavigation() {
    const profilerTab = document.getElementById('profiler-tab');
    if (profilerTab) {
      const profilerTracker = document.getElementById('profiler-tracker');
      profilerTab.addEventListener('click', function() {
        console.log("Switching to Product Profiler Tool tab.");
        if (typeof activateTab === 'function') {
          activateTab(profilerTab, profilerTracker);
        } else {
          console.warn("activateTab function not found");
        }
      });
    }
  }
  
  function initializePdfUpload() {
    // Remove any existing event listeners by cloning the form
    const form = document.getElementById('pdf-upload-form');
    if (!form) return;
    
    const clonedForm = form.cloneNode(true);
    form.parentNode.replaceChild(clonedForm, form);
    
    // Add the event listener to the clean form
    clonedForm.addEventListener('submit', function(event) {
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
  }
  
  // Material detection helpers
  function detectMaterial(text, materialType) {
    const keywords = SPECIAL_MATERIALS[materialType].keywords;
    return keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase())) ?
      SPECIAL_MATERIALS[materialType] : null;
  }
  
  function detectStateOfMatter(text) {
    for (const [state, keywords] of Object.entries(STATES_OF_MATTER)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return state;
      }
    }
    return 'UNKNOWN';
  }
  
  function detectUNNumbers(text) {
    const unNumbers = [];
    let match;
    
    // Reset the regex to start from the beginning
    UN_NUMBER_INFO.pattern.lastIndex = 0;
    
    while ((match = UN_NUMBER_INFO.pattern.exec(text)) !== null) {
      const unNumber = match[1];
      const description = UN_NUMBER_INFO.commonNumbers[unNumber] || 'Unknown material';
      
      unNumbers.push({
        number: unNumber,
        description: description
      });
    }
    
    return unNumbers.length > 0 ? unNumbers : null;
  }
  
  // Hazard checks
  function checkIgnitability(text, flashPoint) {
    const isIgnitable = WASTE_CHARACTERISTICS.D001.criteria.conditions.some(condition => 
      text.toLowerCase().includes(condition.toLowerCase())
    );
  
    if (flashPoint && flashPoint <= WASTE_CHARACTERISTICS.D001.criteria.flashPointThreshold) {
      return true;
    }
  
    return isIgnitable;
  }
  
  function checkOxidizers(text) {
    return WASTE_CHARACTERISTICS.D001.oxidizers.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  
  function checkMetalCorrosivity(text) {
    return WASTE_CHARACTERISTICS.D002.metalCorrosion.keywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  
  function checkToxicity(text) {
    const toxicityResults = [];
    
    for (const [code, info] of Object.entries(WASTE_CHARACTERISTICS.TOXICITY)) {
      const regex = new RegExp(`${info.chemical}[:\\s]*(\\d+(?:\\.\\d+)?)[\\s]*(?:mg|ppm|mg\\/[lL])`, 'i');
      const match = text.match(regex);
      
      if (match) {
        const concentration = parseFloat(match[1]);
        if (concentration >= info.limit) {
          toxicityResults.push({
            code: code,
            chemical: info.chemical,
            concentration: concentration,
            limit: info.limit
          });
        }
      }
    }
    
    return toxicityResults;
  }
  
  // Main section analysis
  function extractHazardousCharacteristics(sectionText, sectionNumber) {
    const characteristics = {};
    let isDListed = false;
  
    // Look for UN numbers in any section
    const unNumbers = detectUNNumbers(sectionText);
    if (unNumbers) {
      characteristics.unNumbers = unNumbers;
    }
  
    // Check sections 2 and 3 for hazard classifications
    if (sectionNumber === 2 || sectionNumber === 3) {
      // Check for oxidizers (D001)
      if (checkOxidizers(sectionText)) {
        if (!characteristics.dList) characteristics.dList = [];
        characteristics.dList.push('D001 - Oxidizer');
        isDListed = true;
      }
   // Check for metal corrosivity (D002)
   if (checkMetalCorrosivity(sectionText)) {
    if (!characteristics.dList) characteristics.dList = [];
    characteristics.dList.push('D002 - Corrosive to Metal');
    isDListed = true;
  }
  
  // Check for aerosols
  const aerosolInfo = detectMaterial(sectionText, 'AEROSOL');
  if (aerosolInfo) {
    characteristics.aerosol = aerosolInfo;
    isDListed = true;
  }

  // Check for hypochlorite
  const hypochloriteInfo = detectMaterial(sectionText, 'HYPOCHLOR');
  if (hypochloriteInfo) {
    characteristics.hypochlorite = hypochloriteInfo;
    if (!characteristics.dList) characteristics.dList = [];
    characteristics.dList.push('D001 - Oxidizer');
    characteristics.dList.push('D002 - Corrosive');
    isDListed = true;
  }

  // Add explicit NON-RCRA classification if no D-List characteristics found
  if (!isDListed) {
    characteristics.classification = 'NON-RCRA';
  }
}

// Process physical properties (Section 9)
if (sectionNumber === 9) {
  // State of matter
  const stateOfMatter = detectStateOfMatter(sectionText);
  if (stateOfMatter) {
    characteristics.physicalState = stateOfMatter;
  }

  // Check pH for corrosivity
  const phMatch = sectionText.match(/pH\s*:?\s*([\d.]+)/i);
  if (phMatch) {
    const phValue = parseFloat(phMatch[1]);
    characteristics.pH = phMatch[1];
    
    if (phValue <= WASTE_CHARACTERISTICS.D002.pHThresholds.min || 
        phValue >= WASTE_CHARACTERISTICS.D002.pHThresholds.max) {
      if (!characteristics.dList) characteristics.dList = [];
      characteristics.dList.push('D002 - Corrosive');
      isDListed = true;
      characteristics.corrosivityNote = `pH ${phValue} meets D002 criteria`;
    }
  }
  
  // Check flash point for ignitability
  const flashMatch = sectionText.match(/flash\s*point\s*:?\s*([-\d.]+)\s*[°℃℉]/i);
  if (flashMatch) {
    characteristics.flashPoint = flashMatch[1];
    if (checkIgnitability(sectionText, parseFloat(flashMatch[1]))) {
      if (!characteristics.dList) characteristics.dList = [];
      characteristics.dList.push('D001 - Ignitable');
      isDListed = true;
    }
  }
}

// Check reactivity (Section 10)
if (sectionNumber === 10) {
  const isReactive = WASTE_CHARACTERISTICS.D003.criteria.some(condition => 
    sectionText.toLowerCase().includes(condition.toLowerCase())
  );
  
  if (isReactive) {
    if (!characteristics.dList) characteristics.dList = [];
    characteristics.dList.push('D003 - Reactive');
    isDListed = true;
  }
}

if (!isDListed && characteristics.dList?.length === 0) {
  characteristics.classification = 'NON-RCRA';
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

// PDF processing
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
  const outputDiv = document.getElementById('section-output');
  if (!outputDiv) {
    console.error("Element 'section-output' not found in the DOM");
    alert("Error: Output container not found. Please refresh the page.");
    return;
  }
  
  outputDiv.innerHTML = '';

  // Show loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.innerHTML = '<p>Analyzing document, please wait...</p>';
  loadingDiv.className = 'loading-indicator';
  outputDiv.appendChild(loadingDiv);

  const pdfData = await file.arrayBuffer();
  const pdfDocument = await pdfjsLib.getDocument(pdfData).promise;
  const allSections = [1, 2, 3, 8, 9, 10, 11];
  
  // Filter sections to only include those that exist in the PDF
  const sectionsToAnalyze = allSections.filter(
    section => section <= pdfDocument.numPages
  );
  
  if (sectionsToAnalyze.length < 3) {
    alert("Warning: This PDF doesn't appear to be a standard Safety Data Sheet (SDS). Analysis may be incomplete.");
  }

  let allTextItems = '';
  let hazardousProperties = {};

  // Process all PDF pages without displaying raw content
  for (const section of sectionsToAnalyze) {
    const page = await pdfDocument.getPage(section);
    const textContent = await page.getTextContent();
    const sectionText = textContent.items.map(item => item.str).join(' ');
    allTextItems += sectionText;

    // Still analyze the content, just don't display it
    const characteristics = extractHazardousCharacteristics(sectionText, section);
    hazardousProperties = { ...hazardousProperties, ...characteristics };
  }

  // Remove loading indicator
  outputDiv.innerHTML = '';
  
  // Create a product info div with file name
  const productInfoDiv = document.createElement('div');
  productInfoDiv.className = 'product-info';
  productInfoDiv.innerHTML = `
    <h3>Product Analysis Results</h3>
    <p><strong>Document:</strong> ${file.name}</p>
  `;
  outputDiv.appendChild(productInfoDiv);

  // Add notes if important sections are missing
  if (!sectionsToAnalyze.includes(9)) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'warning-note';
    noteDiv.innerHTML = '<p>⚠️ Section 9 (Physical Properties) is missing. Flash point and pH analysis unavailable.</p>';
    outputDiv.appendChild(noteDiv);
  }
  
  if (!sectionsToAnalyze.includes(10)) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'warning-note';
    noteDiv.innerHTML = '<p>⚠️ Section 10 (Stability and Reactivity) is missing. Reactivity analysis unavailable.</p>';
    outputDiv.appendChild(noteDiv);
  }

  // Add hazardous properties summary
  appendHazardSummary(outputDiv, hazardousProperties);
  
  // Add CFR references
  appendCFRReferences(outputDiv, allTextItems);

} catch (error) {
  console.error("Error processing PDF:", error);
  alert("Failed to process PDF. Check the console for details.");
}
}

// UI Helper functions
function appendHazardSummary(outputDiv, hazardousProperties) {
const summaryDiv = document.createElement('div');
summaryDiv.className = 'hazard-summary';

// Start building the HTML content
let summaryHTML = `<h3>Hazardous Waste Characteristics Summary</h3>`;

// Add UN Numbers section if found
if (hazardousProperties.unNumbers && hazardousProperties.unNumbers.length > 0) {
  summaryHTML += `
    <div class="un-numbers-section">
      <h4>UN Numbers Detected</h4>
      <ul>
        ${hazardousProperties.unNumbers.map(un => 
          `<li><strong>UN ${un.number}</strong>: ${un.description}</li>`
        ).join('')}
      </ul>
      <p><em>Note: UN numbers indicate hazardous materials classifications for transport.</em></p>
    </div>
  `;
}

// Add the rest of the characteristics
summaryHTML += `<ul>
  ${Object.entries(hazardousProperties).map(([key, value]) => {
    // Skip unNumbers as we've already displayed them in their own section
    if (key === 'unNumbers') return '';
    
    if (key === 'aerosol') {
      return `<li>
        <strong>Aerosol Classification:</strong> ${value.classification}<br>
        <strong>Regulatory Note:</strong> ${value.handling}
      </li>`;
    }
    if (key === 'hypochlorite') {
      return `<li>
        <strong>HypoChlor Classification:</strong> ${value.classification}<br>
        <strong>Regulatory Note:</strong> ${value.handling}
      </li>`;
    }
    if (key === 'dList' && Array.isArray(value)) {
      return `<li><strong>${key}:</strong> ${value.join(', ')}</li>`;
    }
    
    // Handle objects, arrays, and primitives appropriately
    const displayValue = typeof value === 'object' && value !== null && !Array.isArray(value) 
      ? JSON.stringify(value)
      : value;
      
    return `<li><strong>${key}:</strong> ${displayValue}</li>`;
  }).join('')}
</ul>`;

summaryDiv.innerHTML = summaryHTML;
outputDiv.appendChild(summaryDiv);
}

function appendCFRReferences(outputDiv, textContent) {
const cfrDiv = document.createElement('div');
cfrDiv.className = 'cfr-references';
cfrDiv.innerHTML = '<h3>Title 40 CFR Part 262 Subpart C References</h3>';

const cfrMatches = matchCFRReferences(textContent);
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
}

function addSearchFilter() {
const outputDiv = document.getElementById('section-output');
if (!outputDiv) {
  console.warn("Element 'section-output' not found in the DOM");
  return; // Exit the function if element doesn't exist
}

const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Search within results...';
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