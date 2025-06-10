function createParticle() {
  const particle = document.createElement("div");
  particle.className = "particle";
  particle.style.left = Math.random() * 100 + "vw";
  particle.style.backgroundColor = ["#ff00ff", "#00ffff", "#ffff00", "#ff0080"][
    Math.floor(Math.random() * 4)
  ];
  document.body.appendChild(particle);

  setTimeout(() => {
    particle.remove();
  }, 4000);
}

setInterval(createParticle, 300);

let draggedElement = null;

const draggables = document.querySelectorAll(".tier-img");
const dropZones = document.querySelectorAll(".drop-zone");
const imageGrid = document.getElementById("image-grid");

function handleDragStart(e) {
  draggedElement = e.target;
  e.target.style.opacity = "0.5";
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", e.target.outerHTML);
}

function handleDragEnd(e) {
  e.target.style.opacity = "1";
  draggedElement = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.style.transform = "scale(1.02)";
}

function handleDragLeave(e) {
  e.currentTarget.style.transform = "scale(1)";
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.style.transform = "scale(1)";

  if (draggedElement) {
    const newImg = draggedElement.cloneNode(true);
    addDragListeners(newImg);
    e.currentTarget.appendChild(newImg);
    draggedElement.remove();
  }
}

function addDragListeners(element) {
  element.addEventListener("dragstart", handleDragStart);
  element.addEventListener("dragend", handleDragEnd);
  addContextMenu(element);
}

draggables.forEach(addDragListeners);

dropZones.forEach((zone) => {
  zone.addEventListener("dragover", handleDragOver);
  zone.addEventListener("dragleave", handleDragLeave);
  zone.addEventListener("drop", handleDrop);
});

imageGrid.addEventListener("dragover", handleDragOver);
imageGrid.addEventListener("dragleave", handleDragLeave);
imageGrid.addEventListener("drop", handleDrop);

dropZones.forEach((zone) => {
  zone.addEventListener("drop", () => {
    zone.style.boxShadow = "0 0 30px #ffffff";
    setTimeout(() => {
      zone.style.boxShadow = "";
    }, 200);
  });
});

async function loadImages() {
  const imageGrid = document.getElementById("image-grid");
  const imageFormats = ["jpg", "jpeg", "png", "gif", "webp"];

  for (let i = 1; i <= 685; i++) {
    for (let format of imageFormats) {
      const img = document.createElement("img");
      img.src = `comprimidas/img${i.toString().padStart(3, "0")}.jpg`;

      img.setAttribute("data-id", `img${i.toString().padStart(3, "0")}`); // <-- AQUI

      img.className = "tier-img";
      img.draggable = true;
      img.alt = `Item ${i}`;

      img.onload = function () {
        imageGrid.appendChild(img);
        addDragListeners(img);
      };

      img.onerror = function () {
        // imagem não encontrada, tenta próximo formato
      };

      break; // só tenta o primeiro formato mesmo
    }
  }
}

window.addEventListener("load", loadImages);
function openImageModal(imageSrc) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  modal.style.display = "block";
  modalImg.src = imageSrc;
  document.body.style.overflow = "hidden"; // Previne scroll
}

function closeImageModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
  document.body.style.overflow = "auto"; // Restaura scroll
}

function addContextMenu(img) {
  img.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    openImageModal(img.src);
  });
}

document.querySelectorAll(".tier-img").forEach(addContextMenu);

document.getElementById("imageModal").addEventListener("click", (e) => {
  if (e.target.classList.contains("image-modal")) {
    closeImageModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeImageModal();
  }
});

function loadState(file) {
  const reader = new FileReader();

  reader.onload = async function (e) {
    const state = JSON.parse(e.target.result);
    const allImages = {};
    const imageGrid = document.getElementById("image-grid"); // <- importante

    // Pré-carrega todas as imagens e guarda em cache
    const promises = [];

    state.forEach((tier) => {
      tier.images.forEach((id) => {
        if (!allImages[id]) {
          const img = document.createElement("img");
          img.src = `comprimidas/${id}.jpg`;
          img.className = "tier-img";
          img.draggable = true;
          img.setAttribute("data-id", id);
          img.alt = id;
          addDragListeners(img);
          allImages[id] = img;
          promises.push(new Promise((resolve) => (img.onload = resolve)));
        }
      });
    });

    await Promise.all(promises); // Espera todas carregarem

    // Limpa as zonas e insere as imagens
    const zones = document.querySelectorAll(".drop-zone");
    zones.forEach((zone) => (zone.innerHTML = ""));

    state.forEach((tier) => {
      const zone = zones[tier.zone];
      tier.images.forEach((id) => {
        if (allImages[id]) {
          const clonedImg = allImages[id].cloneNode(true);
          addDragListeners(clonedImg);
          zone.appendChild(clonedImg);
        }
      });
    });

    // 🧼 Remove do imageGrid todas as imagens que já estão nas zonas
    state.forEach((tier) => {
      tier.images.forEach((id) => {
        const img = imageGrid.querySelector(`[data-id="${id}"]`);
        if (img) {
          img.remove();
        }
      });
    });
  };

  reader.readAsText(file);
}

function saveState() {
  const zones = document.querySelectorAll(".drop-zone");
  const state = [];

  zones.forEach((zone, zoneIndex) => {
    const imgs = zone.querySelectorAll("img");
    const imageIds = Array.from(imgs).map((img) => img.getAttribute("data-id"));
    state.push({ zone: zoneIndex, images: imageIds });
  });

  const blob = new Blob([JSON.stringify(state)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tierlist.json";
  a.click();
  URL.revokeObjectURL(url);
}
