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

    select.value = localStorage.getItem('person') == null ? select.value : localStorage.getItem('person');

    select.addEventListener('change', function(e){
        const calendarVisibility = window.getComputedStyle(document.getElementById('calendarToHide')).display;
        const selectedPerson = e.target.value;
        const { dienstMonth, dienstYear } = extractDate();

        createShiftCalendar(shifts, selectedPerson, dienstMonth, dienstYear, 'calendar-container');
        const calendar = document.getElementById('calendarToHide');
        calendar.style.display = calendarVisibility;

        localStorage.setItem('person',select.value);
    })

    return select;
}

// Create controls (selector and download button)
function createControls(shifts) {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'shift-controls';
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "shift-buttons"

    // Create person selector
    const select = createPersonSelector(shifts);
    controlsContainer.appendChild(select);
    controlsContainer.appendChild(buttonContainer)

    const previousMonth = createPreviousMonthButton();
    buttonContainer.appendChild(previousMonth);

    // Create switch view button
    const swithcButton = createButton('hide-button', "Show ugly view", () => {
        const calendar = document.getElementById('calendarToHide');
        const uglyView = document.getElementById('uglyTable')
        const hideBtn = document.getElementById('hide-button');
        if (window.getComputedStyle(calendar).display === "none"){
            calendar.style.display = "block";
            uglyView.style.display = "none";
            hideBtn.textContent = `Show ugly view`;

        }
        else{
            calendar.style.display = "none";
            uglyView.style.display = "block";
            hideBtn.textContent = `Show nice calendar view`;
        }
    });
    buttonContainer.appendChild(swithcButton);

    // Create export to gmail button
    const exportToGmailButton = createButton('export-gmail-button', `Export to Gmail`, () => {
        const selector = document.getElementById('person-selector');
        const selectedPerson = selector.value;
        exportShiftsToGmail(shifts, selectedPerson);
    });
    buttonContainer.appendChild(exportToGmailButton);

    // Create download button
    const exportButton = createButton('export-button', `Export to CSV`, () => {
        const selector = document.getElementById('person-selector');
        const selectedPerson = selector.value;
        downloadShiftsCSV(shifts, selectedPerson);
    });
    buttonContainer.appendChild(exportButton);

    const nextMonth = createNextMonthButton();
    buttonContainer.appendChild(nextMonth);

    return {
        container: controlsContainer,
        selector: select,
        downloadButton: exportButton
    };
}

function exportShiftsToGmail(shifts, personName) {

    const personShifts = shifts.filter(shift => shift.personName === personName);
    personShifts.sort((a, b) => a.date - b.date);
    
    personShifts.forEach(shift => {
        sendEventToGmail(shift.type, shift.date);
    });
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

function createButton(buttonId, content, callback ) {

    const button = document.createElement('button');
    button.className = 'shift-button';
    button.id = buttonId;
    button.textContent = content; 
    button.addEventListener("click", callback);
    return button;
}

//TODO: Refactor the month logic
    //There is still an issue when going to a month which doesn't 
    // contain the name of the one we stored locally
function createPreviousMonthButton(){
   return createButton('previousMonth-button', String.fromCharCode(8249), function(){
        let { dienstMonth, dienstYear } = extractDate();
        dienstYear = dienstMonth == 0 ? dienstYear - 1 : dienstYear;
        dienstMonth = dienstMonth == 0 ? 11 : dienstMonth;

        const urlMediUni = new URL(window.location.href);
        urlMediUni.searchParams.set('m', dienstMonth);
        urlMediUni.searchParams.set('j', dienstYear);

        window.location.href = urlMediUni.toString();
    });
}

function createNextMonthButton(){
    return createButton('nextMonth-button', String.fromCharCode(8250), function(){
        let { dienstMonth, dienstYear } = extractDate();

        dienstYear = dienstMonth + 2 > 12 ? dienstYear + 1 : dienstYear;
        dienstMonth = dienstMonth + 2 > 12 ? 1 : dienstMonth + 2;

        const urlMediUni = new URL(window.location.href);

        urlMediUni.searchParams.set('m', dienstMonth);
        urlMediUni.searchParams.set('j', dienstYear);
        window.location.href = urlMediUni.toString();
    });
}

function createControlsForUnavailableCallendar()
{
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "shift-buttons"
    buttonContainer.appendChild(createPreviousMonthButton());
    buttonContainer.appendChild(createNextMonthButton());
    return buttonContainer;
}