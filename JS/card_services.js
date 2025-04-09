const track = document.querySelector('.slider-track');
const cards = document.querySelectorAll('.card');
const dots = document.querySelectorAll('.dot');
const btnLeft = document.querySelector('.slider-btn.left');
const btnRight = document.querySelector('.slider-btn.right');

let index = 0;

function updateSlider() {
  const offset = cards[0].offsetWidth + 16; // ancho + margen
  track.style.transform = `translateX(-${index * offset}px)`;
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
}

btnLeft.addEventListener('click', () => {
  index = Math.max(index - 1, 0);
  updateSlider();
});

btnRight.addEventListener('click', () => {
  index = Math.min(index + 1, cards.length - 1);
  updateSlider();
});

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    index = i;
    updateSlider();
  });
});