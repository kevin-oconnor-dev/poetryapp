const usedPoems = [];
const appUI = {
    datalist: document.getElementById('datalist'),
    randomButton: document.getElementById('random'),
    enterButton: document.getElementById('submit'),
    madlibsButton: document.getElementById('madlibs'),
    goButton: document.createElement('button'),
    cancelButton: document.createElement('button'),
    inputAuthor: document.getElementById('author'),
    poemElement: document.getElementById('poetry'),
    poemNum: document.getElementById('num'),
    titleHeader: document.getElementById('poem-title'),
    lineLimit: {
        element: document.getElementById('max-line'),
        value: 0,
        storage: 0,
    },
    datalistAuthors: [],
}
const typeStatus = {
    timerId: null,
    typing: false,
}

async function getPoem(author) {
    if (!author) {
        if (!appUI.datalistAuthors) {
            await makeDatalist();
        }
        author = pickRandomAuthor();
    } 
    let url = `https://poetrydb.org/author/${author}`;
    try {
        let response = await fetch(url);
        let json = await response.json();
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        let poemCount = json.length; // count of all the author's poems

        let random = pickPoem(json, poemCount);

        const poemObject = {
            author: json[random].author,
            lines: json[random].lines,
            title: json[random].title,
            random: random,
            poemCount: poemCount,
        } 
        console.log(poemObject.lines);
        return poemObject;

    } catch (error) {
        console.error('getPoem fetch error:', error);
        appUI.poemElement.innerText = 'Uh-oh! There was an error loading the poem...';
    }
}

async function makeDatalist() {
    let authors = await getAllAuthors();
    for (let author of authors) {
        let option = document.createElement('option');
        option.value = author;
        appUI.datalist.appendChild(option);
        appUI.datalistAuthors.push(author);
    }
}
async function getAllAuthors() {
    let url = 'https://poetrydb.org/author';
    try {
        let response = await fetch(url);
        let json = await response.json();
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return json.authors;

    } catch (error) {
        console.error('getAllAuthors fetch error:', error);
    }
}

function pickRandomAuthor() {
    let length = appUI.datalistAuthors.length;
    let random = Math.floor( Math.random() * length );
    return appUI.datalistAuthors[random];
}

function pickPoem(json, poemCount) {
    let random;
    let poemTitle;
    do {
        random = Math.floor(Math.random() * poemCount);
        poemTitle = json[random].title;
    } while ( usedPoems.includes(poemTitle) );

    usedPoems.push(poemTitle);
    return random;
}

function buildPoem(poemObj) {
    displayTitle(poemObj);
    displayNumber(poemObj);
    typeText(poemObj.lines);
}

function displayNumber(poemObj) {
    appUI.poemNum.innerText = `${poemObj.random + 1} of ${poemObj.poemCount} (${poemObj.author})`
}
function displayTitle(poemObj) {
    appUI.titleHeader.innerText = poemObj.title;
}

function typeText(poemLines) {
    let print = '';
    let lineIndex = 0;
    let charIndex = 0;
    let linesActual = 0; // line count excluding blanks
    let variedSpeed = Math.floor(Math.random() * (60 - 50 + 1) + 50);
    let lineLimit = appUI.lineLimit.value;

    if (lineLimit === 0) lineLimit = 999;
    
    function type() {
        if (lineIndex < poemLines.length && linesActual < lineLimit) {
            typeStatus.typing = true;
            if (charIndex < poemLines[lineIndex].length) {
                print += poemLines[lineIndex][charIndex];
                charIndex++;
            } 
            else if (poemLines[lineIndex] === "") { // if line is blank, don't pause after it
                print += '\n';
                charIndex = 0;
                lineIndex++;
            } else {
                print += '\n';
                charIndex = 0;
                lineIndex++;
                linesActual++; // only lines with text count toward linesActual
                variedSpeed = 300; // pause after each line
            }
            appUI.poemElement.innerText = print;

            typeStatus.timerId = setTimeout(type, variedSpeed);
            variedSpeed = Math.floor(Math.random() * (60 - 50 + 1) + 50);
        }
    }
    type();
    typeStatus.typing = false;
}

async function randomPress() {
    if (typeStatus.typing) clearTimeout(typeStatus.timerId);
    const randomButton = appUI.randomButton;
    randomButton.style.visibility = 'hidden';
    let poemObj = await getPoem();
    buildPoem(poemObj);
    randomButton.style.visibility = 'visible';
}

async function runPoetryMachine() {
    if (typeStatus.typing) clearTimeout(typeStatus.timerId);
    let input = document.getElementById('author');
    let userEntry = input.value;
    let poemObj = await getPoem(userEntry);
    buildPoem(poemObj);
    input.value = '';
}

