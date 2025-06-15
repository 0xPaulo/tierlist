const tierMapping = {
  INSANO: "elite",
  MASSA: "massa",
  LEGAL: "legal",
  PAIA: "paia",
  BUCHA: "bucha",
};

function moverImagemParaTier(tierNome) {
  if (!imagemAtualModal) return;

  const tierData = tierMapping[tierNome];
  const zonaDestino = document.querySelector(`[data-tier="${tierData}"]`);

  if (!zonaDestino) return;

  const novaImg = imagemAtualModal.cloneNode(true);
  adicionarListenersArrasto(novaImg);
  zonaDestino.appendChild(novaImg);
  imagemAtualModal.remove();

  zonaDestino.style.boxShadow = "0 0 30px #00ffff";
  setTimeout(() => {
    zonaDestino.style.boxShadow = "";
  }, 300);

  fecharModalImagem();
  imagemAtualModal = null;
}

function inicializarMoverTier() {
  const botoesModal = document.querySelectorAll(".modal-buttons-right button");
  botoesModal.forEach((botao) => {
    botao.addEventListener("click", function (e) {
      e.stopPropagation();
      const tierNome = this.textContent.trim();
      moverImagemParaTier(tierNome);
    });
  });
}

document.addEventListener("DOMContentLoaded", inicializarMoverTier);
