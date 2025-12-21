// supportAdmin.js

// Estados posibles
const estados = ["Recepción", "Reparación", "Entregado"];

// Cargar casos almacenados en localStorage
function cargarCasosAdmin() {
  const casos = JSON.parse(localStorage.getItem("casos")) || [];
  const tabla = document.getElementById("tablaCasosAdmin");
  tabla.innerHTML = "";

  casos.forEach(caso => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${caso.id}</td>
      <td>${caso.correo}</td>
      <td>${caso.tipo}</td>
      <td>${caso.marca}</td>
      <td>${caso.serial}</td>
      <td><strong>${caso.estado}</strong></td>
      <td>
        <button onclick="cambiarEstado(${caso.id})">➡️ Siguiente</button>
      </td>
    `;

    tabla.appendChild(fila);
  });
}

// Cambiar estado del caso
function cambiarEstado(id) {
  let casos = JSON.parse(localStorage.getItem("casos")) || [];
  let caso = casos.find(c => c.id === id);

  if (caso) {
    let index = estados.indexOf(caso.estado);
    if (index < estados.length - 1) {
      caso.estado = estados[index + 1]; // Avanzar al siguiente estado
    } else {
      alert("✅ El caso ya está en estado final: Entregado");
    }
  }

  // Guardar cambios en localStorage
  localStorage.setItem("casos", JSON.stringify(casos));
  cargarCasosAdmin();
}

// Inicializar
document.addEventListener("DOMContentLoaded", cargarCasosAdmin);
