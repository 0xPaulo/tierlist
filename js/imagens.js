// Configurações das tier lists disponíveis
const tierLists = {
  nes: {
    pasta: "nes",
    total: 685,
    formato: "jpg",
  },
  genesis: {
    pasta: "genesis",
    total: 200, // ajuste conforme necessário
    formato: "jpg",
  },
};

async function carregarImagens(tierType = "pugo") {
  const gradeImagens = document.getElementById("image-grid");
  const config = tierLists[tierType];

  if (!config) {
    console.error("Tier list não encontrada:", tierType);
    return;
  }

  // Limpa imagens existentes
  gradeImagens.innerHTML = "";

  // Também limpa as tier lists
  document.querySelectorAll(".drop-zone").forEach((zona) => {
    zona.innerHTML = "";
  });

  const formatos = ["jpg", "jpeg", "png", "gif", "webp"];

  for (let i = 1; i <= config.total; i++) {
    let carregada = false;
    for (let formato of [
      config.formato,
      ...formatos.filter((f) => f !== config.formato),
    ]) {
      await new Promise((resolve) => {
        const img = document.createElement("img");
        img.src = `gamelis/${config.pasta}/img${i
          .toString()
          .padStart(3, "0")}.${formato}`;
        img.setAttribute("data-id", `img${i.toString().padStart(3, "0")}`);
        img.className = "tier-img";
        img.draggable = true;
        img.alt = `Item ${i}`;

        img.onload = function () {
          if (!carregada) {
            gradeImagens.appendChild(img);
            adicionarListenersArrasto(img);
            carregada = true;
          }
          resolve();
        };
        img.onerror = function () {
          resolve();
        };
      });
      if (carregada) break;
    }
  }
}

function alterarTierList() {
  const select = document.getElementById("tier-select");
  const tierSelecionada = select.value;

  tierListAtual = tierSelecionada;

  // Adiciona efeito de loading (opcional)
  const gradeImagens = document.getElementById("image-grid");
  gradeImagens.innerHTML =
    '<p style="text-align: center; color: #fff;">Carregando...</p>';

  carregarImagens(tierSelecionada);
}

window.addEventListener("load", () => {
  // Seleciona a primeira tier disponível
  const select = document.getElementById("tier-select");
  const primeiraTier = Object.keys(tierLists)[0];
  if (select) select.value = primeiraTier;
  tierListAtual = primeiraTier;
  carregarImagens(primeiraTier);
});

//ajuste daqui para frente

function importarTierlist(arquivo) {
  const leitor = new FileReader();

  leitor.onload = async function (e) {
    const estadoCompleto = JSON.parse(e.target.result);

    // Pega o tipo da tier list do arquivo importado
    const tierType = estadoCompleto.tierType || "nes";
    const config = tierLists[tierType] || tierLists["nes"];

    // Atualiza o select e carrega as imagens corretas
    const select = document.getElementById("tier-select");
    if (select) select.value = tierType;
    tierListAtual = tierType;

    // DEVOLVE todas as imagens das zonas para o grid antes de limpar
    const gradeImagens = document.getElementById("image-grid");
    document.querySelectorAll(".drop-zone img").forEach((img) => {
      gradeImagens.appendChild(img);
    });

    // Limpa as tier lists
    document.querySelectorAll(".drop-zone").forEach((zona) => {
      zona.innerHTML = "";
    });

    // Carrega todas as imagens da grade
    await carregarImagens(tierType);

    // Aguarda um pequeno tempo para garantir que o DOM foi atualizado
    setTimeout(() => {
      // Agora, coloca as imagens nas zonas corretas
      const zonas = document.querySelectorAll(".drop-zone");
      estadoCompleto.estado.forEach((tier) => {
        const zona = zonas[tier.zone];
        tier.images.forEach((id) => {
          // Procura a imagem na grade
          const img = document.querySelector(`#image-grid [data-id="${id}"]`);
          if (img) {
            zona.appendChild(img);
          }
        });
      });
    }, 50); // 50ms geralmente é suficiente, ajuste se necessário
  };

  leitor.readAsText(arquivo);
}

function exportarTierlist() {
  const zonas = document.querySelectorAll(".drop-zone");
  const estado = [];

  zonas.forEach((zona, idxZona) => {
    const imgs = zona.querySelectorAll("img");
    const ids = Array.from(imgs).map((img) => img.getAttribute("data-id"));
    estado.push({ zone: idxZona, images: ids });
  });

  // Salva também o tipo da tier list atual
  const tierType = typeof tierListAtual !== "undefined" ? tierListAtual : "nes";
  const exportar = { tierType, estado };

  // Gera data/hora no formato YYYYMMDD-HHMMSS
  const agora = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const dataStr =
    agora.getFullYear() +
    pad(agora.getMonth() + 1) +
    pad(agora.getDate()) +
    "-" +
    pad(agora.getHours()) +
    pad(agora.getMinutes()) +
    pad(agora.getSeconds());

  // Nome do arquivo: tierlist-{tipo}-{data}.json
  const nomeArquivo = `tierlist-${tierType}-${dataStr}.json`;

  const blob = new Blob([JSON.stringify(exportar)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}
