const slider = document.getElementById('sliderTrack');
const cardWidth = 320; // ancho estimado de una card con margen

function moveSlide(direction) {
  slider.scrollLeft += direction * cardWidth;
}

// Auto-scroll cada 5 segundos
setInterval(() => {
  moveSlide(1);
  if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth) {
    slider.scrollLeft = 0;
  }
}, 600000);