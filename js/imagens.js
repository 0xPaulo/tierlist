// Configurações das tier lists disponíveis (objeto imutável)
const tierLists = Object.freeze({
  nes: { pasta: "nes", total: 685, formato: "jpg" },
  genesis: { pasta: "genesis", total: 702, formato: "jpg" },
  pcEngine: { pasta: "pcEngine", total: 173, formato: "jpg" },
});

// Cache de elementos DOM
const domCache = {
  gradeImagens: document.getElementById("image-grid"),
  select: document.getElementById("tier-select"),
  zonas: document.querySelectorAll(".drop-zone"),
};

// Formatos de imagem suportados (ordenados por prioridade)
const FORMATOS_IMAGEM = ["jpg", "jpeg", "png", "gif", "webp"];

const TAMANHO_LOTE = 50; // Ajuste conforme necessário

async function carregarImagens(tierType = "nes") {
  const config = tierLists[tierType];

  if (!config) {
    console.error("Tier list não encontrada:", tierType);
    return;
  }

  // Limpeza inicial
  domCache.gradeImagens.innerHTML = "";
  domCache.zonas.forEach((zona) => {
    zona.innerHTML = "";
  });

  let i = 1;
  while (i <= config.total) {
    const promises = [];
    for (let j = 0; j < TAMANHO_LOTE && i <= config.total; j++, i++) {
      promises.push(carregarImagem(i, config));
    }
    await Promise.all(promises); // Aguarda o lote terminar
    // Opcional: pode adicionar um pequeno delay aqui para suavizar ainda mais
  }
}

async function carregarImagem(i, config) {
  const id = `img${i.toString().padStart(3, "0")}`;

  // Tenta os formatos em ordem de prioridade
  for (const formato of [
    config.formato,
    ...FORMATOS_IMAGEM.filter((f) => f !== config.formato),
  ]) {
    try {
      const img = await criarElementoImagem(
        id,
        `${config.pasta}/${id}.${formato}`
      );
      domCache.gradeImagens.appendChild(img);
      adicionarListenersArrasto(img);
      return; // Sai ao primeiro sucesso
    } catch (e) {
      continue; // Tenta o próximo formato
    }
  }
}

function criarElementoImagem(id, src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `gamelis/${src}`;
    img.dataset.id = id;
    img.className = "tier-img";
    img.draggable = true;
    img.alt = `Item ${id}`;

    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

function alterarTierList() {
  const tierSelecionada = domCache.select.value;
  tierListAtual = tierSelecionada;

  // Feedback visual imediato
  domCache.gradeImagens.innerHTML = '<div class="loading">Carregando...</div>';

  carregarImagens(tierSelecionada);
}

// Inicialização
window.addEventListener("DOMContentLoaded", () => {
  const primeiraTier = Object.keys(tierLists)[0];
  if (domCache.select) domCache.select.value = primeiraTier;
  tierListAtual = primeiraTier;
  carregarImagens(primeiraTier);
});

// Funções de import/export otimizadas
async function importarTierlist(arquivo) {
  const estadoCompleto = JSON.parse(await arquivo.text());
  const tierType = estadoCompleto.tierType || "nes";

  // Atualiza UI
  if (domCache.select) domCache.select.value = tierType;
  tierListAtual = tierType;

  // Limpeza e recarga
  domCache.zonas.forEach((zona) => (zona.innerHTML = ""));
  await carregarImagens(tierType);

  // Processamento assíncrono sem setTimeout
  requestAnimationFrame(() => {
    estadoCompleto.estado.forEach((tier, idxZona) => {
      tier.images.forEach((id) => {
        const img = domCache.gradeImagens.querySelector(`[data-id="${id}"]`);
        if (img && domCache.zonas[idxZona]) {
          domCache.zonas[idxZona].appendChild(img);
        }
      });
    });
  });
}

function exportarTierlist() {
  const dataStr = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const nomeArquivo = `tierlist-${tierListAtual || "nes"}-${dataStr}.json`;

  const estado = Array.from(domCache.zonas).map((zona, idxZona) => ({
    zone: idxZona,
    images: Array.from(zona.querySelectorAll("img")).map(
      (img) => img.dataset.id
    ),
  }));

  downloadJSON(
    {
      tierType: tierListAtual || "nes",
      estado,
    },
    nomeArquivo
  );
}

// Helper function
function downloadJSON(data, filename) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(data)], { type: "application/json" })
  );
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 100);
}
