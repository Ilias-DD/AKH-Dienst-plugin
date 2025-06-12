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
    
    select.value = getStoredName(select.value, uniqueNames);

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


function showToast(message) {
    // Create the toast element if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      document.body.appendChild(toast);
  
      // Inject the shake animation style once
      const style = document.createElement('style');
      style.textContent = `
        @keyframes shake {
          0% { transform: translate(-50%, -50%) translateX(0); }
          25% { transform: translate(-50%, -50%) translateX(-5px); }
          50% { transform: translate(-50%, -50%) translateX(5px); }
          75% { transform: translate(-50%, -50%) translateX(-5px); }
          100% { transform: translate(-50%, -50%) translateX(0); }
        }
      `;
      document.head.appendChild(style);
  
      // Style the toast via JS
      Object.assign(toast.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#333',
        color: '#fff',
        padding: '16px 24px',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        zIndex: 1000,
        opacity: 0,
        transition: 'opacity 0.5s ease',
        display: 'block',
        animation: 'shake 0.5s ease',
      });
    }
  
    // Set the message and show the toast
    toast.innerHTML = message;
    toast.style.opacity = '1';
    toast.style.animation = 'shake 0.5s ease';
  
    // Reset animation so it can replay if triggered again quickly
    toast.offsetHeight; // force reflow
    toast.style.animation = 'shake 0.5s ease';
  
    // Hide after 5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 10000);
  }
  

function getStoredName(defaultName, listOfNames){
    const storedName = localStorage.getItem('person');
    
    if(storedName == null) return defaultName;
    if(listOfNames.includes(storedName)) return storedName;

    showToast(`⚠️ <span style="font-weight: bold; color: #ffcc00">${storedName}</span>, 
        you didn't work for AKH this month.<br>You're viewing
         <span style="font-weight: bold; color: #00bfff">${defaultName}</span>'s calendar instead.`);
    return defaultName;
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
    const exportButton = createButton('export-button', `Export to ICS`, () => {
        const selector = document.getElementById('person-selector');
        const selectedPerson = selector.value;
        downloadShiftsICS(shifts, selectedPerson);
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

function downloadShiftsICS(shifts, personName) {
    // Filter and sort shifts for selected person
    const personShifts = shifts
        .filter(shift => shift.personName === personName)
        .sort((a, b) => a.date - b.date);

    console.log(personShifts);
    // Start building the ICS content
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Organization//Shift Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;
    function formatDate(date, timeZone = 'Europe/Berlin') {
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    
        const parts = formatter.formatToParts(date);
        const y = parts.find(p => p.type === 'year').value;
        const m = parts.find(p => p.type === 'month').value;
        const d = parts.find(p => p.type === 'day').value;
    
        return `${y}${m}${d}`; 
    }

    personShifts.forEach(shift => {
        const startDate = formatDate(shift.date);
        const endDate = formatDate(new Date(shift.date.getTime() + 86400000));

        icsContent += `BEGIN:VEVENT
SUMMARY:${shift.type}
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
DESCRIPTION:Shift for ${personName}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT12H
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
`;
    });

    icsContent += `END:VCALENDAR`;

    // Create a Blob and download
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${personName}_shifts.ics`;
    a.style.visibility = 'hidden';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

function createPreviousMonthButton(){
   return createButton('previousMonth-button', "<< PREV", function(){
        let { dienstMonth, dienstYear } = extractDate();
        dienstYear = dienstMonth == 0 ? dienstYear - 1 : dienstYear;
        dienstMonth = dienstMonth == 0 ? 11 : dienstMonth;

        const urlMediUni = new URL(window.location.href);
        urlMediUni.searchParams.set('m', dienstMonth);
        urlMediUni.searchParams.set('j', dienstYear);

        window.location.href = urlMediUni.toString();
    });
}

function createHomePageButton() {
    return createButton('home-page-button', "Auswahl", function(){
        window.location.href ='/'
    })
}

function createNextMonthButton(){
    return createButton('nextMonth-button', "NEXT >>", function(){
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