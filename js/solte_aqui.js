// Adiciona funcionalidade de drag and drop
const dropArea = document.getElementById("drop-area");

// Previne o comportamento padrão para os eventos
["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Adiciona efeito visual quando o arquivo está sobre a área
["dragenter", "dragover"].forEach((eventName) => {
  dropArea.addEventListener(eventName, highlight, false);
});

["dragleave", "drop"].forEach((eventName) => {
  dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
  dropArea.style.borderColor = "#0ff";
  dropArea.style.backgroundColor = "rgba(0, 255, 255, 0.1)";
}

function unhighlight() {
  dropArea.style.borderColor = "#ccc";
  dropArea.style.backgroundColor = "";
}

// Manipula o arquivo solto
dropArea.addEventListener("drop", handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const file = dt.files[0];
  if (file) {
    importarTierlist(file);
  }
}
