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
            hideButton.textContent = `Show ${select.value} shifts`;
        }
        else{
            hideButton.textContent = `Hide ${select.value} shifts`;
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

    const previousMonth = createButton('previousMonth-button', String.fromCharCode(8249), function(){
        const { dienstMonth, dienstYear } = extractDate();
        const urlMediUni = new URL(window.location.href);
        urlMediUni.searchParams.set('m', dienstMonth);

        window.location.href = urlMediUni.toString();
    });
    controlsContainer.appendChild(previousMonth);

    // Create download button
    const exportButton = createButton('export-button', `Export to CSV`, () => {
        const selector = document.getElementById('person-selector');
        const selectedPerson = selector.value;
        downloadShiftsCSV(shifts, selectedPerson);
    });
    controlsContainer.appendChild(exportButton);

    // Create hide button
    const hideButton = createButton('hide-button', `Hide ${select.value} shifts`, () => {
        const calendar = document.getElementById('calendarToHide');
        const hideBtn = document.getElementById('hide-button');
        if (window.getComputedStyle(calendar).display === "none"){
            calendar.style.display = "block";
            hideBtn.textContent = `Hide ${select.value} shifts`;

        }
        else{
            calendar.style.display = "none";
            hideBtn.textContent = `Show ${select.value} shifts`;
        }
    });
    controlsContainer.appendChild(hideButton);

    //TODO: Refactor the month logic
    //RN it can't go to previous year and after 2 months the month is not available
    const nextMonth = createButton('nextMonth-button', String.fromCharCode(8250), function(){
        const { dienstMonth, dienstYear } = extractDate();
        const urlMediUni = new URL(window.location.href);
        urlMediUni.searchParams.set('m', dienstMonth + 2);
        window.location.href = urlMediUni.toString();
    }); 
    controlsContainer.appendChild(nextMonth);

    return {
        container: controlsContainer,
        selector: select,
        downloadButton: exportButton
    };
}

function createButton(buttonId, content, callback ) {

    const button = document.createElement('button');
    button.className = 'shift-button';
    button.id = buttonId;
    button.textContent = content; 
    button.addEventListener("click", callback);
    return button;
}

