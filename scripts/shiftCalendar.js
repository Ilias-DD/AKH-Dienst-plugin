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
        console.log(calendarDays)
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

                                    return `
                                        <td>
                                            <div class="day-number">${day}</div>
                                            ${shift ? `<div class="shift-info">${shift.type}</div>` : ''}
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
