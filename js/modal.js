let imagemAtualModal = null;

function abrirModalImagem(srcImagem, imgElement = null) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const modalButtons = document.querySelector(".modal-buttons-right");

  modal.style.display = "block";
  modalImg.src = srcImagem;
  document.body.style.overflow = "hidden";
  if (modalButtons) modalButtons.style.display = "flex";

  if (imgElement) {
    imagemAtualModal = imgElement;
  }

  if (!modal._hasListener) {
    modal.addEventListener("click", (e) => {
      if (e.target.classList.contains("image-modal")) {
        fecharModalImagem();
      }
    });
    modal._hasListener = true;
  }
}

function fecharModalImagem() {
  const modal = document.getElementById("imageModal");
  const modalButtons = document.querySelector(".modal-buttons-right");
  modal.style.display = "none";
  document.body.style.overflow = "auto";
  if (modalButtons) modalButtons.style.display = "none";
  imagemAtualModal = null;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") fecharModalImagem();
});

function adicionarMenuContexto(img) {
  img.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    abrirModalImagem(img.src, img);
  });
}