/* Loader */
window.addEventListener("load", () => {
    setTimeout(() => {
        document.getElementById("loader").classList.add("loaded");
    }, 1700);
});


/* Typing Animation */

const words = [
    "a form of discipline.",
    "the ultimate sophistication.",
    "how it works.",
    "saying no to a thousand things.",
    "an act of care.",
    "structured clarity."
];


let wordIndex = 0;
let charIndex = 0;
const typing = document.getElementById("typing");

function type() {
    if (charIndex < words[wordIndex].length) {
        typing.textContent += words[wordIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, 40);
    } else {
        setTimeout(erase, 1800);
    }
}

function erase() {
    if (charIndex > 0) {
        typing.textContent = words[wordIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, 25);
    } else {
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 400);
    }
}

type();