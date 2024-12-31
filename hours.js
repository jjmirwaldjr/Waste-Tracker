document.addEventListener('DOMContentLoaded', () => {
    loadHoursData();
});

document.getElementById('work-hours-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const date = document.getElementById('date').value;
    const name = document.getElementById('name').value;
    const hours = parseFloat(document.getElementById('hours').value);

    const tableBody = document.getElementById('work-hours-table-body');
    const newRow = document.createElement('tr');
    
    const dateCell = document.createElement('td');
    const nameCell = document.createElement('td');
    const hoursCell = document.createElement('td');
    const removeCell = document.createElement('td');
    const removeButton = document.createElement('button');

    dateCell.textContent = date;
    nameCell.textContent = name;
    hoursCell.textContent = hours.toFixed(1);
    removeButton.textContent = 'Remove';
    removeButton.className = 'remove-btn';
    removeButton.addEventListener('click', function() {
        removeHoursEntry(newRow, hours);
        refreshDataModel();
    });

    removeCell.appendChild(removeButton);
    newRow.appendChild(dateCell);
    newRow.appendChild(nameCell);
    newRow.appendChild(hoursCell);
    newRow.appendChild(removeCell);

    tableBody.appendChild(newRow);

    updateTotalHours(hours);
    saveHoursData();

    document.getElementById('work-hours-form').reset();
});

function removeHoursEntry(row, hours) {
    row.remove();
    updateTotalHours(-hours);
    saveHoursData();
}

function refreshDataModel() {
    saveHoursData();
}

document.getElementById('clear-hours-table').addEventListener('click', function() {
    document.getElementById('work-hours-table-body').innerHTML = '';
    resetTotalHours();
    saveHoursData();
});

document.getElementById('export-hours-table').addEventListener('click', function() {
    exportHoursDataToExcel();
});

function updateTotalHours(hours) {
    const totalHoursElement = document.getElementById('total-hours');
    let totalHours = parseFloat(totalHoursElement.textContent);
    totalHours += hours;
    totalHoursElement.textContent = totalHours.toFixed(1);
}

function resetTotalHours() {
    document.getElementById('total-hours').textContent = '0';
}

function saveHoursData() {
    const tableBody = document.getElementById('work-hours-table-body');
    const rows = Array.from(tableBody.rows);
    const data = rows.map(row => {
        return {
            date: row.cells[0].textContent,
            name: row.cells[1].textContent,
            hours: parseFloat(row.cells[2].textContent)
        };
    });
    localStorage.setItem('hoursData', JSON.stringify(data));
}

function loadHoursData() {
    const data = JSON.parse(localStorage.getItem('hoursData')) || [];
    const tableBody = document.getElementById('work-hours-table-body');
    data.forEach(item => {
        const newRow = document.createElement('tr');
        const dateCell = document.createElement('td');
        const nameCell = document.createElement('td');
        const hoursCell = document.createElement('td');

        dateCell.textContent = item.date;
        nameCell.textContent = item.name;
        hoursCell.textContent = item.hours.toFixed(1);

        newRow.appendChild(dateCell);
        newRow.appendChild(nameCell);
        newRow.appendChild(hoursCell);

        tableBody.appendChild(newRow);

        updateTotalHours(item.hours);
    });
}

function exportHoursDataToExcel() {
    const tableBody = document.getElementById('work-hours-table-body');
    const rows = Array.from(tableBody.rows);
    const data = rows.map(row => {
        return [
            `"${row.cells[0].textContent.replace(/"/g, '""')}"`,
            `"${row.cells[1].textContent.replace(/"/g, '""')}"`,
            `"${row.cells[2].textContent.replace(/"/g, '""')}"`
        ];
    });
    const worksheet = XLSX.utils.aoa_to_sheet([["Date", "Name", "Hours Worked"], ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hours Data");
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Hours_Data_${date}.xlsx`);
}

