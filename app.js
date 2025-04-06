const poemElement = document.getElementById('poetry');
const poemNum = document.getElementById('num');
let poemTitle = '';
const usedPoems = [];

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
        let poemCount = json.length; // count of all the returned poems

        do {
            let random = Math.floor(Math.random() * poemCount);
            poemTitle = json[random].title;
        } while (usedPoems.contains(poemTitle));
        usedPoems.push(poemTitle);
        
        displayTitle();
        let poemAuthor = json[random].author;

        let poemLines = json[random].lines;

        typeText(poemLines);

            poemNum.innerText = `${random + 1} of ${poemCount} (${poemAuthor})`;
    } catch (error) {
        console.error('Fetch error:', error);
        poemElement.innerText = 'Failed to load poem';
    }
}


let timerId;
let currentlyTyping = false;

function typeText(poemLines) {
    let print = '';
    let lineIndex = 0;
    let charIndex = 0;
    let variedSpeed = Math.floor(Math.random() * (60 - 50 + 1) + 50);
    function type() {
        if (lineIndex < poemLines.length) {
            currentlyTyping = true;
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
            poemElement.innerText = print;

            timerId = setTimeout(type, variedSpeed);
            variedSpeed = Math.floor(Math.random() * (60 - 50 + 1) + 50);
        }
    }
    type();
    currentlyTyping = false;
}

function pickRandomAuthor() {
    let length = datalistAuthors.length;
    let random = Math.floor( Math.random() * length );
    return datalistAuthors[random];
}
async function randomPress() {
    if (currentlyTyping) clearTimeout(timerId);
    const randomButton = document.getElementById('random');
    randomButton.style.visibility = 'hidden';
    await getPoem();
    randomButton.style.visibility = 'visible';
}
function displayTitle() {
    let titleHeader = document.getElementById('poem-title');
    titleHeader.innerText = poemTitle;
}

function lookPoet() {
    if (currentlyTyping) clearTimeout(timerId);
    let input = document.getElementById('author');
    let userEntry = input.value;
    getPoem(userEntry);
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

let appUI = {
    randomButton: document.getElementById('random'),
    enterButton: document.getElementById('submit'),
    madlibsButton: document.getElementById('madlibs'),
    goButton: document.createElement('button'),
    cancelButton: document.createElement('button'),
    inputAuthor: document.getElementById('author'),
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
