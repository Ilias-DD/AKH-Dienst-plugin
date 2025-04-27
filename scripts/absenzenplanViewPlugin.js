function getMainFrame(){
   // CHROME
   if (navigator.userAgent.indexOf("Chrome") != -1 ) {
    console.log("Google Chrome");
    return  window.frames["main"];

  }
  // FIREFOX
  else if (navigator.userAgent.indexOf("Firefox") != -1 ) {
    console.log("Mozilla Firefox");
    return frames[1];
  }
}

function generate(){
    // Find the original table
    const originalTable = getMainFrame().document.documentElement.querySelector('form table');
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
  controllers.className="shift-buttons";
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

    controllers.appendChild(createPreviousMonthButton());
    controllers.appendChild(swithcButton);
    controllers.appendChild(createNextMonthButton());
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
    const mainFrame = getMainFrame();
    if (!mainFrame) return console.warn("Main frame not found");

    generateCalendar();
  } 

function generateCalendar() {
   // CHROME
   if (navigator.userAgent.indexOf("Chrome") != -1 ) {
    // Wait for the frame to load
    let mainFrame = getMainFrame();
    mainFrame.addEventListener('load', () => {
      generate();
    });
  }
  else{
    function getMainFrameDocument() {
      let frame = getMainFrame();
      if (frame != undefined && frame.document != undefined && frame.document.readyState == "complete") {
        console.log("test");
        generate();
      } else {
        // Try again later
        console.log("ssetTimeout");
        setTimeout(getMainFrameDocument, 100);
      }
    }
    setTimeout(getMainFrameDocument, 500);
  } 
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