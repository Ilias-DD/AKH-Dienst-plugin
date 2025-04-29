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
        infoClass: getShiftClass(shiftType),
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
        calendar.style.pointerEvents = "none";
        document.body.style.pointerEvents = "none";
        hideBtn.textContent = `Show nice view`;
        controllers.style.pointerEvents = "auto"
    }
    else{
        calendar.style.opacity = "1";
        calendar.style.pointerEvents = "auto";
        document.body.style.pointerEvents = "auto";
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

function getShiftClass(shiftType){
  //TODO: ASK questions about shift types:
  // IS RT -> ruhe tage -> should it be green as vacations
  // Is WF -> research abroad? Is blue good?
  // Do we need second + third lines?
  const normalDays = ["T"];
  const shifts = ["KO", "OA_E9", "SV_E9", "OP51", "OP52", "bASS",
     "UNF1", "UNF2" ,"UNF3", "GEBA", "VD1" , "VD2", "bLTX", "UNFO",
    "KIMC", "NCHO", "NCHA", "NCHI1", "B19O", "B1H", "9HD", "C1IO",
    "C1H", "OA_KI", "C2O", "C2H", "A7H", "NEF1", "NEF2", "NEFN1",
    "NEFN2", "hNT1", "hNT2","hNN1", "hNN2", "SPÄ1", "SPÄ2"];
  const vacations = ["U"];
  const researhDaysAbroad = ["wF"];

  if(normalDays.includes(shiftType)){
     return "normal-day";
  }

  if(shifts.includes(shiftType)){
     return "shift-info";
    }

  if(researhDaysAbroad.includes(shiftType)){
    return "research-abroad";
  }
  if(vacations.includes(shiftType)) {
    return "vacations";
  }

  return "normal-day";
}

const body = document.createElement("body");
document.documentElement.appendChild(body);
initLoader();
if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', initMonthlyCalendarView);
} else {
    initMonthlyCalendarView();
} 