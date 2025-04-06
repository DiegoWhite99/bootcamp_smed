 // Array de IDs de los radio inputs
 const sliders = ['Slider1', 'Slider2', 'Slider3'];
 const track = document.querySelector('.carousel-track');
 const slides = Array.from(track.children);
 const nextButton = document.querySelector('.next');
 const prevButton = document.querySelector('.prev');
 let currentIndex = 0;

 function changeSlide() {
   // Desmarcar el slider actual
   document.getElementById(sliders[currentIndex]).checked = false;

   // Calcular el índice del siguiente slider
   currentIndex = (currentIndex + 1) % sliders.length;

   // Marcar el siguiente slider
   document.getElementById(sliders[currentIndex]).checked = true;
 }

 // Cambiar diapositiva cada 5 segundos
 setInterval(changeSlide, 9000);

// Función para mover el carrusel
const moveToSlide = (track, currentIndex) => {
    const amountToMove = slides[currentIndex].offsetWidth * currentIndex;
    track.style.transform = `translateX(-${amountToMove}px)`;
};

nextButton.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
        currentIndex++;
        moveToSlide(track, currentIndex);
    }
});

prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        moveToSlide(track, currentIndex);
    }
});