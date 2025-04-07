/* ---------------------------> apartado de resposive <----------------------- */


function MyMenuFuction(){
    var i = document.getElementById("navMenu");

    if(i.className === "nav-menu") {
        i.className += "resposive";
    } else {
        i.className = "nav-menu";
    }
}

var a = document.getElementById("loginbtn");
var b = document.getElementById("registerbtn");
var x = document.getElementById("login");
var y = document.getElementById("register");

/* ---------------------------> apartado de funciones para validacion de datos<----------------------- */

function login() {
    x.style.left = "20px";
    y.style.right = "-520px";
    a.className += " white-btn";
    b.className = "btn";
    x.style.opacity  = 1;
    y.style.opacity  = 0;
}

function register(){
    x.style.left = "-510px";
    y.style.right = "5px";
    a.className = "btn";
    b.className += " white-btn";
    x.style.opacity  = 0;
    y.style.opacity  = 1;
}

function validar() {
    var password = document.getElementById("contraseña").value;
    var confirmPassword = document.getElementById("confirmContraseña").value;
    var botonRegistro = document.getElementById("confirmation").value;

    var campos = ["nombre", "apellido", "email", "contraseña", "confirmContraseña"];

    for (i = 0; i < campos.length; i++) {
        var valorCampo = document.getElementById(campos[i]).value;
        if (valorCampo === ""){
            botonRegistro.disabled = true;
            alert("Revisa los campos");
            return false;
        }
    }

    if (password !== confirmPassword) {
        botonRegistro.disabled = true;
        alert("Contraseñas no coinciden");
        return false;
    } else {
        botonRegistro.disabled = false;
        alert("Registro Exitoso");
        window.location = "login.html"; 
        return true;
    }
    
}
/* ---------------------------> finn deapartado de funciones para validacion de datos<----------------------- */

