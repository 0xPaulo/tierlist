function criarParticula() {
  const particula = document.createElement("div");
  particula.className = "particle";
  particula.style.left = Math.random() * 100 + "vw";
  particula.style.backgroundColor = [
    "#ff00ff",
    "#00ffff",
    "#ffff00",
    "#ff0080",
  ][Math.floor(Math.random() * 4)];
  document.body.appendChild(particula);

  setTimeout(() => {
    particula.remove();
  }, 4000);
}
setInterval(criarParticula, 300);
