mostrarTodosLosProductos();

/*
se encarga de mostrar los productos en el HTML. Esta función recibe un array de productos y crea una tarjeta para cada producto.
*/
function mostrarProductos(products) {
  const productCards = document.getElementById("product-cards");

    // Limpiar las tarjetas existentes
    productCards.textContent = "";

  // Obtener la lista de productos eliminados del localStorage (si existe)
  let productsDeleted = localStorage.getItem("productsDeleted");
  productsDeleted = productsDeleted ? JSON.parse(productsDeleted) : [];

  // Crear una tarjeta para cada producto, si no está en la lista de productos eliminados
  products.forEach((product) => {
    // Comprobar si el nombre del producto está en la lista de productos eliminados
    const isDeleted = productsDeleted.includes(product.title);

    if (!isDeleted) {
      const card = crearTarjeta(product);
      productCards.appendChild(card);
    }
  });
}
/*
Se encarga de crear la estructura HTML de una tarjeta de producto. Esta función recibe un objeto de producto y crea los elementos HTML necesarios, como la imagen, el nombre y el precio. 
*/
function crearTarjeta(product) {
  const card = document.createElement("div");
  card.classList.add("card");

  const image = document.createElement("img");
  image.src = product.image;
  card.appendChild(image);

  const name = document.createElement("h3");
  name.textContent = product.title;
  card.appendChild(name);

  const price = document.createElement("p");
  price.classList.add("price");
  price.textContent = product.price + " €";
  card.appendChild(price);

  const agregarAlCarritoLink = document.createElement("a");
  agregarAlCarritoLink.href = "#";
  agregarAlCarritoLink.className = "agregar-carrito";
  agregarAlCarritoLink.textContent = "Add to Cart";
  agregarAlCarritoLink.setAttribute("data-id", product.id);
  agregarAlCarritoLink.id = "lista-cursos";
  card.appendChild(agregarAlCarritoLink);

  // Agregar el evento onclick a la imagen de la tarjeta
  image.onclick = function () {
    redirectToAnotherPage(product.id);
  };

  return card;
}

/*
Redirige a otra página cuando se hace clic en una tarjeta de producto. Esta función toma el ID del producto y lo agrega a la URL de la página de destino.
*/
function redirectToAnotherPage(productId) {
  const IDobjeto = productId;
  window.location.href = `./product.html?id=${IDobjeto}`;
}

/*
 muestra todos los productos en el home. Esta función obtiene todas las categorías de la API y luego obtiene los productos de cada categoría. Luego, combina los productos de la API y los productos almacenados en localStorage y los muestra. 
*/
function mostrarTodosLosProductosPorCategorias() {
  // Obtener todas las categorías de la API
  fetch("https://fakestoreapi.com/products/categories")
    .then((response) => response.json())
    .then((categories) => {
      // Obtener todas las categorías en minúsculas
      const allCategories = categories.map((category) =>
        category.toLowerCase()
      );

      // Obtener los productos almacenados en el localStorage
      const productosLocalStorage =
        JSON.parse(localStorage.getItem("productos")) || [];

      // Crear un array de promesas para obtener los productos de cada categoría
      const promises = allCategories.map((category) => {
        if (category === "all") {
          return Promise.resolve(productosLocalStorage);
        } else {
          return fetch(`https://fakestoreapi.com/products/category/${category}`)
            .then((response) => response.json())
            .catch((error) => {
              console.error(
                `Error al obtener los productos de la categoría ${category} de la API:`,
                error
              );
              return [];
            });
        }
      });

      // Esperar a que todas las promesas se resuelvan
      Promise.all(promises)
        .then((productsArrays) => {
          // Unificar todos los productos en un solo array
          const allProducts = productosLocalStorage.concat(
            ...productsArrays.flat()
          );

          // Mostrar todos los productos
          mostrarProductos(allProducts);
        })
        .catch((error) => {
          console.error("Error al obtener los productos:", error);
        });
    })
    .catch((error) => {
      console.error("Error al obtener las categorías de la API:", error);
    });
}

