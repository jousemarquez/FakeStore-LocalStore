const state = {
    firstLoad: true,
    currentCategory: "all",
}

const elements = {
    filterItem: document.querySelector(".items"),
    filterImg: document.querySelectorAll(".gallery .image"),
}

const fetchData = async (url, options) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            console.clear();
            throw new Error(
                response.status === 404
                    ? "Error 404: Resource not found"
                    : response.status === 500
                        ? "Server Error"
                        : "Unknow Error"
            );
        }
        return response.json();
    } catch (error) {
        console.log("ERROR ---->", error);
    }
}

// Products

document.getElementById('add-product-button').addEventListener('click', function () {
    const addProductModal = document.getElementById('modal_container');
    addProductModal.style.display = 'block';
})

document.getElementById('close-modal').addEventListener('click', function () {
    const addProductModal = document.getElementById('modal_container');
    addProductModal.style.display = 'none';
})

document.getElementById('add-product-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const newProduct = {
        title: document.getElementById('title').value,
        price: document.getElementById('price').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value,
        image: document.getElementById('image').value,
    }

    // Validar el formulario
    const validationError = validateProductForm(newProduct);

    if (validationError) {
        console.error(validationError);
    } else {
        // Get latest ID from Product endpoint
        fetch('https://fakestoreapi.com/products')
            .then(response => response.json())
            .then(apiProducts => {
                const lastApiProductId = apiProducts[apiProducts.length - 1].id;
                const existingProducts = JSON.parse(localStorage.getItem('products')) || [];

                // Get latest ID from Product in LocalStorage
                const lastLocalProductId = existingProducts.length > 0
                    ? existingProducts[existingProducts.length - 1].id
                    : 0;

                // Set a new ID based on Max from API and LS + 1
                newProduct.id = Math.max(lastApiProductId, lastLocalProductId) + 1;

                // Push a new product onto the list
                existingProducts.push(newProduct);
                localStorage.setItem('products', JSON.stringify(existingProducts));
                const addProductModal = document.getElementById('modal_container');
                addProductModal.style.display = 'none';
            })
            .catch(error => {
                console.error('Error... Getting the full list of products from the API:', error);
            })
            .finally(() => {
                reload();
            });
    }
});

function validateProductForm(product) {
    if (!product.title || !product.price || !product.category || !product.description || !product.image) {
        return 'Error... All fields are required.';
    }
    return null;
}

const updateFilter = (selectedItem) => {
    document.getElementById("loading").style.display = "block";
    if (selectedItem.target.classList.contains("item")) {
        elements.filterItem.querySelector(".active").classList.remove("active");
        selectedItem.target.classList.add("active");

        const filterName = selectedItem.target.getAttribute("data-name");
        if (state.currentCategory !== filterName) {
            state.currentCategory = filterName;
            filterProducts();
        }
    }
    document.getElementById("loading").style.display = "none";
}

const filterProducts = () => {
    document.getElementById("loading").style.display = "block";
    const apiUrl =
        state.currentCategory === "all"
            ? "https://fakestoreapi.com/products"
            : `https://fakestoreapi.com/products/category/${state.currentCategory}`;

    const localStorageProducts = JSON.parse(localStorage.getItem('products')) || [];

    Promise.all([
        fetchData(apiUrl),
        Promise.resolve(localStorageProducts)
    ])
        .then(([apiProducts, localProducts]) => {
            const allProducts = [...apiProducts, ...localProducts];
            if (state.firstLoad) {
                initialize(allProducts);
            }
            getData(allProducts);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        })
        .finally(() => {
            document.getElementById("loading").style.display = "none";
        });
}


