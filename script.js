const words = ["a Developer", "a Web Developer", "a Designer", "a Creative Thinker"];
let currentWordIndex = 0;
let charIndex = 0;
const typingElement = document.querySelector('.typing-animation');

function type() {
    if (charIndex < words[currentWordIndex].length) {
        typingElement.textContent += words[currentWordIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, 100);
    } else {
        setTimeout(erase, 2000);
    }
}

function erase() {
    if (charIndex > 0) {
        typingElement.textContent = words[currentWordIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, 100);
    } else {
        currentWordIndex = (currentWordIndex + 1) % words.length;
        setTimeout(type, 500);
    }
}

document.addEventListener('DOMContentLoaded', type);
