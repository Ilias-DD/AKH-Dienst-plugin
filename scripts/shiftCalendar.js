function mapShiftTypeToResponsiblesType(shiftType){
    const listOfShiftTypes1 = [
        "738:OP 5 ASS1", 
        "738:OP 5 ASS2", 
        "738:ASS GEB.", 
        "VD1 10:00-18:00", 
        "VD2 10:00-18:00",
        "738: bASS",
        "738: bLTX"
    ];
    const listOfShiftTypes2 = [
        "738:UNFALL ASS1",
        "738:UNFALL ASS2",
        "738:UNFALL ASS3"
    ]
    const listOfResponsibles1 = ["OA_E9", "SV_E9"];
    const listOfResponsibles2 = ["738:UNFALL OA"];

    if(listOfShiftTypes1.includes(shiftType)){
        return listOfResponsibles1;
    }
    if(listOfShiftTypes2.includes(shiftType)){
        return listOfResponsibles2;
    }
    return [];
}


function createShiftCalendar(shifts, personName, month, year, containerId) {
    // Filter shifts for the specific person
    const personShifts = shifts.filter(shift => shift.personName === personName);

    // Helper functions
    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }

    // Generate calendar grid
    function generateCalendarDays() {
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const weeks = [];
        let currentWeek = [];

        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDay; i++) {
            currentWeek.push(null);
        }

        // Fill in the days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            currentWeek.push(day);
            
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Fill in remaining days
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            weeks.push(currentWeek);
        }

        return weeks;
    }

    function createCalendar() {
        const container = document.getElementById(containerId);
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const calendarDays = generateCalendarDays();
        const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

        const html = `
            <div class="calendar" id="calendarToHide">
                <h2>${personName}'s Shifts - ${monthName} ${year}</h2>
                <table>
                    <thead>
                        <tr>
                            ${weekDays.map(day => `<th>${day}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${calendarDays.map(week => `
                            <tr>
                                ${week.map(day => {
                                    if (!day) {
                                        return '<td></td>';
                                    }
                                    
                                    const currentDate = new Date(year, month, day);
                                    const shift = personShifts.find(s => 
                                        s.date.getDate() === currentDate.getDate() &&
                                        s.date.getMonth() === currentDate.getMonth() &&
                                        s.date.getFullYear() === currentDate.getFullYear()
                                    );
                                    let responsibles = [];
                                    let respsType = shift != null ? mapShiftTypeToResponsiblesType(shift.type) : [];
                                    if (respsType && respsType.length){
                                        responsibles = shifts.filter(sh => sh.date.getDate() === currentDate.getDate() &&
                                                    respsType.includes(sh.type));
                                    }
                                    return `
                                    <td class="${shift && shift.isPublicHoliday ? "public-holiday" : ""}">
                                        <div class="td-wrapper">
                                            <div class="day-number">${day}</div>
                                            ${shift && shift.type ? `<div class="${shift.infoClass ? shift.infoClass : "shift-info"}">${shift.type}</div>` : ''}
                                            ${
                                                (responsibles && responsibles.length) 
                                                    ? `<div class="shift-responsibles-container">
                                                        <div class="resp-title"> Responsibles </div>
                                                        ${responsibles.map(r => `<div>${r.type}: ${r.personName}</div>`).join('')}
                                                    </div>`
                                                    : ''
                                            }
                                        </div>
                                    </td>
                                `;
                                }).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    createCalendar();
}