const getData = (data) => {
    const modifiedProduct = JSON.parse(sessionStorage.getItem('modifiedProduct'));
    const newProduct = JSON.parse(sessionStorage.getItem('newProduct'));
    let html = "";
    data.forEach((c) => {
        html += `<div class="product" value="${c.id}">`;
        html += `  <div class="product-content">`;
        html += `    <div class="product-img" onclick="viewMore(${c.id})">`;
        html += `      <img src="${c.image}" alt="product image">`;
        html += `    </div>`;
        html += `    <div class="product-btns">`;
        html += `      <button type="button" onclick="addToCart(${c.id}, ${(parseFloat(c.price) - (15 * parseFloat(c.price)) / 100).toFixed(2)})" class="btn-cart"> add to cart`;
        html += `        <span><i class="fas fa-plus"></i></span>`;
        html += `      </button>`;
        html += `      <button type="button" onclick="openEditModal(${c.id})" class="btn-buy"> edit`;
        html += `      <button type="button" onclick="viewMore(${c.id})" class="btn-buy"> view more`;
        html += `        <span><i class="fas fa-shopping-cart"></i></span>`;
        html += `      </button>`;
        html += `    </div>`;
        html += `  </div>`;
        html += `  <div class="product-info">`;
        html += `    <div class="product-info-top">`;
        html += `      <h2 class="sm-title">${c.category}</h2>`;
        html += `      <div class="rating.rate">`;

        if (c.rating && Math.round(c.rating.rate)) {
            if (Math.round(c.rating.rate) === 5) {
                for (let i = 0; i < 5; i++) {
                    html += `   <i class="fas fa-star"></i>`;
                }
            } else if (Math.round(c.rating.rate) === 4) {
                for (let i = 0; i < 4; i++) {
                    html += `   <i class="fas fa-star"></i>`;
                }
                html += `   <span><i class="far fa-star"></i></span>`;
            }
        } else {
            html += `   <span>No rating available</span>`;
        }

        html += `      </div>`;
        html += `    </div>`;
        html += `    <a class="product-name">${c.title}</a>`;
        html += `    <p class="product-price">$ ${c.price}</p>`;
        html += `    <p class="product-price">$ ${(parseFloat(c.price) - (15 * parseFloat(c.price)) / 100).toFixed(2)} </p>`;
        html += `  </div>`;

        // Renderizar el producto modificado si existe
        if (modifiedProduct && c.id == modifiedProduct.id) {
            html += `<div class="modified-product">This product has been modified</div>`;
        }

        html += `  <div class="off-info">`;
        html += `    <h2 class="sm-title">10% off</h2>`;
        html += `  </div>`;
        html += `</div>`;
    });

    // Renderizar el nuevo producto si existe
    if (newProduct) {
        html += `<div class="product" value="${newProduct.id}">`;
        // ... (resto del código para el nuevo producto)
        html += `<div class="new-product">This is a new product</div>`;
        html += `</div>`;
    }

    document.getElementById("product-item").innerHTML = html;
}


const initialize = (data) => {
    if (sessionStorage.getItem("cart") !== null) {
        handleCart();
    }

    let uniqueCategories = [];
    let html2 = "";
    data.forEach((c) => {
        if (state.firstLoad) {
            if (!uniqueCategories.includes(c.category)) {
                uniqueCategories.push(c.category);
                html2 = `<span class="item" data-name="${c.category}" id="${c.id}">${c.category}</span>`;
                document.getElementById("items").innerHTML += html2;
            }
        }
    });
    state.firstLoad = false;
}

// Edit Product

function openEditModal(productId) {
    const editProductModal = document.getElementById('edit_modal_container');
    const productIdInput = document.getElementById('product-id');
    productIdInput.value = productId;

    fetchData('https://fakestoreapi.com/products')
        .then(apiProducts => {
            const localProducts = JSON.parse(localStorage.getItem('products')) || [];
            const allProducts = [...apiProducts, ...localProducts];
            const productToEdit = allProducts.find(product => product.id == productId);

            if (productToEdit) {
                fillEditForm(productToEdit);
                editProductModal.style.display = 'block';
            } else {
                console.error('Error: Product not found');
            }
        })
        .catch(error => {
            console.error('Error fetching products from API:', error);
        });

    // Verificar si hay un producto modificado en el sessionStorage y guardarlo en el localStorage
    const modifiedProduct = JSON.parse(sessionStorage.getItem('modifiedProduct'));
    if (modifiedProduct) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const updatedProducts = products.map(product => {
            return product.id == modifiedProduct.id ? { ...product, ...modifiedProduct } : product;
        });

        localStorage.setItem('products', JSON.stringify(updatedProducts));
        sessionStorage.removeItem('modifiedProduct');
        getData(updatedProducts);
    }
}


