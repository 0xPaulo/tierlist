async function carregarImagens() {
  const gradeImagens = document.getElementById("image-grid");
  const formatos = ["jpg", "jpeg", "png", "gif", "webp"];

  for (let i = 1; i <= 685; i++) {
    for (let formato of formatos) {
      const img = document.createElement("img");
      img.src = `comprimidas/img${i.toString().padStart(3, "0")}.jpg`;
      img.setAttribute("data-id", `img${i.toString().padStart(3, "0")}`);
      img.className = "tier-img";
      img.draggable = true;
      img.alt = `Item ${i}`;

      img.onload = function () {
        gradeImagens.appendChild(img);
        adicionarListenersArrasto(img);
      };

      img.onerror = function () {};
      break;
    }
  }
}

window.addEventListener("load", carregarImagens);