function createMadlibsUI() {
    if (typeStatus.typing) clearTimeout(typeStatus.timerId);

    appUI.titleHeader.innerText = 'Madlibs!';
    appUI.titleHeader.style.fontFamily = 'Barriecito';

    appUI.poemNum.style.visibility = 'hidden';

    appUI.lineLimit.element.style.visibility = 'hidden';
    appUI.lineLimit.storage = appUI.lineLimit.value;
    appUI.lineLimit.value = 999;

    appUI.poemElement.innerText = 'Create a franken-poem with random lines of poetry!';

    appUI.randomButton.style.display = 'none';
    appUI.enterButton.style.display = 'none';
    appUI.madlibsButton.style.display = 'none';

    appUI.goButton.innerText = 'Go';
    appUI.goButton.id = 'madlibs-go';
    appUI.goButton.style.display = 'block';
    appUI.goButton.onclick = buildMadlibsPoem;

    appUI.cancelButton.innerText = 'Cancel';
    appUI.cancelButton.id = 'cancel-madlibs';
    appUI.cancelButton.style.display = 'block';
    appUI.cancelButton.onclick = cancelMadlibs;

    const inputBox = document.getElementById('input-box');
    if(!inputBox.contains(appUI.goButton)) {
        inputBox.appendChild(appUI.goButton);
    }
    if(!inputBox.contains(appUI.cancelButton)) {
        inputBox.appendChild(appUI.cancelButton);
    }

    appUI.inputAuthor.placeholder = '# of lines';
    appUI.inputAuthor.type = 'number';
    appUI.inputAuthor.removeAttribute('list');
    appUI.inputAuthor.style.width = '13vw';
    appUI.inputAuthor.setAttribute('max','8');
}

async function getMadlibsPoem(lineNum) {
    const assembledLines = [];
    try {
        for (let i = 0; i < lineNum; i++) {
            const poemObj = await getPoem();
            const lineCount = poemObj.lines.length;
            console.log('line count: ' + lineCount);
            let random = 0;
            let pickedLine = '';
            if (i === 0 || i === lineNum - 1) {
                do {
                    random = Math.floor(Math.random() * lineCount);
                    console.log(`random: ${random}`);
                    pickedLine = poemObj.lines[random];
                } while (pickedLine === '' || pickedLine.length === 1);
            } else { 
                do { // allow line breaks between first and last lines
                    random = Math.floor(Math.random() * lineCount);
                    console.log(`random (first or last): ${random}`);
                    pickedLine = poemObj.lines[random];
                } while ( pickedLine.length === 1); 
            }
            console.log(`picked line ${i + 1}: ${pickedLine}`);
            assembledLines.push(pickedLine);
        }
        console.log(assembledLines);
        return assembledLines;
    } catch(err) {
        console.error(`Madlibs fetch error: ${err}`);
    }
}

async function buildMadlibsPoem() {
    if (typeStatus.typing) clearTimeout(typeStatus.timerId);
    let lineNum = appUI.inputAuthor.value;
    if (lineNum > 8) {
        alert('max length is 8!');
    } else {
        displayLoadingSign();
        appUI.inputAuthor.value = null;
        const arr = await getMadlibsPoem(lineNum);
        typeText(arr);
    }
}
function displayLoadingSign() {
    appUI.poemElement.innerText = 'Loading...';
}

function cancelMadlibs() {
    appUI.titleHeader.style.fontFamily = 'Italianno';
    appUI.titleHeader.innerText = 'Go ahead...';

    if (!typeStatus.typing) {
        appUI.poemElement.innerText = 'Enter an author or get a random poem!';
    }
    
    appUI.randomButton.style.display = 'block';
    appUI.enterButton.style.display = 'block';
    appUI.madlibsButton.style.display = 'block';

    appUI.poemNum.style.visibility = 'visible';
    appUI.poemNum.innerText = '';

    appUI.lineLimit.element.style.visibility = 'visible';
    appUI.lineLimit.value = appUI.lineLimit.storage;

    appUI.cancelButton.style.display = 'none';
    appUI.goButton.style.display = 'none';

    appUI.inputAuthor.placeholder = 'a famous poet...';
    appUI.inputAuthor.type = 'text';
    appUI.inputAuthor.setAttribute('list', 'datalist');
    appUI.inputAuthor.style.removeProperty('width');
}

function openLineLimit() {
    appUI.lineLimit.element.onclick = '';
    appUI.lineLimit.element.innerText = 'Line limit: '
    const input = document.createElement('input');
    input.style.width = '5vw';
    if (+appUI.lineLimit.value) input.value = appUI.lineLimit.value;
    input.setAttribute('type', 'number');
    appUI.lineLimit.element.appendChild(input);
    input.focus();
    input.addEventListener('blur', () => {
        appUI.lineLimit.value = input.value;
        input.remove()
        if (!+appUI.lineLimit.value) {
            appUI.lineLimit.element.innerText = 'Line limit: none';
            appUI.lineLimit.value = 0;
        } else if (appUI.lineLimit.value > 999) {
            appUI.lineLimit.element.innerText = 'Line limit: 999';
            appUI.lineLimit.value = 999;
        } else {
            appUI.lineLimit.element.innerText = 'Line limit: ' + appUI.lineLimit.value;
        }
    })
    appUI.lineLimit.element.onclick = openLineLimit;
}

makeDatalist();