document.getElementById('edit-product-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const productId = document.getElementById('product-id').value;
    const editedProduct = {
        title: getValue('title'),
        price: getValue('price'),
        category: getValue('category'),
        description: getValue('description'),
        image: getValue('image'),
    };

    const products = JSON.parse(localStorage.getItem('products')) || [];
    const updatedProducts = products.map(product => {
        return product.id == productId ? { ...product, ...editedProduct } : product;
    });

    // Guardar el producto modificado en el sessionStorage
    sessionStorage.setItem('modifiedProduct', JSON.stringify({ id: productId, ...editedProduct }));

    localStorage.setItem('products', JSON.stringify(updatedProducts));
    closeEditModal();
    getData(updatedProducts);
})



function getLocalProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
}

function getValue(elementId) {
    return document.getElementById(elementId).value;
}

function fillEditForm(product) {
    document.getElementById('title').value = product.title;
    document.getElementById('price').value = product.price;
    document.getElementById('category').value = product.category;
    document.getElementById('description').value = product.description;
    document.getElementById('image').value = product.image;
}

document.getElementById('edit_close-modal').addEventListener('click', function () {
    const addProductModal = document.getElementById('edit_modal_container');
    addProductModal.style.display = 'none';
})

function closeEditModal() {
    const editProductModal = document.getElementById('edit_close-modal');
    editCloseModalBtn.addEventListener('click', function () {
        // Obtén referencia al modal
        const editModalContainer = document.getElementById('edit_modal_container');

        // Establece el estilo de visualización del modal en "none" para ocultarlo
        editModalContainer.style.display = 'none';
    })
}

// Cart

