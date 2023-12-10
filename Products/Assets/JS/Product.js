// Obtener el ID del producto de la URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Buscar el objeto en localStorage

const productoEncontrado = localStorage.getItem(productId) !== null;

// Verificar si el resultado es negativo
if (!productoEncontrado) {
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
      price.textContent = `Precio: $${product.price}`;
      productDetails.appendChild(price);

      // Crear el botón de eliminar
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Eliminar";
      productDetails.appendChild(deleteButton);

      // Función para manejar el evento click del botón de eliminar
      deleteButton.addEventListener("click", () => {
        // Obtener el título del producto
        const productName = product.title;
        // Buscar en la lista de la API si hay algún producto con el mismo título
        fetch("https://fakestoreapi.com/products")
          .then((response) => response.json())
          .then((products) => {
            const matchingProduct = products.find(
              (p) => p.title === productName
            );
            // Si no hay coincidencia, almacenar el título del producto en productsDeleted
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
              // Si hay coincidencia, realizar una solicitud fetch DELETE para eliminar el producto
              const matchingProductId = matchingProduct.id;
              fetch(`https://fakestoreapi.com/products/${matchingProductId}`, {
                method: "DELETE",
              })
                .then((response) => response.json())
                .then((deletedProduct) => {
                  const deletedProductTitle = deletedProduct.title;
                  // Almacenar el título del producto en productsDeleted
                  let productsDeleted = localStorage.getItem("productsDeleted");
                  productsDeleted = productsDeleted
                    ? JSON.parse(productsDeleted)
                    : [];
                  productsDeleted.push(deletedProductTitle);
                  localStorage.setItem(
                    "productsDeleted",
                    JSON.stringify(productsDeleted)
                  );
                  // Actualizar la interfaz de usuario o realizar otras acciones necesarias
                  // Mostrar un mensaje de éxito
                  alert(
                    `El producto "${deletedProductTitle}" ha sido eliminado.`
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
  const producto = JSON.parse(localStorage.getItem(productId));
  // Crear elementos HTML para mostrar los detalles del producto desde localStorage

  const productDetails = document.getElementById("product-details");
  const title = document.createElement("h2");
  title.textContent = producto.title;
  productDetails.appendChild(title);
  const image = document.createElement("img");
  image.src = producto.image;
  productDetails.appendChild(image);
  const description = document.createElement("p");
  description.textContent = producto.description;
  productDetails.appendChild(description);
  const price = document.createElement("p");
  price.textContent = `Precio: $${producto.price}`;
  productDetails.appendChild(price);

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Eliminar";
  productDetails.appendChild(deleteButton);

  deleteButton.addEventListener("click", () => {
    // Eliminar el producto del LocalStorage
    localStorage.removeItem(productId);

    // Obtener los productos del LocalStorage
    const productos = JSON.parse(localStorage.getItem("productos"));

    // Filtrar los productos y eliminar el que tenga la ID 69
    const nuevosProductos = productos.filter(
      (producto) => producto.id === productId
    );

    // Guardar los nuevos productos en el LocalStorage
    localStorage.setItem("productos", JSON.stringify(nuevosProductos));

    alert(`El producto "${producto.title}" ha sido eliminado.`);
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
      // Extraer la ID del producto actualizado
      const id = data.id;

      // Segunda solicitud GET para obtener la información actualizada del producto
      fetch(`https://fakestoreapi.com/products/${id}`)
        .then((response) => response.json())
        .then((updatedProduct) => {
          const title = updatedProduct.title;
          // Almacenar el resultado en localStorage con la clave "productsDeleted"
          var deletedGuardados =
            JSON.parse(localStorage.getItem("productsDeleted")) || [];
          deletedGuardados.push(title);
          localStorage.setItem(
            "productsDeleted",
            JSON.stringify(deletedGuardados)
          );
          console.log(
            "Producto actualizado almacenado en localStorage:",
            updatedProduct
          );
          location.reload();
        })
        .catch((error) =>
          console.error("Error al obtener el producto actualizado:", error)
        );
    });

  // Guardar la información específica del producto en localStorage
  localStorage.setItem(`${productId}`, JSON.stringify(productData));

  var productosGuardados = JSON.parse(localStorage.getItem("productos")) || [];
  productosGuardados.push(productData);
  localStorage.setItem("productos", JSON.stringify(productosGuardados));
}
