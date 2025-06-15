let elementoArrastado = null;

function aoIniciarArrasto(e) {
  elementoArrastado = e.target;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", e.target.outerHTML);
}
function aoTerminarArrasto(e) {
  elementoArrastado = null;
}
function aoArrastarSobre(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.style.transform = "scale(1.02)";
}
function aoSairZona(e) {
  e.currentTarget.style.transform = "scale(1)";
}
function aoSoltar(e) {
  e.preventDefault();
  e.currentTarget.style.transform = "scale(1)";
  if (elementoArrastado) {
    const novaImg = elementoArrastado.cloneNode(true);
    adicionarListenersArrasto(novaImg);
    e.currentTarget.appendChild(novaImg);
    elementoArrastado.remove();
  }
}

function adicionarListenersArrasto(elemento) {
  elemento.addEventListener("dragstart", aoIniciarArrasto);
  elemento.addEventListener("dragend", aoTerminarArrasto);
  adicionarMenuContexto(elemento);

  elemento.addEventListener("click", function () {
    imagemAtualModal = this;
  });
}

function inicializarDragDrop() {
  const arrastaveis = document.querySelectorAll(".tier-img");
  const zonasDrop = document.querySelectorAll(".drop-zone");
  const gradeImagens = document.getElementById("image-grid");

  arrastaveis.forEach(adicionarListenersArrasto);

  zonasDrop.forEach((zona) => {
    zona.addEventListener("dragover", aoArrastarSobre);
    zona.addEventListener("dragleave", aoSairZona);
    zona.addEventListener("drop", aoSoltar);
    zona.addEventListener("drop", () => {
      zona.style.boxShadow = "0 0 30px #ffffff";
      setTimeout(() => {
        zona.style.boxShadow = "";
      }, 200);
    });
  });

  gradeImagens.addEventListener("dragover", aoArrastarSobre);
  gradeImagens.addEventListener("dragleave", aoSairZona);
  gradeImagens.addEventListener("drop", aoSoltar);
}

// Chame a inicialização após o carregamento da página
window.addEventListener("DOMContentLoaded", inicializarDragDrop);
// Se as imagens são carregadas dinamicamente, chame inicializarDragDrop() após carregar as imagens!