const purchaseCart = () => {
    if (sessionStorage.getItem("cart") != null) {
        const fecha = new Date();
        let compra = "";
        let cart = JSON.parse(sessionStorage.getItem("cart"));

        // Obtener usuario actual del localStorage
        let users = JSON.parse(localStorage.getItem("users")) || [];

        if (users.length === 0) {
            alert("Error... User not found.");
            return;
        }

        const loggedInUser = users[0];

        cart.forEach((c, i) => {
            compra += `{productId:${c.id}, quantity:${c.count}}`;
            if (cart.length - 1 !== i) {
                compra += ",";
            }
        });

        document.getElementById("total-Products").innerHTML = 0;
        document.getElementById("total-price").innerHTML = "$ 0";

        document.getElementById("loading").style.display = "block";
        fetchData(`https://fakestoreapi.com/carts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId: loggedInUser.id,
                date: fecha.toLocaleDateString(),
                products: [compra],
            }),
        })
            .then((json) => {
                console.log(json);

                // Agregar el carrito al historial de compras del usuario
                loggedInUser.purchaseHistory = loggedInUser.purchaseHistory || [];
                loggedInUser.purchaseHistory.push({ date: fecha.toLocaleDateString(), products: cart });

                // Actualizar la información del usuario en el localStorage
                localStorage.setItem("users", JSON.stringify(users));

                sessionStorage.removeItem("cart");
            })
            .catch((error) => console.log("ERROR ---->", error))
            .finally(() => {
                document.getElementById("loading").style.display = "none";
                alert("Purchase completed successfully.");
            });
    } else {
        alert("Error... The Cart is empty");
    }
};


const addToCart = (id, precio) => {
    const userId = getUserId();

    if (sessionStorage.getItem("cart") === null) {
        let cart = [];
        cart.push({
            id: id,
            precio: precio,
            count: 1,
            userId: userId,
        });
        sessionStorage.setItem("cart", JSON.stringify(cart));
    } else {
        let cart = JSON.parse(sessionStorage.getItem("cart"));
        let found = false;

        cart.forEach((c) => {
            if (c.id === id) {
                ++c.count;
                c.precio += parseFloat(precio);
                found = true;
            }
        });

        if (!found) {
            // Agregar el nuevo producto al carrito
            cart.push({
                id: id,
                precio: parseFloat(precio),
                count: 1,
                userId: userId,
            });
        }
        sessionStorage.setItem("cart", JSON.stringify(cart));
    }
    handleCart();
}

function deleteCart() {
    if (sessionStorage.getItem('cart') !== null) {
        sessionStorage.removeItem('cart');
        reload();
    }
}

function reload() {
    window.location = `./product.html?id=${id}`;
}

const getUserId = () => {
    const usersData = localStorage.getItem("users");
    if (!usersData) {
        return null;
    }
    const users = JSON.parse(usersData);
    const firstUserId = Object.values(users)[0];
    return firstUserId;
}

const handleCart = () => {
    let cart = JSON.parse(sessionStorage.getItem("cart"));
    let contador = 0;
    let total = 0;
    cart.forEach((c) => {
        total += c.precio * c.count;
        contador += c.count;
    });
    document.getElementById("total-Products").innerHTML = contador;
    document.getElementById("total-price").innerHTML = "$ " + total.toFixed(1);
}

elements.filterItem.addEventListener("click", updateFilter);
filterProducts();

// Menú Hamburger
document.addEventListener("DOMContentLoaded", function () {
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const menu = document.querySelector(".menu");

    hamburgerMenu.addEventListener("click", function () {
        menu.classList.toggle("show");
    });
})


function viewMore(id) {
    window.location = `./product.html?id=${id}`;
}

const printCarrito = async () => {
    try {
        const carritoProds = document.getElementById('list-cart');
        let cart = JSON.parse(sessionStorage.getItem('cart')) || { products: [] };

        // Clear the existing products in the cart before re-printing
        carritoProds.innerHTML = '';

        for (const productCart of cart.products) {
            const id = productCart.id;
            const product = await getProductById(id); // Assuming there's a function to get product details by ID

            if (product) {
                const row = carritoProds.insertRow();

                // Columna de Imagen
                const imgCell = row.insertCell();
                const img = document.createElement('img');
                img.src = product.image;
                img.alt = product.title;
                img.style.width = '50px';
                img.style.height = '50px';
                imgCell.appendChild(img);

                // Columna de Nombre
                const nameCell = row.insertCell();
                nameCell.textContent = product.title;

                // Columna de Precio
                const priceCell = row.insertCell();
                priceCell.textContent = `$${product.price}`;

                // Columna de Cantidad
                const quantityCell = row.insertCell();
                quantityCell.textContent = productCart.quantity;

                // Columna de Precio Total
                const totalPriceCell = row.insertCell();
                const totalPrice = product.price * productCart.quantity;
                totalPriceCell.textContent = `$${totalPrice.toFixed(2)}`;

                // Columna de Botón de Eliminar
                const deleteCell = row.insertCell();
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.addEventListener('click', () => {
                    // Remove the product from the cart
                    cart.products = cart.products.filter(p => p.id !== id);
                    // Recalculate total price and update the price element
                    calculateAndUpdateTotalPrice(cart);
                    // Update session storage
                    updateCart(cart);
                    // Reprint the cart after deletion
                    printCarrito();
                });
                deleteCell.appendChild(deleteBtn);
            }
        }

        // Calcular y mostrar el precio total después de imprimir los productos
        calculateAndUpdateTotalPrice(cart);
    } catch (error) {
        console.error("Error al imprimir productos del carrito", error);
    }
};

// Función para obtener detalles de un producto por su ID
const getProductById = async (productId) => {
    try {
        // Intentar obtener el producto de la API
        const apiResponse = await fetchData(`https://fakestoreapi.com/products/${productId}`);
        const apiProduct = apiResponse || null;

        // Intentar obtener el producto del almacenamiento local
        const localProducts = JSON.parse(localStorage.getItem('products')) || [];
        const localProduct = localProducts.find(product => product.id == productId) || null;

        // Devolver el producto de la API si existe, de lo contrario, devolver el producto local
        return apiProduct || localProduct;
    } catch (error) {
        console.error('Error al obtener detalles del producto por ID:', error);
        return null;
    }
};


// Función para calcular y actualizar el precio total
const calculateAndUpdateTotalPrice = (cart) => {
    const totalCell = document.getElementById('total-price');
    const totalPrice = cart.products.reduce((total, product) => {
        const productDetails = getProductById(product.id); // Assuming there's a function to get product details by ID
        return total + (productDetails ? productDetails.price * product.quantity : 0);
    }, 0);

    totalCell.textContent = `$${totalPrice.toFixed(2)}`;
};