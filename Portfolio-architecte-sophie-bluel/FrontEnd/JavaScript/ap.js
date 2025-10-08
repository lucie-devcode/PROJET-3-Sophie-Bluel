async function loadProjets(filter) {
    document.querySelector(".gallery").innerHTML = "";
    const url = "http://localhost:5678/api/works";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur ${response.status} : impossible de récupérer les projets`);
        }

        const projets = await response.json();

        const projetsFiltres =
            filter && filter !== "all"
                ? projets.filter((projet) => projet.categoryId === Number(filter))
                : projets; 

        for (let i = 0; i < projetsFiltres.length; i++) {
            setFigure(projetsFiltres[i]);
        }

    } catch (error) {
        console.error(error.message);
    }
}

function setFigure(projet) {
    const figure = document.createElement("figure");
    figure.innerHTML = `
        <img src="${projet.imageUrl}" alt="${projet.title}">
        <figcaption>${projet.title}</figcaption>
    `;
    document.querySelector(".gallery").append(figure);
}

async function loadCategories() {
    const url = "http://localhost:5678/api/categories";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur ${response.status} : impossible de récupérer les catégories`);
        }

        const categories = await response.json();
        for (let i = 0; i < categories.length; i++) {
            setFilter(categories[i]);
        }
    } catch (error) {
        console.error(error.message);
    }
}

function setFilter(category) {
    const div = document.createElement("div");
    div.textContent = category.name;
    div.className = "btn-category";
    div.addEventListener("click", () => loadProjets(category.id));
    document.querySelector(".categories").append(div);
}

async function init() {
    await loadCategories();

    const tous = document.createElement("div");
    tous.textContent = "Tous";
    tous.className = "btn-tous";
    tous.addEventListener("click", () => loadProjets("all"));
    document.querySelector(".categories").append(tous);

    loadProjets();
}

init();
