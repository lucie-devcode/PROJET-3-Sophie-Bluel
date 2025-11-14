const loginApi = "http://localhost:5678/api/users/login";

// Redirige si l'utilisateur est déjà connecté
if (localStorage.getItem("authToken")) {
  window.location.href = "index.html";
}

document.getElementById("loginform").addEventListener("submit", handleSubmit);

async function handleSubmit(event) {
  event.preventDefault();

  const user = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  try {
    const response = await fetch(loginApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (response.status !== 200) {
      const existingError = document.querySelector(".message-error");
      if (existingError) existingError.remove();

      const errorBox = document.createElement("div");
      errorBox.className = "message-error";
      errorBox.innerText = "E-mail ou mot de passe incorrect.";
      document.querySelector("form").prepend(errorBox);
    } else {
      const result = await response.json();
      localStorage.setItem("authToken", result.token);
      window.location.href = "index.html";
    }
  } catch (error) {
    console.error("Erreur login:", error);
  }
}