/*
muestra los productos de una categoría específica. Esta función obtiene los productos de la API de la categoría seleccionada y los combina con los productos almacenados en localStorage de esa categoría. 
*/
function mostrarProductosPorCategoria(categoria) {
  const urlAPI = `https://fakestoreapi.com/products/category/${categoria}`;

  // Obtener los productos de la API de la categoría seleccionada
  fetch(urlAPI)
    .then((response) => response.json())
    .then((productsAPI) => {
      // Obtener los productos almacenados en el localStorage
      const productosLocalStorage =
        JSON.parse(localStorage.getItem("productos")) || [];

      // Filtrar los productos del localStorage por categoría
      const productosLocalStoragePorCategoria = productosLocalStorage.filter(
        (product) => product.category.toLowerCase() === categoria.toLowerCase()
      );

      // Unificar los productos de la API y los productos del localStorage por categoría
      const allProducts = [
        ...productsAPI,
        ...productosLocalStoragePorCategoria,
      ];

      // Mostrar todos los productos
      mostrarProductos(allProducts);
    })
    .catch((error) => {
      console.error("Error al obtener los productos de la API:", error);
    });
}

/*
Muestra los productos almacenados en localStorage y los combine con los productos de la API. 
*/
function mostrarTodosLosProductos() {
  const productosLocalStorage =
    JSON.parse(localStorage.getItem("productos")) || [];

  fetch("https://fakestoreapi.com/products")
    .then((response) => response.json())
    .then((productsAPI) => {
      // Combinar los productos de la API y los productos del localStorage
      const allProducts = [...productsAPI, ...productosLocalStorage];
      mostrarProductos(allProducts);
    })
    .catch((error) => {
      console.error("Error al obtener los productos de la API:", error);
    });
}

let lastProductId = parseInt(localStorage.getItem("lastProductId")) || 49;
const productForm = document.getElementById("product-form");
productForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const price = document.getElementById("price").value;
  const description = document.getElementById("description").value;
  const image = document.getElementById("image").value;
  const category = document.getElementById("category").value;
  const idAuto = lastProductId + 1;
  const productData = {
    id: idAuto,
    category: category,
    description: description,
    image: image,
    price: parseFloat(price),
    title: title,
  };
  fetch("https://fakestoreapi.com/products", {
    method: "POST",
    body: JSON.stringify(productData),
  })
    .then((response) => response.json())
    .then((product) => {
      const productStorage = {
        title: productData.title,
        price: productData.price,
        description: productData.description,
        image: productData.image,
        category: productData.category,
      };
      localStorage.setItem(idAuto.toString(), JSON.stringify(productStorage));
      localStorage.setItem("lastProductId", idAuto);

      let productos = localStorage.getItem("productos");
      productos = productos ? JSON.parse(productos) : [];
      productos.push(productData);
      localStorage.setItem("productos", JSON.stringify(productos));
      localStorage.setItem("lastProductId", idAuto);
      alert("Producto creado exitosamente");
      productForm.reset();

      window.location.href = "index.html";
    })
    .catch((error) => console.log(error));
});

function realizarSolicitud() {
  // Obtener el valor del input
  var numero = document.getElementById("numeroInput").value;

  // Construir la URL con el número proporcionado
  var url = `https://fakestoreapi.com/products?limit=${numero}`;

  // Realizar la solicitud fetch
  fetch(url)
    .then((response) => response.json())
    .then((productsAPI) => {
      // Obtener los productos almacenados en el localStorage
      const productosLocalStorage =
        JSON.parse(localStorage.getItem("productos")) || [];

      // Filtrar los productos del localStorage por categoría
      const productosLocalStoragePorCategoria = productosLocalStorage.filter(
        (product) => product.category.toLowerCase() === categoria.toLowerCase()
      );

      // Unificar los productos de la API y los productos del localStorage por categoría
      const allProducts = [
        ...productsAPI,
        ...productosLocalStoragePorCategoria,
      ];

      // Mostrar todos los productos
      mostrarProductos(allProducts);
    });
}

// Obtén el botón de logout
const logoutButton = document.querySelector("#logoutButton");

// Agrega el evento click al botón de logout
logoutButton.addEventListener("click", () => {
  // Elimina el usuario almacenado en el sessionStorage
  sessionStorage.removeItem("users");
  // Redirige al login.html (o a la página de inicio de sesión)
  window.location.href = "/html/login.html";
});
