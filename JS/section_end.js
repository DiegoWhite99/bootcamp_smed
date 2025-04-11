document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll('.step');
    const audio = document.getElementById('pop-sound');
    let audioUnlocked = false;

    function unlockAudio() {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audioUnlocked = true;
      }).catch(() => {
        console.log("Audio bloqueado, esperando interacción.");
      });
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    }

    document.addEventListener("click", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          if (audioUnlocked) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Error al reproducir:", e));
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    steps.forEach(step => observer.observe(step));
  });
