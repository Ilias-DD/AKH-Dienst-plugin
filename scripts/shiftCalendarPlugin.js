// Create and inject styles
function addStyles() {
    var runtimBrowser = typeof browser !== "undefined"  ? browser : chrome;

    if (!document.getElementById('shift-calendar-styles')) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = chrome.runtime.getURL("styles/calendar.css");
        console.log(link.href)
        document.head.appendChild(link);
    }
}

// Extract shifts from the last table
function extractShifts() {
    const shifts = [];
    const { dienstMonth, dienstYear } = extractDate();
    
    // Get all tables and select the last one
    const tables = document.getElementsByTagName('table');
    const shiftTable = tables[tables.length - 1];
    
    if (!shiftTable) return shifts;

    // Get all rows from the last table
    const rows = shiftTable.querySelectorAll('tr');
    
    // Get headers from the title row (first row)
    const titleRow = shiftTable.querySelector('tr.title');
    if (!titleRow) return shifts;
    
    const headers = Array.from(titleRow.querySelectorAll('td')).map(th => th.getAttribute('title') || th.textContent);

    // Process each row except the title row
    rows.forEach(row => {
        if (!row.classList.contains('title')) {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const dateCell = cells[0].textContent;
                const match = dateCell.match(/(\d+)\s+(\w+)/);
                if (match) {
                    const day = parseInt(match[1]);
                    
                    for (let i = 1; i < cells.length; i++) {
                        const personName = cells[i].textContent.trim();
                        if (personName) {
                            shifts.push({
                                date: new Date(dienstYear, dienstMonth, day),
                                type: headers[i],
                                personName: personName.replace(/<br>/g, ''),
                            });
                        }
                    }
                }
            }
        }
    });
    return shifts;
}

// Create person selector
function createPersonSelector(shifts) {
    const uniqueNames = [...new Set(shifts.map(shift => shift.personName))];
    const select = document.createElement('select');
    select.id = 'person-selector';
    select.className = 'shift-select';
    
    uniqueNames.sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });

    select.addEventListener('change', function(){
        const hideButton = document.getElementById('hide-button');
        const calendar = document.getElementById('calendarToHide');
        if (window.getComputedStyle(calendar).display === "none"){
            calendar.style.display = "block";
            hideButton.textContent = `Hide ${select.value} shifts`;

        }
        else{
            calendar.style.display = "none";
            hideButton.textContent = `Show ${select.value} shifts`;
        }
    })

    return select;
}

// Create controls (selector and download button)
function createControls(shifts) {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'shift-controls';

    // Create person selector
    const select = createPersonSelector(shifts);
    controlsContainer.appendChild(select);

    // Create download button
    const downloadButton = document.createElement('button');
    downloadButton.className = 'shift-button';
    downloadButton.id = 'download-button';
    downloadButton.textContent = 'Download Shifts CSV';
    downloadButton.addEventListener('click', () => {
        const selectedPerson = select.value;
        downloadShiftsCSV(shifts, selectedPerson);
    });
    controlsContainer.appendChild(downloadButton);

    // Create hide button
    const hideButton = document.createElement('button');
    hideButton.className = 'shift-button';
    hideButton.id = 'hide-button';
    hideButton.textContent = `Hide ${select.value} shifts`;
    hideButton.addEventListener('click', () => {
        const calendar = document.getElementById('calendarToHide');
        if (window.getComputedStyle(calendar).display === "none"){
            calendar.style.display = "block";
            hideButton.textContent = `Hide ${select.value} shifts`;

        }
        else{
            calendar.style.display = "none";
            hideButton.textContent = `Show ${select.value} shifts`;
        }
    });
    controlsContainer.appendChild(hideButton);

    const nextMonth = document.createElement('button');
    nextMonth.className = 'shift-button';
    nextMonth.id = 'nextMonth-button';
    nextMonth.textContent = 'Go to next month';
    controlsContainer.appendChild(nextMonth);
    nextMonth.addEventListener('click', function(){
        const { dienstMonth, dienstYear } = extractDate();
        const urlMediUni = new URL(window.location.href);
        urlMediUni.searchParams.set('m', dienstMonth + 2);
        window.location.href = urlMediUni.toString();
    })

    return {
        container: controlsContainer,
        selector: select,
        downloadButton: downloadButton
    };
}

// Function to generate and download CSV
function downloadShiftsCSV(shifts, personName) {
    // Filter shifts for selected person
    const personShifts = shifts.filter(shift => shift.personName === personName);
    
    // Sort shifts by date
    personShifts.sort((a, b) => a.date - b.date);

    // Create CSV content
    const csvRows = [];
    
    // Add header with specified format
    csvRows.push(['Subject', 'Start Date', 'Start Time', 'All Day Event']);
    
    // Add data rows
    personShifts.forEach(shift => {
        // Format date as MM/DD/YYYY
        const date = shift.date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        });
        
        csvRows.push([
            shift.type,           // Subject (shift type)
            date,                 // Start Date
            '10:00 AM',           // Start Time (always 7am)
            'True'               // All Day Event (always true)
        ]);
    });

    // Convert to CSV string
    const csvContent = csvRows.map(row => 
        row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Set filename with person name and month
    const month = personShifts[0]?.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const filename = `${personName}_shifts_${month}.csv`.replace(/\s+/g, '_');
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Main function
function initializeShiftCalendar() {
    const shifts = extractShifts();
    if (shifts.length === 0) return;

    const tables = document.getElementsByTagName('table');
    const lastTable = tables[tables.length - 1];
    if (!lastTable){
        return;
    } 

    // Check if calendar already exists
    if (document.getElementById('shift-calendar-container')) {
        return;
    }

    // Create container
    const container = document.createElement('div');
    container.id = 'shift-calendar-container';
    container.className = 'shift-calendar';
    lastTable.parentNode.insertBefore(container, lastTable);

    // Add controls (selector and download button)
    const controls = createControls(shifts);
    container.appendChild(controls.container);

    const { dienstMonth, dienstYear } = extractDate();

    // Create calendar container
    const calendarContainer = document.createElement('div');
    calendarContainer.id = 'calendar-container';
    container.appendChild(calendarContainer);

    // Update calendar when person is selected
    controls.selector.addEventListener('change', (e) => {
        const selectedPerson = e.target.value;
        console.log(shifts)
        createShiftCalendar(shifts, selectedPerson,dienstMonth, dienstYear, 'calendar-container');
    });

    // Initial calendar creation
    if (controls.selector.value) {
        createShiftCalendar(shifts, controls.selector.value, dienstMonth, dienstYear, 'calendar-container');
    }
}

function extractDate() {
     //Exctract month and year
    //https://exmpleUrl?j=2025&m=4&abt=5002
    const urlMediUni = new URL(window.location.href);
    const params = new URLSearchParams(urlMediUni.search);
    console.log(urlMediUni.search);
    
    const dienstYear = parseInt(params.get('j'), 10); 
    const dienstMonth = parseInt(params.get('m'), 10) - 1;
    return { dienstMonth, dienstYear };
}

// Add a check to ensure the page is fully loaded
function init() {
    // Check if the last table exists and has the expected structure
    const tables = document.getElementsByTagName('table');
    if (tables.length > 0) {
        const lastTable = tables[tables.length - 1];
        if (lastTable.querySelector('tr.title')) {
            addStyles();
            initializeShiftCalendar();
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
} 