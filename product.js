document.addEventListener('DOMContentLoaded', () => {
    loadProductData();
});

document.getElementById('product-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const asin = document.getElementById('asin').value;
    const wasteDetermination = document.getElementById('waste-determination').value;
    const destination = document.getElementById('destination').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const type = document.getElementById('type').value;

    addProductRow(asin, wasteDetermination, destination, weight, type);
    updateTotals(weight, type);
    saveProductData();

    document.getElementById('product-form').reset();
});

function addProductRow(asin, wasteDetermination, destination, weight, type) {
    const tableBody = document.getElementById('product-table-body');
    const newRow = document.createElement('tr');
    
    const asinCell = document.createElement('td');
    const wasteDeterminationCell = document.createElement('td');
    const destinationCell = document.createElement('td');
    const weightCell = document.createElement('td');
    const typeCell = document.createElement('td');
    const removeCell = document.createElement('td');
    const removeButton = document.createElement('button');

    asinCell.textContent = asin;
    wasteDeterminationCell.textContent = wasteDetermination;
    destinationCell.textContent = destination;
    weightCell.textContent = weight.toFixed(1);
    typeCell.textContent = type;
    removeButton.textContent = 'Remove';
    removeButton.className = 'remove-btn'; // Adding class for CSS styling
    removeButton.addEventListener('click', function() {
        removeProductEntry(newRow, weight, type);
    });

    removeCell.appendChild(removeButton);
    newRow.appendChild(asinCell);
    newRow.appendChild(wasteDeterminationCell);
    newRow.appendChild(destinationCell);
    newRow.appendChild(weightCell);
    newRow.appendChild(typeCell);
    newRow.appendChild(removeCell);

    tableBody.appendChild(newRow);
}

function removeProductEntry(row, weight, type) {
    row.remove();
    updateTotals(-weight, type);
    saveProductData();
}

document.getElementById('clear-product-table').addEventListener('click', function() {
    document.getElementById('product-table-body').innerHTML = '';
    resetTotals();
    saveProductData();
});

document.getElementById('export-product-table').addEventListener('click', function() {
    exportProductDataToExcel();
});

function updateTotals(weight, type) {
    const totalWeightElement = document.getElementById('total-weight');
    const totalWasteElement = document.getElementById('total-waste');
    const totalDonationElement = document.getElementById('total-donation');

    let totalWeight = parseFloat(totalWeightElement.textContent);
    let totalWaste = parseFloat(totalWasteElement.textContent);
    let totalDonation = parseFloat(totalDonationElement.textContent);

    totalWeight += weight;
    if (type === 'waste') {
        totalWaste += weight;
    } else if (type === 'donation') {
        totalDonation += weight;
    }

    totalWeightElement.textContent = totalWeight.toFixed(1);
    totalWasteElement.textContent = totalWaste.toFixed(1);
    totalDonationElement.textContent = totalDonation.toFixed(1);
}

function resetTotals() {
    document.getElementById('total-weight').textContent = '0';
    document.getElementById('total-waste').textContent = '0';
    document.getElementById('total-donation').textContent = '0';
}

function saveProductData() {
    const tableBody = document.getElementById('product-table-body');
    const rows = Array.from(tableBody.rows);
    const data = rows.map(row => {
        return {
            asin: row.cells[0].textContent,
            wasteDetermination: row.cells[1].textContent,
            destination: row.cells[2].textContent,
            weight: parseFloat(row.cells[3].textContent),
            type: row.cells[4].textContent
        };
    });
    localStorage.setItem('productData', JSON.stringify(data));
}

function loadProductData() {
    const data = JSON.parse(localStorage.getItem('productData')) || [];
    const tableBody = document.getElementById('product-table-body');
    data.forEach(item => {
        const newRow = document.createElement('tr');
        const asinCell = document.createElement('td');
        const wasteDeterminationCell = document.createElement('td');
        const destinationCell = document.createElement('td');
        const weightCell = document.createElement('td');
        const typeCell = document.createElement('td');

        asinCell.textContent = item.asin;
        wasteDeterminationCell.textContent = item.wasteDetermination;
        destinationCell.textContent = item.destination;
        weightCell.textContent = item.weight.toFixed(1);
        typeCell.textContent = item.type;

        newRow.appendChild(asinCell);
        newRow.appendChild(wasteDeterminationCell);
        newRow.appendChild(destinationCell);
        newRow.appendChild(weightCell);
        newRow.appendChild(typeCell);

        tableBody.appendChild(newRow);

        updateTotals(item.weight, item.type);
    });
}

function exportProductDataToExcel() {
    const tableBody = document.getElementById('product-table-body');
    const rows = Array.from(tableBody.rows);
    const data = rows.map(row => {
        return [
            row.cells[0].textContent,
            row.cells[1].textContent,
            row.cells[2].textContent,
            row.cells[3].textContent,
            row.cells[4].textContent
        ];
    });
    const worksheet = XLSX.utils.aoa_to_sheet([["ASIN", "Waste Determination", "Destination", "Weight (lbs)", "Type"], ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Data");
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Product_Data_${date}.xlsx`);
}
