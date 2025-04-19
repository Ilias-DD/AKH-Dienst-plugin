function initLoader(){
    // Create and inject the loader
    const loader = document.createElement('div');
    loader.className = 'meduni-svg-loader';
    loader.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="48.000000pt" height="46.000000pt" viewBox="0 0 48.000000 46.000000" preserveAspectRatio="xMidYMid meet">

    <g transform="translate(0.000000,46.000000) scale(0.100000,-0.100000)" fill="#001f4d" stroke="#001f4d">
    <path d="M156 445 c-134 -48 -192 -196 -127 -323 41 -79 107 -117 206 -116 55 0 79 5 105 21 81 50 120 117 120 205 -1 69 -27 125 -80 171 -66 57 -143 71 -224 42z m127 -4 c94 -22 167 -114 167 -211 0 -137 -137 -246 -267 -211 -223 60 -225 354 -3 422 34 10 58 10 103 0z"/>
    <path d="M155 405 c-30 -13 -30 -13 -4 -14 14 -1 30 -6 36 -12 8 -8 17 -8 31 0 33 18 77 13 98 -10 16 -18 19 -37 19 -127 0 -75 -4 -106 -12 -109 -10 -4 -13 19 -13 92 0 106 -9 135 -43 135 -40 0 -47 -18 -47 -127 0 -85 -3 -103 -15 -103 -12 0 -15 18 -15 103 0 108 -7 127 -45 127 -12 0 -26 -5 -33 -12 -16 -16 -16 -218 -1 -252 22 -49 130 -73 194 -44 l25 11 -37 13 c-24 9 -41 10 -47 4 -17 -17 -75 -11 -96 10 -18 18 -20 33 -20 130 0 91 3 110 15 110 12 0 15 -18 15 -103 0 -109 7 -127 47 -127 34 0 43 29 43 135 0 73 3 96 13 93 8 -3 13 -35 15 -103 3 -105 11 -125 48 -125 34 0 44 28 44 130 0 106 -15 152 -59 174 -37 19 -115 20 -156 1z"/>
    <path d="M51 299 c-15 -43 -13 -107 4 -144 12 -28 13 -23 14 73 1 56 -1 102 -3 102 -2 0 -9 -14 -15 -31z"/>
    <path d="M402 230 l0 -95 15 49 c14 45 14 55 0 95 l-15 46 0 -95z"/>
    </g>
    </svg>
    `;
    document.documentElement.appendChild(loader);
}

function removeLoader(){
    document.querySelector('.meduni-svg-loader').style.opacity = '0';
}

function loadPage(delay = 1000) {
    initLoader();
    setTimeout(() =>{
        removeLoader();
        document.documentElement.style.opacity = '1';
        document.documentElement.style.transform = 'translateY(0)';
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
    }, delay)
}
