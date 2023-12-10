// Get el ID del producto de la URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Buscar el objeto en localStorage
const existProduct = localStorage.getItem(productId) !== null;

// Verificar si el resultado es negativo
if (!existProduct) {
    // Realizar la búsqueda en la API
    fetch(`https://fakestoreapi.com/products/${productId}`)
        .then((response) => response.json())
        .then((product) => {
            displayProductDetails(product);
        })
        .catch((error) => console.error(error));
} else {
    const product = JSON.parse(localStorage.getItem(productId));
    // Añadir elementos HTML para mostrar los detalles del producto desde localStorage
    displayProductDetails(product);
}

function displayProductDetails(product) {
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
        deleteProduct(product.id);
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
        body: JSON.stringify(productData),
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
                    let deletedGuardados =
                        JSON.parse(localStorage.getItem("productsDeleted"));
                    deletedGuardados.push(id);
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
        })
        .catch((error) => console.error("Error al actualizar el producto:", error));

    // Guardar la información específica del producto en localStorage
    localStorage.setItem(`${productId}`, JSON.stringify(productData));

    let productsGuardados = JSON.parse(localStorage.getItem("products")) || [];
    productsGuardados.push(productData);
    localStorage.setItem("products", JSON.stringify(productsGuardados));
}

// Función para eliminar un producto
const deleteProduct = (productId) => {
    // Obtener los productos del localStorage
    const products = JSON.parse(localStorage.getItem("products")) || [];

    // Filtrar los productos y eliminar el que tenga la ID correspondiente
    const newProducts = products.filter((product) => product.id !== productId);

    // Guardar los nuevos productos en el localStorage
    localStorage.setItem("products", JSON.stringify(newProducts));

    // Agregar la ID del producto eliminado al array productsDeleted (evitando duplicados)
    let deletedGuardados = JSON.parse(localStorage.getItem("productsDeleted")) || [];
    if (!deletedGuardados.includes(productId)) {
        deletedGuardados.push(productId);
        localStorage.setItem("productsDeleted", JSON.stringify(deletedGuardados));
    }

    // Mostrar un mensaje de éxito
    alert(`El producto con ID "${productId}" ha sido eliminado.`);
    window.location.href = "../index.html";
};
