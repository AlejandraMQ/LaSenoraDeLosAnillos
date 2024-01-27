//! Mis comentarios son asi porque ocupo la extension Better Comments

//!Clases a usar
//tiene un constructor que inicializa la propiedad elemetos como un array vacio
class Carro {
  constructor() {
    this.elementos = [];
  }
  //?agregar elementos al carrito, si ya existe incrementa la cantidad, si la cantidad <=0 elimina el elemnto
  agregarElemento(id, cant = 1) {
    id = parseInt(id);
    const elemento = this.elementos.find((el) => el.item.id === id);
    if (elemento) {
      elemento.cant += cant;

      if (elemento.cant <= 0) {
        return this.eliminarElemento(id);
      }
    } else {
      const item = items.find((el) => el.id === id);
      this.elementos.push({ item, cant });
    }
    this.salvarData();
    renderCarrito();
  }
  //*elimina un elemento del carro por su ID
  eliminarElemento(id) {
    id = parseInt(id);
    this.elementos = this.elementos.filter((a) => a.item.id !== id);
    this.salvarData();
    renderCarrito();
  }
  //**vacia el carrito
  vaciarCarrito() {
    this.elementos = [];
    this.salvarData();
    renderCarrito();
  }
  //*carga los elementos del carrito desde el almacenamiento de sesión filtrando aquellos que no existen en la lista de productos ("items")
  cargarData() {
    const elementos = sessionStorage.getItem("elementos");
    // se valida que los elementos guardados en el storage existan
    this.elementos = elementos
      ? JSON.parse(elementos).filter((el) =>
          items.some((it) => it.id === el.item.id)
        )
      : [];
    renderCarrito();
  }
  //*guarda los elementos del carrito en el almacenamiento de sesión
  salvarData() {
    sessionStorage.setItem("elementos", JSON.stringify(this.elementos));
  }
}
//!formatea los numeros como moneda en español
const dineroFormato = Intl.NumberFormat("es-Cl");

