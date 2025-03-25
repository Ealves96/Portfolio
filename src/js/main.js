/* filepath: /home/ealves/Documents/docs_elie/portfolio/portfolio-website/src/js/main.js */
document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des animations AOS
    AOS.init({
        duration: 800,
        easing: 'ease-out',
        once: true
    });

    // Curseur personnalisé
    const cursor = document.querySelector('.cursor');
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Animation des skills
    const skills = document.querySelectorAll('.skill');
    skills.forEach(skill => {
        const level = skill.getAttribute('data-level');
        skill.style.setProperty('--level', `${level}%`);
    });
});