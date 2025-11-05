let allProjets = []; // Stocke tous les projets pour ne pas rappeler l'API
let modal = null;
const focusableSelector = 'button, a, input, textarea';
let focusables = [];
let previouslyFocusedElement = null;

// ------------------- Gestion login/logout -------------------
function toggleLoginLogout() {
    const token = localStorage.getItem("authToken");
    const logoutBtn = document.getElementById("logout-link");
    const loginLink = document.getElementById("login-link");

    if (token) {
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (loginLink) loginLink.style.display = "none";
    } else {
        if (logoutBtn) logoutBtn.style.display = "none";
        if (loginLink) loginLink.style.display = "inline-block";
    }
}

// ------------------- Chargement des projets -------------------
async function fetchProjets() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        allProjets = await response.json();
    } catch (error) {
        console.error(error.message);
    }
}

// Affiche les projets filtrés en mémoire
function loadProjets(filter) {
    document.querySelector(".gallery").innerHTML = "";

    const projetsFiltres =
        filter && filter !== "all"
            ? allProjets.filter(p => p.categoryId === Number(filter))
            : allProjets;

    projetsFiltres.forEach(setFigure);
}

function refreshProjects() {
    loadProjets("all");
    loadModalGallery();
}

async function loadModalGallery() {
  const modalGallery = document.querySelector(".modal-gallery-items");
  if (!modalGallery) return;

  modalGallery.innerHTML = "";
  const projets = allProjets;

  projets.forEach((projet) => {
    const figure = document.createElement("figure");
    figure.classList.add("modal-figure");

    figure.innerHTML = `
          <div class="image-container">
            <img src="${projet.imageUrl}" alt="${projet.title}">
            <i class="fa-solid fa-trash-can overlay-icon delete-btn" data-id="${projet.id}"></i>
          </div>
          <figcaption>${projet.title}</figcaption>
        `;

    modalGallery.appendChild(figure);
  });

   // Ajout des écouteurs sur les icônes de suppression
    modalGallery.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const id = e.currentTarget.dataset.id;
            const confirmed = confirm("Supprimer ce projet ?");
            if (!confirmed) return;

            const success = await deleteProject(id); // utilise maintenant la fonction externe
            if (success) {
                allProjets = allProjets.filter(projet => projet.id !== Number(id));
                refreshProjects();
            }
        });
    });
}

// Crée chaque figure HTML pour un projet
function setFigure(projet) {
    const figure = document.createElement("figure");
    figure.innerHTML = `
        <img src="${projet.imageUrl}" alt="${projet.title}">
        <figcaption>${projet.title}</figcaption>
    `;
    document.querySelector(".gallery").append(figure);

}

// ------------------- Chargement des catégories -------------------
async function loadCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        if (!response.ok) throw new Error(`Erreur ${response.status}`);
        const categories = await response.json();

        categories.forEach(setFilter);

        // Ajouter le filtre "Tous"
        const tous = document.createElement("div");
        tous.textContent = "Tous";
        tous.className = "btn-tous";
        tous.addEventListener("click", () => loadProjets("all"));
        document.querySelector(".categories").append(tous);

    } catch (error) {
        console.error(error.message);
    }
}

// Crée chaque bouton filtre
function setFilter(category) {
    const div = document.createElement("div");
    div.textContent = category.name;
    div.className = "btn-category";
    div.addEventListener("click", () => loadProjets(category.id)); // filtrage en mémoire
  document.querySelector(".categories").append(div);
  
  // Ajout de la catégorie dans le <select> de la modale
    const select = document.getElementById("category");
    if (select) {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        select.append(option); 
    }
}

// ------------------- Mode admin -------------------
function adminMode() {
     const token = localStorage.getItem("authToken");

    const editBanner = document.querySelector(".edit");
    const adminBtns = document.querySelectorAll(".admin-edit-btn");
    const categoriesContainer = document.querySelector(".categories");

        if (token) {
        if (editBanner) editBanner.style.display = "flex";
        adminBtns.forEach(btn => btn.style.display = "inline-flex");
        if (categoriesContainer) categoriesContainer.style.display = "none";
    } else {
        if (editBanner) editBanner.style.display = "none";
        adminBtns.forEach(btn => btn.style.display = "none");
        if (categoriesContainer) categoriesContainer.style.display = "flex";
    }

    toggleLoginLogout(); // mise à jour centralisée login/logout
}

// ------------------- Modale -------------------
function switchModalView(view) {
    if (!modal) return;

    const galleryView = modal.querySelector(".modal-gallery-view");
    const addView = modal.querySelector(".modal-add");

    if (!galleryView || !addView) return;

    if (view === "gallery") {
        galleryView.style.display = "block";
        addView.style.display = "none";
    } else if (view === "add") {
        galleryView.style.display = "none";
        addView.style.display = "block";
    }
}

function showAddPhoto() {
    switchModalView("add");
}

function showGallery() {
    switchModalView("gallery");
}

