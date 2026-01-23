const track = document.querySelector("#hero-carousel2 .carousel-track");
let speed = -0.4; // 👈 controla la elegancia (0.2 muy lento, 0.6 normal), negativo para izquierda
let position = 0;

// Duplicamos el contenido para loop infinito
track.innerHTML += track.innerHTML;

const trackWidth = track.scrollWidth / 2;

function animate() {
  position += speed;

  // cuando llega a la mitad, invierte la dirección
  if (position <= -trackWidth) {
    speed = -speed;
  } else if (position >= trackWidth) {
    speed = -speed;
  }

  track.style.transform = `translateX(${position}px)`;
  requestAnimationFrame(animate);
}

animate();
