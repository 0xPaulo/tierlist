// Variáveis para controle de posição
let isDragging = false;
let startX,
  startY,
  initialModalLeft,
  initialModalTop,
  initialButtonsLeft,
  initialButtonsTop;
const draggableModal = document.getElementById("draggableModal");
const modalButtonsRight = document.getElementById("modalButtonsRight");

// Reset de posição
function resetModalPosition() {
  draggableModal.style.position = "absolute";
  draggableModal.style.left = "50%";
  draggableModal.style.top = "50%";
  draggableModal.style.transform = "translate(-50%, -50%)";

  modalButtonsRight.style.position = "fixed";
  modalButtonsRight.style.right = "20%";
  modalButtonsRight.style.left = "auto";
  modalButtonsRight.style.top = "50%";
  modalButtonsRight.style.transform = "translateY(-50%)";
}

// Função para verificar limites da tela
function constrainToViewport(element, x, y) {
  const rect = element.getBoundingClientRect();

  // Limites horizontais
  x = Math.max(0, Math.min(window.innerWidth - rect.width, x));

  // Limites verticais
  y = Math.max(0, Math.min(window.innerHeight - rect.height, y));

  return { x, y };
}

// Eventos de arrasto
draggableModal.addEventListener("mousedown", (e) => {
  if (e.target.closest(".close-modal, .position-btn")) return;
  if (e.button !== 0) return;

  isDragging = true;
  draggableModal.classList.add("dragging");

  // Captura posições iniciais
  const modalRect = draggableModal.getBoundingClientRect();
  const buttonsRect = modalButtonsRight.getBoundingClientRect();

  startX = e.clientX;
  startY = e.clientY;
  initialModalLeft = modalRect.left;
  initialModalTop = modalRect.top;
  initialButtonsLeft = buttonsRect.left;
  initialButtonsTop = buttonsRect.top;

  // Prepara para arrasto
  draggableModal.style.position = "fixed";
  draggableModal.style.left = `${modalRect.left}px`;
  draggableModal.style.top = `${modalRect.top}px`;
  draggableModal.style.transform = "none";

  modalButtonsRight.style.position = "fixed";
  modalButtonsRight.style.left = `${buttonsRect.left}px`;
  modalButtonsRight.style.top = `${buttonsRect.top}px`;
  modalButtonsRight.style.right = "auto";
  modalButtonsRight.style.transform = "none";

  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  // Calcula deslocamento
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  // Calcula novas posições do modal
  let newModalLeft = initialModalLeft + dx;
  let newModalTop = initialModalTop + dy;

  // Aplica restrições ao modal
  const constrainedModal = constrainToViewport(
    draggableModal,
    newModalLeft,
    newModalTop
  );
  newModalLeft = constrainedModal.x;
  newModalTop = constrainedModal.y;

  // Aplica ao modal
  draggableModal.style.left = `${newModalLeft}px`;
  draggableModal.style.top = `${newModalTop}px`;

  // Calcula posição dos botões (mantendo offset relativo)
  const buttonsWidth = modalButtonsRight.offsetWidth;
  let newButtonsLeft = newModalLeft + draggableModal.offsetWidth + 95; // 100px de distância
  let newButtonsTop =
    newModalTop +
    draggableModal.offsetHeight / 2 -
    modalButtonsRight.offsetHeight / 2;

  // Verifica se os botões cabem à direita
  if (newButtonsLeft + buttonsWidth > window.innerWidth) {
    // Se não couber à direita, coloca à esquerda
    newButtonsLeft = newModalLeft - buttonsWidth - 80; // 100px de distância
  }

  // Aplica restrições aos botões
  const constrainedButtons = constrainToViewport(
    modalButtonsRight,
    newButtonsLeft,
    newButtonsTop
  );

  // Aplica aos botões
  modalButtonsRight.style.left = `${constrainedButtons.x}px`;
  modalButtonsRight.style.top = `${constrainedButtons.y}px`;
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    draggableModal.classList.remove("dragging");

    // Mantém posição atual mas converte para absoluto/fixo
    const modalRect = draggableModal.getBoundingClientRect();
    const buttonsRect = modalButtonsRight.getBoundingClientRect();

    draggableModal.style.position = "absolute";
    draggableModal.style.left = `${modalRect.left}px`;
    draggableModal.style.top = `${modalRect.top}px`;

    modalButtonsRight.style.position = "fixed";
    modalButtonsRight.style.left = `${buttonsRect.left}px`;
    modalButtonsRight.style.top = `${buttonsRect.top}px`;
  }
});
