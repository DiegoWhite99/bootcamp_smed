const slider = document.getElementById('sliderTrack');
const cardWidth = 320; // ancho estimado de una card con margen

function moveSlide(direction) {
  slider.scrollLeft += direction * cardWidth;
}

// Auto-scroll cada 3 segundos
setInterval(() => {
  if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - cardWidth) {
    // Reinicia el scroll si está al final
    slider.scrollLeft = 0;
  } else {
    moveSlide(1);
  }
}, 5000);