const poemElement = document.getElementById('poetry');
const poemNum = document.getElementById('num');
let poemTitle = '';

async function getPoem(author) {
    if (!author) {
        await makeDatalist();
        author = pickRandomAuthor();
    } 
    let url = `https://poetrydb.org/author/${author}`;
    try {
        let response = await fetch(url);
        let json = await response.json();
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        let poemCount = json.length;

        let random = Math.floor(Math.random() * poemCount);
        poemTitle = json[random].title;
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

function typeText(poemLines) {
    let print = '';
    let lineIndex = 0;
    let charIndex = 0;
    let variedSpeed = Math.floor(Math.random() * (70 - 60 + 1) + 60);
    function type() {
        if (typeAllow && lineIndex < poemLines.length) {
            typeInProgress = true;
            if (charIndex < poemLines[lineIndex].length) {
                print += poemLines[lineIndex][charIndex];
                charIndex++;
            } else {
                print += '\n';
                charIndex = 0;
                lineIndex++;
                variedSpeed = Math.floor(Math.random() * (70 - 60 + 1) + 60);
            }
            poemElement.innerText = print;
            
            setTimeout(type, variedSpeed);
        }
    }
    type();
    typeInProgress = false;
}

function pickRandomAuthor() {
    let length = datalistAuthors.length;
    console.log("length: " + length);
    let random = Math.floor( Math.random() * length );
    console.log("random: " + random)
    console.log("picked author from random: " + datalistAuthors[random]);
    return datalistAuthors[random];
}
async function randomPress() {
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
console.log(datalistAuthors);

makeDatalist();

