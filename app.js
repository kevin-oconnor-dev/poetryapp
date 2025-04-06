const usedPoems = [];
const appUI = {
    randomButton: document.getElementById('random'),
    enterButton: document.getElementById('submit'),
    madlibsButton: document.getElementById('madlibs'),
    goButton: document.createElement('button'),
    cancelButton: document.createElement('button'),
    inputAuthor: document.getElementById('author'),
    poemElement: document.getElementById('poetry'),
    poemNum: document.getElementById('num'),
}
const typeStatus = {
    timerId: null,
    typing: false,
}

async function getPoem(author) {
    if (!author) {
        if (!datalistAuthors) {
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

        let random = 0;
        let poemTitle = '';
        do {
            random = Math.floor(Math.random() * poemCount);
            poemTitle = json[random].title;
        } while (usedPoems.includes(poemTitle));
        usedPoems.push(poemTitle);
        
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
        console.error('Fetch error:', error);
        appUI.poemElement.innerText = 'Failed to load poem';
    }
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
    let titleHeader = document.getElementById('poem-title');
    titleHeader.innerText = poemObj.title;
}

function typeText(poemLines) {
    let print = '';
    let lineIndex = 0;
    let charIndex = 0;
    let variedSpeed = Math.floor(Math.random() * (60 - 50 + 1) + 50);
    function type() {
        if (lineIndex < poemLines.length) {
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
                variedSpeed = 300;
            }
            appUI.poemElement.innerText = print;

            typeStatus.timerId = setTimeout(type, variedSpeed);
            variedSpeed = Math.floor(Math.random() * (60 - 50 + 1) + 50);
        }
    }
    type();
    typeStatus.typing = false;
}

function pickRandomAuthor() {
    let length = datalistAuthors.length;
    let random = Math.floor( Math.random() * length );
    return datalistAuthors[random];
}
async function randomPress() {
    if (typeStatus.typing) clearTimeout(typeStatus.timerId);
    const randomButton = appUI.randomButton;
    randomButton.style.visibility = 'hidden';
    let poemObj = await getPoem();
    buildPoem(poemObj);
    randomButton.style.visibility = 'visible';
}

// appUI.enterButton.addEventListener('click', runPoetryMachine);
async function runPoetryMachine() {
    if (typeStatus.typing) clearTimeout(typeStatus.timerId);
    let input = document.getElementById('author');
    let userEntry = input.value;
    let poemObj = await getPoem(userEntry);
    buildPoem(poemObj);
    input.value = '';
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
        console.error('All authors fetch error:', error);
    }
}

const datalist = document.getElementById('datalist');
let datalistAuthors = [];

async function makeDatalist() {
    let authors = await getAllAuthors();
    for (let author of authors) {
        let option = document.createElement('option');
        option.value = author;
        datalist.appendChild(option);
        datalistAuthors.push(author);
    }
}

function runMadlibs() {
    createMadlibsUI();
}
function createMadlibsUI() {
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
}

function buildMadlibsPoem() {
    let lineNum = appUI.inputAuthor.value;
    for (let i = 0; i <= lineNum; i++) {
        let poem = getPoem()
        let lineLength = poem.lines;
    }

}

function cancelMadlibs() {
    appUI.randomButton.style.display = 'block';
    appUI.enterButton.style.display = 'block';
    appUI.madlibsButton.style.display = 'block';
    appUI.cancelButton.style.display = 'none';
    appUI.goButton.style.display = 'none';
    appUI.inputAuthor.placeholder = 'a famous poet...';
    appUI.inputAuthor.type = 'text';
    appUI.inputAuthor.setAttribute('list', 'datalist');
    appUI.inputAuthor.style.removeProperty('width');
}
makeDatalist();