//*renderiza un elemento de la lista de productos con un boton para agregar el carrito
function renderItemListado(item) {
  return `<div class="item">
      <span class="titulo-item">${item.nombre}</span>
      <img src="${item.img}" alt="${item.alt}" class="img-item">
      <span class="precio-item">$ ${dineroFormato.format(item.precio)}</span>
      <button type="button" class="boton-item" value="${
        item.id
      }">Agregar al Carrito</button>
    </div>`;
}
//*renderiza la lista de productos en el html con capacidad de filtrar por nombre
function renderProductos() {
  let itemsToRender = categoria === 'all'? items : items.filter(item => item.categoria === categoria);
 itemsToRender =  Buscador === ""
      ? itemsToRender
      : itemsToRender.filter((item) => {
          const nombre = item.nombre
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          return nombre.indexOf(Buscador) > -1;
        });

  document.getElementById("items").innerHTML = itemsToRender
    .map(renderItemListado)
    .join("\n");
  const btns = document.querySelectorAll("#items > div > button");
  btns.forEach((el) => {
    el.addEventListener("click", (ev) => {
      const value = ev.target.value;
      carro.agregarElemento(value);
    });
  });
}
//*renderiza un elemento en el carrito de compras, con opciones para cambiar la cantidad y eliminar un elemento
function renderItemCarrito(item, cant) {
  return ` <div class="carrito-item">
  <img src="${item.img}" width="100px" alt="">
  <div class="carrito-item-detalles">
      <span class="carrito-item-titulo">${item.nombre}</span>
      <div class="selector-cantidad">
          <i class="fa-solid fa-minus restar-cantidad" id="${item.id}"></i>
          <input type="text" value="${cant}" class="carrito-item-cantidad" disabled>
          <i class="fa-solid fa-plus sumar-cantidad" id="${item.id}"></i>
      </div>
      <span class="carrito-item-precio">$ ${dineroFormato.format(
        item.precio * cant
      )}</span>
  </div>
  <button class="btn-eliminar" type="button" value="${item.id}">
      <i class="fa-solid fa-trash"></i>
  </button>
</div>`;
}
//*renderiza el carrito de compras en el html, mostrando los elementos, cantidad, precio y un boton de pago
function renderCarrito() {
  const carrito = document.getElementById("carro");
  if (carro.elementos.length === 0) {
    carrito.innerHTML = "";
    carrito.hidden = true;
    return;
  }
  carrito.hidden = false;
  let html = "";
  let total = 0;
  carro.elementos.forEach((el) => {
    html += renderItemCarrito(el.item, el.cant);
    total += el.cant * el.item.precio;
  });
  carrito.innerHTML = `<div class="header-carrito"><h2>Tu carrito</h2></div>
                       <div class="carrito-items">${html}</div>
                       <div class="carrito-total">
                        <div class="fila">
                        <strong>Tu total</strong>
                        <span class="carrito-precio-total">$ ${dineroFormato.format(
                          total
                        )}</span>
                       </div>
                       <button type="button" class="btn-pagar" id="btnPago">Pagar <i class="fa-solid fa-bag-shopping"></i></button>
                      </div>`;
  const deleteButtons = document.querySelectorAll(
    "#carro > div.carrito-items > div > button"
  );
  deleteButtons.forEach((el) => {
    el.addEventListener("click", (ev) => {
      const value = ev.target.value;
      carro.eliminarElemento(value);
    });
  });

  const restarElemento = document.querySelectorAll(
    "#carro > div.carrito-items > div > div > div > i.fa-solid.fa-minus.restar-cantidad"
  );
  restarElemento.forEach((el) => {
    el.addEventListener("click", (ev) => {
      const value = ev.target.id;
      carro.agregarElemento(value, -1);
    });
  });
  const agregarElemento = document.querySelectorAll(
    "#carro > div.carrito-items > div > div > div > i.fa-solid.fa-plus.sumar-cantidad"
  );
  agregarElemento.forEach((el) => {
    el.addEventListener("click", (ev) => {
      const value = ev.target.id;
      carro.agregarElemento(value);
    });
  });
  const btnPago = document.getElementById("btnPago");
  btnPago.addEventListener("click", () => {
    pagar();
    //!uso de la libreria SweetAlert
    swal.fire("Pago Exitoso", "Se han pagado los productos del carro");
  });
}
function renderCategorias(){
  const select = document.getElementById("categorias");
  let options = `<option value="all" ${categoria === "all"? "selected":""}>Todos los productos</option>`
  for(let cat of categorias){
    const nombre = cat.charAt(0).toUpperCase() + cat.substring(1)
    options=options +`<option value="${cat}" ${categoria === cat? "selected":""}>${nombre}</option>`
  }
  select.innerHTML = options
}
//**realiza una solicitud fetch para obtener datos de productos desde Json local
async function getItems() {
  const response = await fetch("./statics/items.json");
  return await response.json();
}
//**vacia el carrito de compras y muestra un mensaje de pago exitoso
function pagar() {
  carro.vaciarCarrito();
}

// !Variables globales
//?items: almacena la lista de productos
//?carro: instacia de la clase carro que representa el carrito de compras
//?buscador: almacena el termino de la busqueda para filtrar productos
let items;
const carro = new Carro();
let Buscador = "";
let categorias = [];
let categoria = "all"

addEventListener("DOMContentLoaded", async () => {
  items = await getItems();
  categorias = items.map(item => item.categoria).filter((item,i,arr) => i === arr.findIndex(row => row === item));
  categorias = categorias.sort();
  renderCategorias();
  renderProductos();
  carro.cargarData();
  document.getElementById("Buscador").addEventListener("keyup", async (ev) => {
    Buscador = ev.target.value.toLowerCase();
    renderProductos();
  });
  document.getElementById("categorias").addEventListener("change",(ev) => {
    categoria = ev.target.value;
    renderProductos();
  })
});
