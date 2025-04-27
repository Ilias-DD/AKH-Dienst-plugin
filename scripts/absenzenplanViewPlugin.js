
function generate(){
    // Find the original table
    const originalTable = frames[1].document.documentElement.querySelector('form[name] table');
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
      
      shiftsForThisMonth.push(shiftElement);
    }

  const controllers = document.createElement("div");
  // Create switch view button
  const swithcButton = createButton('hide-button', "Show ugly view", () => {
    const calendar = document.getElementById('calendarToHide');
    const hideBtn = document.getElementById('hide-button');
    if (window.getComputedStyle(calendar).opacity === "1"){
        calendar.style.opacity = "0";
        hideBtn.textContent = `Show nice view`;
    }
    else{
        calendar.style.opacity = "1";
        hideBtn.textContent = `Show ugly view`;
    }
    });
    controllers.appendChild(swithcButton);
    document.body.appendChild(controllers);
    controllers.style.backgroundColor='#e5d4f7';

    const container = document.createElement('div');
    container.id = 'shift-calendar-container';
    container.className = 'shift-calendar';
    document.body.appendChild(container);

    createShiftCalendar(shiftsForThisMonth, name.replace(/<br>/g, ''), dienstMonth, dienstYear, "shift-calendar-container");
    removeLoader();
  }

  function initMonthlyCalendarView(){
    const mainFrame = document.querySelector("frame[name='main']");
    if (!mainFrame) return console.warn("Main frame not found");

    function getMainFrameDocument() {
      const frame = frames[1];
      if (frame != undefined && frame.document != undefined && frame.document.readyState == "complete") {
          generate();
      } else {
        // Try again later
        setTimeout(getMainFrameDocument, 100);
      }
    }

    if(mainFrame.document == undefined){
      setTimeout(getMainFrameDocument, 500)
    }
    else generate();
  } 

  function extractDate() {
    //Exctract month and year
  //https://exmpleUrl?j=2025&m=4&abt=5002
  const urlMediUni = new URL(window.location.href);
  const params = new URLSearchParams(urlMediUni.search);
  
  const dienstYear = parseInt(params.get('j'), 10); 
  const dienstMonth = parseInt(params.get('m'), 10) - 1;
  return { dienstMonth, dienstYear };
}

const body = document.createElement("body");
document.documentElement.appendChild(body);
initLoader();
if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', initMonthlyCalendarView);
} else {
    initMonthlyCalendarView();
} 