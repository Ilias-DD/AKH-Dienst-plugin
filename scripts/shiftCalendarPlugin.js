// Extract shifts from the last table
function extractShifts() {
    const shifts = [];
    const { dienstMonth, dienstYear } = extractDate();
    
    // Get all tables and select the last one
    const tables = document.getElementsByTagName('table');
    const shiftTable = tables[tables.length - 1];
    
    if (!shiftTable) return shifts;

    // Get all rows from the last table
    shiftTable.id = "uglyTable";
    shiftTable.style.display = "none";
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

    // Initial calendar creation
    if (controls.selector.value) {
        createShiftCalendar(shifts, controls.selector.value, dienstMonth, dienstYear, 'calendar-container');
    }
}

function formatToGoogleCalendar(date) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}


function sendEventToGmail(title, date)
{
    //Date handeling
    const startDate = new Date(date.getTime());
    const endDate = new Date(date.getTime());
 
    startDate.setHours(8,0,0,0);
    endDate.setDate(date.getDate() + 1);
    endDate.setHours(8,0,0,0)

    const startDateTime = formatToGoogleCalendar(startDate);
    const endDateTime = formatToGoogleCalendar(endDate);

    const googleCalendarUrl = 
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}`;
    window.open(googleCalendarUrl, "_blank");
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
            initializeShiftCalendar();
        }
    }
}

function exportShiftsToGmail(shifts, personName) {

    const personShifts = shifts.filter(shift => shift.personName === personName);
    personShifts.sort((a, b) => a.date - b.date);
    
    // Add data rows
    personShifts.forEach(shift => {
        sendEventToGmail(shift.type, shift.date);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
} 