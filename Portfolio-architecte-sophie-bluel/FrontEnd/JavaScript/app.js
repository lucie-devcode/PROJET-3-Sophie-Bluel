async function loadProjets() {
   const url = "http://localhost:5678/api/works";

   try { //gérer les erreurs
      const response = await fetch(url);
      if (!response.ok) {
         throw new Error(`Erreur ${response.status} : impossible de récupérer les projets`);
      }

      const projets = await response.json();

      for (let i = 0; i < projets.length; i++) {
         setFigure(projets[i]);
      }
   } catch (error) {
      console.error(error.message);
   }
}
loadProjets();

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

   try { //gérer les erreurs
      const response = await fetch(url);
      if (!response.ok) {
         throw new Error(`Erreur ${response.status} : impossible de récupérer les projets`);
      }

      const projets = await response.json();
      console.log(projets);

      for (let i = 0; i < projets.length; i++) {
         setFilter(projets[i]);
      }
   } catch (error) {
      console.error(error.message);
   }
}
loadCategories();


const tous = document.createElement("div");
tous.innerHTML = "Tous";
tous.className = "btn-tous";
tous.addEventListener("click", () => {
    loadProjets("all");
});
document.querySelector(".categories").append(tous);

function setFilter(data) {
   const div = document.createElement("div");
   div.innerHTML = `${data.name}`;
   document.querySelector(".categories").append(div);
}