const openModal = function (e) {
  e.preventDefault();
  modal = document.querySelector(e.currentTarget.getAttribute("href"));
  if(!modal) return;
  
  modal.style.display = null;
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");

   // Afficher la galerie, cacher ajout photo
  const galleryView = modal.querySelector(".modal-gallery-view");
  const addView = modal.querySelector(".modal-add");
  if (galleryView && addView) {
      galleryView.style.display = "block";
      addView.style.display = "none";
  }

  loadModalGallery();

  focusables = Array.from(modal.querySelectorAll(focusableSelector));
  previouslyFocusedElement = document.querySelector(':focus');
  if (focusables[0]) focusables[0].focus();

  modal.addEventListener('click', closeModal);
  modal.querySelectorAll('.js-modal-close').forEach(btn =>
    btn.addEventListener('click', closeModal));
  modal.querySelector('.js-modal-stop').addEventListener('click', stopPropagation);

  // --- GESTION SWITCH MODAL ---
  const addPhotoBtn = modal.querySelector(".add-photo-button");
  if (addPhotoBtn) addPhotoBtn.addEventListener("click", showAddPhoto);

  const backBtn = modal.querySelector(".js-modal-back");
  if (backBtn) backBtn.addEventListener("click", showGallery);
};

const closeModal = function (e) {
    if (!modal) return;
    if (previouslyFocusedElement) previouslyFocusedElement.focus();
    e.preventDefault();

    // --- Reset vues pour la prochaine ouverture ---
    const galleryView = modal.querySelector(".modal-gallery-view");
    const addView = modal.querySelector(".modal-add");
    if (galleryView && addView) {
        galleryView.style.display = "block";
        addView.style.display = "none";
    }

    modal.style.display = 'none';
    modal.setAttribute("aria-hidden", 'true');
    modal.removeAttribute("aria-modal");
    modal.removeEventListener('click', closeModal);
    modal.querySelectorAll('.js-modal-close').forEach(btn =>
        btn.removeEventListener('click', closeModal)
    );
    modal.querySelector('.js-modal-stop').removeEventListener('click', stopPropagation);
  modal = null;
  
  // Réinitialise la preview d'image si une image avait été sélectionnée
if (previewImage && uploadPlaceholder && photoInput) {
    previewImage.src = "";               // vide l'URL
    previewImage.style.display = "none"; // cache l'image
    uploadPlaceholder.style.display = "flex"; // réaffiche le placeholder
    photoInput.value = "";                // vide l'input file
}
};

const stopPropagation = function (e) {
    e.stopPropagation();
};

const focusInModal = function (e) {
  
  e.preventDefault();
  
    let index = focusables.findIndex(f => f === modal.querySelector(':focus'));
    if (e.shiftKey) index--;
    else index++;
    if (index >= focusables.length) index = 0;
    if (index < 0) index = focusables.length - 1;
    focusables[index].focus();
};

async function deleteProject(id) {
    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("Vous devez être connecté pour supprimer un projet.");
        return false;
    }

    try {
        const res = await fetch(`http://localhost:5678/api/works/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            alert("Erreur lors de la suppression du projet.");
            return false;
        }

        return true;
    } catch (error) {
        console.error("Erreur réseau :", error);
        return false;
    }
}

// ------------------- Chargement galerie modale -------------------


document.addEventListener("DOMContentLoaded", async () => {

    const gallery = document.querySelector(".gallery");
    const categoriesContainer = document.querySelector(".categories");

    if (!gallery || !categoriesContainer) {
        console.log("App.js détecte que la page n'est pas index.html, pas de galerie ni de catégories.");
        return; // STOP, on est sur login.html
    }
    await loadCategories();
    await fetchProjets();
    loadProjets("all");

    adminMode();

    // Clic sur le **nouveau bouton Modifier**
    document.querySelectorAll(".js-modal").forEach(a => {
        a.addEventListener("click", openModal);
    });

    // Clavier
    window.addEventListener('keydown', e => {
        if ((e.key === 'Escape' || e.key === 'Esc') && modal) closeModal(e);
        if (e.key === 'Tab' && modal !== null) focusInModal(e);
    });
});

// Liens login/logout dans le header
const loginLink = document.getElementById("login-link");
const logoutBtn = document.getElementById("logout-link");


// Vérifie si l'utilisateur est connecté
if (localStorage.getItem("authToken")) {
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (loginLink) loginLink.style.display = "none";
} else {
    if (logoutBtn) logoutBtn.style.display = "none";
    if (loginLink) loginLink.style.display = "inline-block";
}

// Gestion du clic sur logout
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("authToken"); // supprime le token
        // Recharge la page pour revenir en mode non connecté
        window.location.reload();
    });
}

const photoInput = document.getElementById("photo-input");
const previewImage = document.getElementById("image-preview");
const uploadPlaceholder = document.getElementById("upload-placeholder");

// Afficher l'image sélectionnée
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  previewImage.src = url;
  previewImage.style.display = "block";          // afficher l'image
  uploadPlaceholder.style.display = "none";      // cacher le placeholder
});

const addPhotoForm = document.querySelector(".add-photo-form form");
const titleInput = document.getElementById("title");
const categorySelect = document.getElementById("category");

addPhotoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const file = photoInput.files[0];
    const title = titleInput.value;
    const category = categorySelect.value;
    const token = localStorage.getItem("authToken"); // juste pour l'Authorization

    if (!file || !title || !category) {
        alert("Veuillez remplir tous les champs et sélectionner une image.");
        return;
    }
  const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("category", category);

    try {
        const res = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        if (!res.ok) throw new Error("Erreur lors de l'ajout de la photo.");

        const newProject = await res.json();

        // Met à jour la galerie principale et la galerie de la modale
        allProjets.push(newProject);
        refreshProjects();

        // Réinitialise le formulaire et affiche à nouveau le placeholder
        addPhotoForm.reset();
        previewImage.style.display = "none";
        uploadPlaceholder.style.display = "flex";

        alert("Photo ajoutée avec succès !");
    } catch (error) {
        console.error(error);
        alert("Impossible d'ajouter la photo.");
    }
});