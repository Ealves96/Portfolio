/* filepath: /home/ealves/Documents/docs_elie/portfolio/portfolio-website/src/js/recruiter.js */
document.addEventListener('DOMContentLoaded', () => {
    new Typed('.typed-text', {
        strings: [
            "Je suis ravi(e) que vous ayez scanné mon QR code !^1000\n\n" +
            "Je suis Elie Alves, développeur passionné de l'École 42.^1000\n\n" +
            "Je vous invite à explorer mon portfolio interactif pour découvrir mes projets et compétences.^500"
        ],
        typeSpeed: 40,
        backSpeed: 0,
        fadeOut: true,
        loop: false,
        showCursor: true,
        cursorChar: '|',
        autoInsertCss: true,
    });
});

new QRCode(document.getElementById("qrcode"), {
    text: "https://votre-site.com/recruiter.html",
    width: 256,
    height: 256,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
});