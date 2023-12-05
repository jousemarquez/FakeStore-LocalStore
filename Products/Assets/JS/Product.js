// Get el ID del product de la URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Buscar el objeto en localStorage

const existProduct = localStorage.getItem(productId) !== null;

// Verificar si el result es negativo
if (!existProduct) {
  // Realizar la búsqueda en la API
  fetch(`https://fakestoreapi.com/products/${productId}`)
    .then((response) => response.json())
    .then((product) => {
      const productDetails = document.getElementById("product-details");
      const title = document.createElement("h2");
      title.textContent = product.title;
      productDetails.appendChild(title);
      const image = document.createElement("img");
      image.src = product.image;
      productDetails.appendChild(image);
      const description = document.createElement("p");
      description.textContent = product.description;
      productDetails.appendChild(description);
      const price = document.createElement("p");
      price.textContent = `Price: $${product.price}`;
      productDetails.appendChild(price);

      // Add el botón de delete
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Eliminar";
      productDetails.appendChild(deleteButton);

      // Función para manejar el evento click del botón de delete
      deleteButton.addEventListener("click", () => {
        // Get el título del product
        const productName = product.title;
        // Buscar en la list de la API si hay algún product con el mismo título
        fetch("https://fakestoreapi.com/products")
          .then((response) => response.json())
          .then((products) => {
            const matchingProduct = products.find(
              (p) => p.title === productName
            );
            // Si no hay coincidencia, almacenar el título del product en productsDeleted
            if (!matchingProduct) {
              let productsDeleted = localStorage.getItem("productsDeleted");
              productsDeleted = productsDeleted
                ? JSON.parse(productsDeleted)
                : [];
              productsDeleted.push(productName);
              localStorage.setItem(
                "productsDeleted",
                JSON.stringify(productsDeleted)
              );
            } else {
              // Si hay coincidencia, realizar una solicitud fetch DELETE para delete el product
              const matchingProductId = matchingProduct.id;
              fetch(`https://fakestoreapi.com/products/${matchingProductId}`, {
                method: "DELETE",
              })
                .then((response) => response.json())
                .then((deletedProduct) => {
                  const deletedProductTitle = deletedProduct.title;
                  // Almacenar el título del product en productsDeleted
                  let productsDeleted = localStorage.getItem("productsDeleted");
                  productsDeleted = productsDeleted
                    ? JSON.parse(productsDeleted)
                    : [];
                  productsDeleted.push(deletedProductTitle);
                  localStorage.setItem(
                    "productsDeleted",
                    JSON.stringify(productsDeleted)
                  );
                  // Update la interfaz de user o realizar otras acciones necesarias
                  // Mostrar un mensaje de éxito
                  alert(
                    `El product "${deletedProductTitle}" ha sido eliminado.`
                  );
                  window.location.href = "../index.html";
                })
                .catch((error) => console.log(error));
            }
          })
          .catch((error) => console.log(error));
      });
    })
    .catch((error) => console.log(error));
} else {
  const product = JSON.parse(localStorage.getItem(productId));
  // Add elementos HTML para show los detalles del product desde localStorage

  const productDetails = document.getElementById("product-details");
  const title = document.createElement("h2");
  title.textContent = product.title;
  productDetails.appendChild(title);
  const image = document.createElement("img");
  image.src = product.image;
  productDetails.appendChild(image);
  const description = document.createElement("p");
  description.textContent = product.description;
  productDetails.appendChild(description);
  const price = document.createElement("p");
  price.textContent = `Price: $${product.price}`;
  productDetails.appendChild(price);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Eliminar";
  productDetails.appendChild(deleteButton);

  deleteButton.addEventListener("click", () => {
    // Eliminar el product del LocalStorage
    localStorage.removeItem(productId);

    // Get los products del LocalStorage
    const products = JSON.parse(localStorage.getItem("products"));

    // Filtrar los products y delete el que tenga la ID 69
    const newProducts = products.filter(
      (product) => product.id === productId
    );

    // Guardar los new products en el LocalStorage
    localStorage.setItem("products", JSON.stringify(newProducts));

    alert(`El product "${product.title}" ha sido eliminado.`);
    window.location.href = "../index.html";
  });
}

function updateProduct() {
  const productData = {
    title: document.getElementById("title").value,
    price: parseFloat(document.getElementById("price").value),
    description: document.getElementById("description").value,
    image: document.getElementById("image").value,
    category: document.getElementById("category").value,
  };

  fetch(`https://fakestoreapi.com/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify({
      id: productId,
      title: "test product",
      price: 13.5,
      description: "lorem ipsum set",
      image: "https://www.shutterstock.com/image-vector/thinking-man-question-marks-vector-260nw-2162774881.jpg",
      category: "electronic",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // Extraer la ID del product actualizado
      const id = data.id;

      // Segunda solicitud GET para get la información actualizada del product
      fetch(`https://fakestoreapi.com/products/${id}`)
        .then((response) => response.json())
        .then((updatedProduct) => {
          const title = updatedProduct.title;
          // Almacenar el result en localStorage con la clave "productsDeleted"
          let deletedGuardados =
            JSON.parse(localStorage.getItem("productsDeleted")) || [];
          deletedGuardados.push(title);
          localStorage.setItem(
            "productsDeleted",
            JSON.stringify(deletedGuardados)
          );
          console.log(
            "Product actualizado almacenado en localStorage:",
            updatedProduct
          );
          location.reload();
        })
        .catch((error) =>
          console.error("Error al get el product actualizado:", error)
        );
    });

  // Guardar la información específica del product en localStorage
  localStorage.setItem(`${productId}`, JSON.stringify(productData));

  let productsGuardados = JSON.parse(localStorage.getItem("products")) || [];
  productsGuardados.push(productData);
  localStorage.setItem("products", JSON.stringify(productsGuardados));
}
