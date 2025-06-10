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

let elementoArrastado = null;

const arrastaveis = document.querySelectorAll(".tier-img");
const zonasDrop = document.querySelectorAll(".drop-zone");
const gradeImagens = document.getElementById("image-grid");

// Início do arrasto
function aoIniciarArrasto(e) {
  elementoArrastado = e.target;
  e.target.style.opacity = "0.5";
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", e.target.outerHTML);
}

// Fim do arrasto
function aoTerminarArrasto(e) {
  e.target.style.opacity = "1";
  elementoArrastado = null;
}

// Quando arrastando sobre uma zona
function aoArrastarSobre(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.style.transform = "scale(1.02)";
}

// Quando sai da zona
function aoSairZona(e) {
  e.currentTarget.style.transform = "scale(1)";
}

// Solta o elemento na zona
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

// Adiciona listeners de arrasto e menu de contexto
function adicionarListenersArrasto(elemento) {
  elemento.addEventListener("dragstart", aoIniciarArrasto);
  elemento.addEventListener("dragend", aoTerminarArrasto);
  adicionarMenuContexto(elemento);
}

arrastaveis.forEach(adicionarListenersArrasto);

zonasDrop.forEach((zona) => {
  zona.addEventListener("dragover", aoArrastarSobre);
  zona.addEventListener("dragleave", aoSairZona);
  zona.addEventListener("drop", aoSoltar);
});

gradeImagens.addEventListener("dragover", aoArrastarSobre);
gradeImagens.addEventListener("dragleave", aoSairZona);
gradeImagens.addEventListener("drop", aoSoltar);

zonasDrop.forEach((zona) => {
  zona.addEventListener("drop", () => {
    zona.style.boxShadow = "0 0 30px #ffffff";
    setTimeout(() => {
      zona.style.boxShadow = "";
    }, 200);
  });
});

// Carrega as imagens na grade principal
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

      img.onerror = function () {
        // Se não encontrar, tenta o próximo formato
      };

      break; // Só tenta o primeiro formato mesmo
    }
  }
}

window.addEventListener("load", carregarImagens);

// Modal de imagem
function abrirModalImagem(srcImagem) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  modal.style.display = "block";
  modalImg.src = srcImagem;
  document.body.style.overflow = "hidden"; // Previne scroll
}

function fecharModalImagem() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
  document.body.style.overflow = "auto"; // Restaura scroll
}

// Adiciona menu de contexto para expandir imagem
function adicionarMenuContexto(img) {
  img.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    abrirModalImagem(img.src);
  });
}

document.querySelectorAll(".tier-img").forEach(adicionarMenuContexto);

document.getElementById("imageModal").addEventListener("click", (e) => {
  if (e.target.classList.contains("image-modal")) {
    fecharModalImagem();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    fecharModalImagem();
  }
});

// Importa tierlist de arquivo JSON
function importarTierlist(arquivo) {
  const leitor = new FileReader();

  leitor.onload = async function (e) {
    const estado = JSON.parse(e.target.result);
    const todasImagens = {};
    const gradeImagens = document.getElementById("image-grid");

    // Pré-carrega todas as imagens e guarda em cache
    const promessas = [];

    estado.forEach((tier) => {
      tier.images.forEach((id) => {
        if (!todasImagens[id]) {
          const img = document.createElement("img");
          img.src = `comprimidas/${id}.jpg`;
          img.className = "tier-img";
          img.draggable = true;
          img.setAttribute("data-id", id);
          img.alt = id;
          adicionarListenersArrasto(img);
          todasImagens[id] = img;
          promessas.push(new Promise((resolve) => (img.onload = resolve)));
        }
      });
    });

    await Promise.all(promessas);

    // Limpa as zonas e insere as imagens
    const zonas = document.querySelectorAll(".drop-zone");
    zonas.forEach((zona) => (zona.innerHTML = ""));

    estado.forEach((tier) => {
      const zona = zonas[tier.zone];
      tier.images.forEach((id) => {
        if (todasImagens[id]) {
          const imgClonada = todasImagens[id].cloneNode(true);
          adicionarListenersArrasto(imgClonada);
          zona.appendChild(imgClonada);
        }
      });
    });

    // Remove da grade todas as imagens que já estão nas zonas
    estado.forEach((tier) => {
      tier.images.forEach((id) => {
        const img = gradeImagens.querySelector(`[data-id="${id}"]`);
        if (img) {
          img.remove();
        }
      });
    });
  };

  leitor.readAsText(arquivo);
}

// Exporta tierlist para arquivo JSON
function exportarTierlist() {
  const zonas = document.querySelectorAll(".drop-zone");
  const estado = [];

  zonas.forEach((zona, idxZona) => {
    const imgs = zona.querySelectorAll("img");
    const ids = Array.from(imgs).map((img) => img.getAttribute("data-id"));
    estado.push({ zone: idxZona, images: ids });
  });

  const blob = new Blob([JSON.stringify(estado)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tierlist.json";
  a.click();
  URL.revokeObjectURL(url);
}
