
function generate(){
    // Find the original table
    const originalTable = window.frames["main"].document.documentElement.querySelector('form[name] table');
    console.log(originalTable);
    if (!originalTable) return console.warn("Original table not found");

    const rows = originalTable.querySelectorAll('tr');
    if (rows.length < 3) return console.warn("Not enough rows to build calendar");

    const name = rows[3].querySelector('a').innerHTML.trim();

    const { dienstMonth, dienstYear } = extractDate();
    const shiftsForThisMonth = [];
    for(let i = 2; i < rows[3].children.length; i++){
      let date = new Date(dienstYear, dienstMonth,  parseInt(rows[1].children[i - 2].textContent.trim() ,10));
      let shiftType = rows[3].children[i].querySelector("font");
      if(!shiftType)
      {
        console.log("Day " + i + " is a free day :)");
        continue;
      }
      else{
        shiftType = shiftType.textContent;
      }
      let shiftElement = {
        date: date,
        type: shiftType,
        personName: name.replace(/<br>/g, ''),
      }
      console.log("Date "+ rows[1].children[i - 2].textContent.trim()  )
      console.log(shiftElement);
      shiftsForThisMonth.push(shiftElement);
    }
    const container = document.createElement('div');
    container.id = 'shift-calendar-container';
    container.className = 'shift-calendar';
    document.body.appendChild(container);

    createShiftCalendar(shiftsForThisMonth, name.replace(/<br>/g, ''), dienstMonth, dienstYear, "shift-calendar-container");
  }

  function initMonthlyCalendarView(){
    const mainFrame = document.querySelector("frame[name='main']");
    if (!mainFrame) return console.warn("Main frame not found");

    // Wait for the frame to load
    mainFrame.addEventListener('load', () => {
      generate();
    });
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

const body = document.createElement("body");
document.documentElement.appendChild(body);
loadPage(1000);
if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', initMonthlyCalendarView);
} else {
    initMonthlyCalendarView();
} 