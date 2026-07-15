// MENÚ RESPONSIVE

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("nav");
const menuIcon = menuToggle.querySelector("i");

menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");

    if (nav.classList.contains("active")) {
        menuIcon.classList.remove("fa-bars");
        menuIcon.classList.add("fa-xmark");
    } else {
        menuIcon.classList.remove("fa-xmark");
        menuIcon.classList.add("fa-bars");
    }
});


// Cerrar menú al seleccionar una opción

const enlacesMenu = document.querySelectorAll("nav a");

enlacesMenu.forEach(enlace => {
    enlace.addEventListener("click", () => {
        nav.classList.remove("active");

        menuIcon.classList.remove("fa-xmark");
        menuIcon.classList.add("fa-bars");
    });
});


// Subir la página al inicio al cargar

window.addEventListener("load", () => {
    window.scrollTo(0, 0);
});