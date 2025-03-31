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
        localStorage.setItem('person',select.value);
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

    const previousMonth = document.createElement('button');
    previousMonth.className = 'shift-button';
    previousMonth.id = 'previousMonth-button';
    previousMonth.textContent = String.fromCharCode(8249); //<
    controlsContainer.appendChild(previousMonth);
    previousMonth.addEventListener('click', function(){
        const { dienstMonth, dienstYear } = extractDate();
        const urlMediUni = new URL(window.location.href);
        urlMediUni.searchParams.set('m', dienstMonth);
        urlMediUni.searchParams.set("person", select.value);
        let chachePerson = select.value
        window.location.href = urlMediUni.toString();
    })

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

    //TODO: Refactor the month logic
    //RN it can't go to previous year and after 2 months the month is not available
    //TOD: Refactor by extracting to method so that I don't duplicate button creation
    const nextMonth = document.createElement('button');
    nextMonth.className = 'shift-button';
    nextMonth.id = 'nextMonth-button';
    nextMonth.textContent = String.fromCharCode(8250); //>
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