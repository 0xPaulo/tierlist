// Variáveis para controle de posição
let isDragging = false;
let startX, startY, initialLeft, initialTop;
const draggableModal = document.getElementById("draggableModal");
const modalButtonsRight = document.getElementById("modalButtonsRight");

// Função para mover modal e botões
function moveModal(x, y) {
  const modal = document.querySelector(".modal-content-pai");
  const buttons = document.querySelector(".modal-buttons-right");

  // Obtém posição atual
  const rect = modal.getBoundingClientRect();
  const currentX = rect.left + rect.width / 2;
  const currentY = rect.top + rect.height / 2;

  // Calcula nova posição
  const newX = currentX + x;
  const newY = currentY + y;

  // Move o modal
  modal.style.left = `${newX}px`;
  modal.style.top = `${newY}px`;
  modal.style.transform = "none";

  // Ajusta posição dos botões right
  const windowCenterY = window.innerHeight / 2;
  const buttonsRect = buttons.getBoundingClientRect();
  const buttonsHeight = buttonsRect.height;

  // Mantém os botões alinhados verticalmente com o modal
  buttons.style.top = `${newY - buttonsHeight / 2}px`;
  buttons.style.right = "20px";
}

// Reset de posição
function resetModalPosition() {
  const modal = document.querySelector(".modal-content-pai");
  const buttons = document.querySelector(".modal-buttons-right");

  modal.style.position = "absolute";
  modal.style.left = "50%";
  modal.style.top = "50%";
  modal.style.transform = "translate(-50%, -50%)";

  buttons.style.top = "50%";
  buttons.style.transform = "translateY(-50%)";
}

// Eventos de arrasto melhorados
draggableModal.addEventListener("mousedown", (e) => {
  // Ignora se clicar nos controles
  if (
    e.target.classList.contains("close-modal") ||
    e.target.classList.contains("position-btn")
  ) {
    return;
  }

  // Só arrasta com botão esquerdo
  if (e.button !== 0) return;

  isDragging = true;
  draggableModal.classList.add("dragging");

  const rect = draggableModal.getBoundingClientRect();
  startX = e.clientX;
  startY = e.clientY;
  initialLeft = rect.left;
  initialTop = rect.top;

  // Muda para posição fixed durante o arrasto
  draggableModal.style.position = "fixed";
  draggableModal.style.left = `${rect.left}px`;
  draggableModal.style.top = `${rect.top}px`;
  draggableModal.style.transform = "none";

  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  // Move o modal
  draggableModal.style.left = `${initialLeft + dx}px`;
  draggableModal.style.top = `${initialTop + dy}px`;

  // Move os botões junto (mantendo offset direito)
  const buttonsRect = modalButtonsRight.getBoundingClientRect();
  const buttonsHeight = buttonsRect.height;
  modalButtonsRight.style.top = `${
    initialTop + dy - buttonsHeight / 2 + draggableModal.offsetHeight / 2
  }px`;
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    draggableModal.classList.remove("dragging");
  }
});

// Permite mover com botão direito nos controles (já implementado no HTML)
