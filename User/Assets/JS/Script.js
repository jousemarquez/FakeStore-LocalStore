const loadUserProfile = () => {
  // Intenta obtener los datos del usuario desde el sessionStorage
  const storedUserData = sessionStorage.getItem("loggedInUser");

  if (storedUserData) {
    const userLogged = JSON.parse(sessionStorage.getItem('loggedInUser'));
    const userInfoContainer = document.querySelector(".user-info");
    userInfoContainer.innerHTML = `
      <p><strong>Name:</strong> ${userLogged.username}</p>
      <p><strong>Email:</strong> ${userLogged.email}</p>`;
  } else {
    // Si no hay datos almacenados, muestra un mensaje o realiza alguna acción predeterminada
    const userInfoContainer = document.querySelector(".user-info");
    userInfoContainer.innerHTML = "<p>No user data available.</p>";
  }
};

const loadPastCarts = () => {
  const storedUserData = localStorage.getItem("users");

  if (storedUserData) {
    const users = JSON.parse(storedUserData);
    const userLogged = users[0];
    const pastCartsContainer = document.querySelector(".past-carts");

    if (userLogged.purchaseHistory && userLogged.purchaseHistory.length > 0) {
      pastCartsContainer.innerHTML = "<h3>Past Carts:</h3><ul><br>";

      userLogged.purchaseHistory.forEach((cart) => {
        const cartDate = cart.date;
        const cartProducts = cart.products.map(product => `<li>Product ID: ${product.id}, Price: $${product.precio}, Quantity: ${product.count}</li>`).join('');
        
        // Calcular el precio total del carrito
        const totalPrice = cart.products.reduce((total, product) => total + product.precio * product.count, 0).toFixed(2);

        pastCartsContainer.innerHTML += `<li>${cartDate}, Total Price: $${totalPrice}<ul>${cartProducts}</ul></li><br>`;
      });

      pastCartsContainer.innerHTML += "</ul>";
    } else {
      pastCartsContainer.innerHTML = "<p>No past carts available.</p>";
    }
  }
};


// Edit User

document.getElementById("editProfileButton").addEventListener("click", openModal);
document.getElementById("editProfileModal").addEventListener("click", function(event) {
  if (event.target === this) {
    closeModal();
  }
});

function closeModal() {
  document.getElementById("editProfileModal").style.display = "none";
}

function openModal() {
  document.getElementById("editProfileModal").style.display = "flex";
}

document.getElementById("editProfileForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const newUsername = document.getElementById("newUsername").value;
  const newEmail = document.getElementById("newEmail").value;
  updateUserInfo(newUsername, newEmail);
  closeModal();
});


function updateUserInfo(newUsername, newEmail, newPassword) {
  const storedUserData = localStorage.getItem("users");
  const storedUserSession = sessionStorage.getItem("loggedInUser");

  if (storedUserData) {
    const users = JSON.parse(storedUserData);
    const userLogged = users[0];
    userLogged.username = newUsername;
    userLogged.email = newEmail;
    userLogged.password = newPassword;

    // Actualiza purchaseHistory si existe
    if (userLogged.purchaseHistory && userLogged.purchaseHistory.length > 0) {
      userLogged.purchaseHistory.forEach((cart) => {
        cart.products.forEach((product) => {
          product.userId.username = newUsername;
          product.userId.email = newEmail;
          product.userId.password = newPassword;
        });
      });
    }

    localStorage.setItem("users", JSON.stringify(users));
    loadUserProfile();
    loadPastCarts();
  }

  if (storedUserSession) {
    const userLogged = JSON.parse(storedUserSession);
    userLogged.username = newUsername;
    userLogged.email = newEmail;
    userLogged.password = newPassword;

    // Actualiza purchaseHistory si existe
    if (userLogged.purchaseHistory && userLogged.purchaseHistory.length > 0) {
      userLogged.purchaseHistory.forEach((cart) => {
        cart.products.forEach((product) => {
          product.userId.username = newUsername;
          product.userId.email = newEmail;
          product.userId.password = newPassword;
        });
      });
    }

    sessionStorage.setItem("loggedInUser", JSON.stringify(userLogged));
    loadUserProfile();
    loadPastCarts();
  }
}



// Load Methods on DOM loading
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  loadPastCarts();
});
