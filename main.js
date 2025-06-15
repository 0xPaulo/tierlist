// =======================
// 1. EFEITO VISUAL: PARTÍCULAS
// =======================

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

// Cria partículas animadas periodicamente
setInterval(criarParticula, 300);

// =======================
// 2. DRAG & DROP DAS IMAGENS
// =======================

// --- Variáveis globais para drag & drop
let elementoArrastado = null;
const arrastaveis = document.querySelectorAll(".tier-img");
const zonasDrop = document.querySelectorAll(".drop-zone");
const gradeImagens = document.getElementById("image-grid");

// --- Funções de drag & drop
function aoIniciarArrasto(e) {
  elementoArrastado = e.target;
  e.target.style.opacity = "0.5";
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", e.target.outerHTML);
}

function aoTerminarArrasto(e) {
  e.target.style.opacity = "1";
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

// --- Utilitário: adiciona listeners de arrasto e menu de contexto em uma imagem
function adicionarListenersArrasto(elemento) {
  elemento.addEventListener("dragstart", aoIniciarArrasto);
  elemento.addEventListener("dragend", aoTerminarArrasto);
  adicionarMenuContexto(elemento);
}

// --- Aplica listeners em todas imagens e zonas
arrastaveis.forEach(adicionarListenersArrasto);

zonasDrop.forEach((zona) => {
  zona.addEventListener("dragover", aoArrastarSobre);
  zona.addEventListener("dragleave", aoSairZona);
  zona.addEventListener("drop", aoSoltar);
  // Efeito visual ao soltar imagem
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

// =======================
// 3. CARREGAMENTO DAS IMAGENS
// =======================

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

      // Não faz nada no erro, pois só tenta o primeiro formato
      img.onerror = function () {};

      break;
    }
  }
}

window.addEventListener("load", carregarImagens);

// =======================
// 4. MODAL DE IMAGEM AMPLIADA
// =======================

// --- Abre o modal de imagem ampliada
function abrirModalImagem(srcImagem) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");

  modal.style.display = "block";
  modalImg.src = srcImagem;
  document.body.style.overflow = "hidden";

  // Adiciona o listener de clique fora do modal (apenas uma vez)
  if (!modal._hasListener) {
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("image-modal")) {
        fecharModalImagem();
      }
    });
    modal._hasListener = true;
  }
}

// --- Fecha o modal
function fecharModalImagem() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

// --- Fecha modal ao pressionar ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    fecharModalImagem();
  }
});

// --- Adiciona menu de contexto para abrir imagem ampliada
function adicionarMenuContexto(img) {
  img.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    abrirModalImagem(img.src);
  });
}

  
// --- Aplica menu de contexto em todas imagens com a classe "tier-img"
const img = document.getElementsByClassName("tier-img");
for (let i = 0; i < img.length; i++) {
  adicionarMenuContexto(img[i]);
}

// =======================
// 5. IMPORTAÇÃO E EXPORTAÇÃO DA TIERLIST
// =======================

// --- Importa tierlist de arquivo JSON e distribui imagens nas zonas
function importarTierlist(arquivo) {
  const leitor = new FileReader();

  leitor.onload = async function (e) {
    const estado = JSON.parse(e.target.result);
    const todasImagens = {};
    const gradeImagens = document.getElementById("image-grid");
    const promessas = [];

    // Pré-carrega todas as imagens e guarda em cache
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

    // Limpa as zonas e insere as imagens importadas
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

// --- Exporta tierlist para arquivo JSON
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
