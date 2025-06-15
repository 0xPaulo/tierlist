function importarTierlist(arquivo) {
  const leitor = new FileReader();

  leitor.onload = async function (e) {
    const estado = JSON.parse(e.target.result);
    const todasImagens = {};
    const gradeImagens = document.getElementById("image-grid");
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