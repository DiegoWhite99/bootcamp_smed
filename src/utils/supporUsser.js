// ========== Mostrar formularios ==========
function mostrarFormulario(tipo) {
  document.getElementById("formCliente").classList.add("hidden");
  document.getElementById("formLoginAsistente").classList.add("hidden");
  document.getElementById("formAsistente").classList.add("hidden");
  document.getElementById("resultado").classList.add("hidden");

  if (tipo === "cliente") {
    document.getElementById("formCliente").classList.remove("hidden");
  } else if (tipo === "asistente") {
    // Primero pedimos login
    document.getElementById("formLoginAsistente").classList.remove("hidden");
  }
}

// ========== Login Asistente ==========
function loginAsistente() {
  const user = document.getElementById("userAsistente").value;
  const pass = document.getElementById("passAsistente").value;
  const errorMsg = document.getElementById("loginError");

  // Usuario y contraseña simples para demo
  if (user === "admin" && pass === "1234") {
    errorMsg.classList.add("hidden");
    document.getElementById("formLoginAsistente").classList.add("hidden");
    document.getElementById("formAsistente").classList.remove("hidden");
  } else {
    errorMsg.classList.remove("hidden");
  }
}

// ========== Registrar caso ==========
function registrarCaso(origen) {
  const caseId = "CASE-" + Math.floor(Math.random() * 100000);

  // Guardamos el caso en localStorage (simulación de BD)
  const casos = JSON.parse(localStorage.getItem("casos")) || [];
  casos.push({
    id: caseId,
    estado: "recepcion", // siempre inicia en recepción
    origen: origen,
    fecha: new Date().toISOString()
  });
  localStorage.setItem("casos", JSON.stringify(casos));

  // Mostramos resultado con botón a progreso
  const resultado = document.getElementById("resultado");
  resultado.classList.remove("hidden");
  resultado.innerHTML = `
    <p>✅ Registro exitoso (${origen === "asistente" ? "Laboratorio" : "Cliente"}).<br>
    Tu número de caso es: <strong>${caseId}</strong></p>
    <div style="margin-top:12px;">
      <a href="progreso.html?case=${caseId}" class="ingresar-btn">Ver progreso</a>
    </div>
  `;
}
