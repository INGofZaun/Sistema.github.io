document.addEventListener("DOMContentLoaded", () => {
    inicializarDatos();
    cargarTabla();

    document.getElementById("btnLimpiar").addEventListener("click", e => {
        e.target.form.classList.remove("validado");
        let controles = e.target.form.querySelectorAll("input,select");
        controles.forEach(control => {
            control.classList.remove("valido");
            control.classList.remove("novalido");
        });
    });

    document.getElementById("tblUsuarios").addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-eliminar")) {
            let correo = e.target.dataset.correo;
            let usuarioNombre = e.target.dataset.nombre;
            document.getElementById("usuarioNombre").textContent = usuarioNombre;
            let modalEliminar = new bootstrap.Modal(document.getElementById('confirmacionEliminarModal'), { backdrop: 'static' });
            modalEliminar.show();
            document.getElementById("confirmarEliminarBtn").addEventListener("click", () => {
                eliminarUsuario(correo);
                cargarTabla();
                modalEliminar.hide();
            });
        } else if (e.target.tagName === "TD") {
            let nombre = e.target.textContent;
            let usuario = obtenerUsuarioPorNombre(nombre);
            mostrarModalEditar(usuario.correo);
        } else if (e.target.classList.contains("btn-restablecer-contraseña")) {
            let correo = e.target.dataset.correo;
            mostrarModalRestablecerContraseña(correo);
        }
    });

    // Agregar evento click al botón "Aceptar" del modal de registro
    document.getElementById("btnAceptar").addEventListener("click", () => {
        agregarUsuario();
    });

    // Agregar evento click al botón "Restablecer Contraseña" del modal de restablecer contraseña
    document.getElementById("btnRestablecerContraseña").addEventListener("click", () => {
        restablecerContraseña();
    });
});

function cargarTabla() {
    let usuarios = JSON.parse(localStorage.getItem('usuarios'));
    let tbody = document.querySelector("#tblUsuarios tbody");
    tbody.innerHTML = ""; // Limpiar el cuerpo de la tabla antes de cargar los datos
    for (var i = 0; i < usuarios.length; i++) {
        let usuario = usuarios[i];
        let fila = document.createElement("tr");
        let celdaNombre = document.createElement("td");
        celdaNombre.innerText = usuario.nombre;
        fila.appendChild(celdaNombre);

        let celdaCorreo = document.createElement("td");
        celdaCorreo.innerText = usuario.correo;
        fila.appendChild(celdaCorreo);

        let celdaTelefono = document.createElement("td");
        celdaTelefono.innerText = usuario.telefono;
        fila.appendChild(celdaTelefono);

       

        let celdaEliminar = document.createElement("td");
        let btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.classList.add("btn", "btn-danger", "btn-eliminar");
        btnEliminar.dataset.correo = usuario.correo;
        btnEliminar.dataset.nombre = usuario.nombre;
        celdaEliminar.appendChild(btnEliminar);
        fila.appendChild(celdaEliminar);

        let celdaRestablecer = document.createElement("td");
        let btnRestablecer = document.createElement("button");
        btnRestablecer.textContent = "Restablecer Contraseña";
        btnRestablecer.classList.add("btn", "btn-warning", "btn-restablecer-contraseña");
        btnRestablecer.dataset.correo = usuario.correo;
        celdaRestablecer.appendChild(btnRestablecer);
        fila.appendChild(celdaRestablecer);

        tbody.appendChild(fila);
    }
}

function agregarUsuario() {
    let nombre = document.getElementById("txtNombre").value;
    let correo = document.getElementById("txtEmail").value;
    let telefono = document.getElementById("txtTelefono").value;

    // Validar que no haya campos vacíos
    if (nombre.trim() === "" || correo.trim() === "") {
        alert("Por favor, completa todos los campos.");
        return;
    }

    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    // Obtener el correo original del usuario (en caso de edición)
    let correoOriginal = document.getElementById("txtCorreoOriginal").value;

    // Verificar si ya existe un usuario con el mismo correo (excluyendo el correo original)
    if (usuarios.some(usuario => usuario.correo === correo && usuario.correo !== correoOriginal)) {
        alert("Ya existe un usuario con este correo.");
        return;
    }

    // Si el correo original está vacío, significa que estamos agregando un nuevo usuario
    if (correoOriginal === "") {
        // Agregar el nuevo usuario
        usuarios.push({
            nombre: nombre,
            correo: correo,
            telefono: telefono
        });
    } else {
        // Buscar el índice del usuario a editar
        let index = usuarios.findIndex(usuario => usuario.correo === correoOriginal);

        // Si se encuentra el usuario a editar, actualizar sus datos
        if (index !== -1) {
            usuarios[index] = {
                nombre: nombre,
                correo: correo,
                telefono: telefono
            };
        }
    }

    // Guardar en el localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Limpiar los campos del formulario
    document.getElementById("frmRegistro").reset();

    // Cargar nuevamente la tabla con los datos actualizados
    cargarTabla();

    // Cerrar el modal de registro
    let modalRegistro = new bootstrap.Modal(document.getElementById('mdlRegistro'), { backdrop: 'static' });
    modalRegistro.hide();
}

function eliminarUsuario(correo) {
    let usuarios = JSON.parse(localStorage.getItem("usuarios"));
    let index = usuarios.findIndex(usuario => usuario.correo === correo);
    if (index !== -1) {
        usuarios.splice(index, 1);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }
}

function restablecerContraseña() {
    let correo = document.getElementById("txtCorreoRestablecer").value;
    let nuevaContraseña = document.getElementById("txtNuevaContraseña").value;
    let confirmarContraseña = document.getElementById("txtConfirmarNuevaContraseña").value;

    // Validar que las contraseñas coincidan
    if (nuevaContraseña !== confirmarContraseña) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    // Validar la nueva contraseña (agregar aquí más validaciones si es necesario)

    // Actualizar la contraseña en el almacenamiento local
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    let index = usuarios.findIndex(usuario => usuario.correo === correo);
    if (index !== -1) {
        usuarios[index].password = nuevaContraseña;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        alert("Contraseña restablecida correctamente.");
    } else {
        alert("No se encontró el usuario.");
    }

    // Cerrar el modal de restablecimiento de contraseña
    let modalRestablecer = new bootstrap.Modal(document.getElementById('mdlRestablecerContraseña'), { backdrop: 'static' });
    modalRestablecer.hide();
}

function mostrarModalEditar(correo) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios'));
    let usuario = usuarios.find(u => u.correo === correo);
    document.getElementById("txtNombre").value = usuario.nombre;
    document.getElementById("txtEmail").value = usuario.correo;
    document.getElementById("txtCorreoOriginal").value = usuario.correo;
    document.getElementById("txtTelefono").value = usuario.telefono;
    // Ocultar campos de contraseña
    document.getElementById("contra").style.display = "none";
    document.getElementById("contra2").style.display = "none";
    // Mostrar el modal de edición
    let modalEditar = new bootstrap.Modal(document.getElementById('mdlRegistro'), { backdrop: 'static' });
    modalEditar.show();
}

function obtenerUsuarioPorNombre(nombre) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios'));
    return usuarios.find(u => u.nombre === nombre);
}

function inicializarDatos() {
    let usuarios = localStorage.getItem('usuarios');
    if (!usuarios) {
        usuarios = [
            {
                nombre: 'Uriel Perez Gomez',
                correo: 'uriel@gmail.com',
                password: '123456',
                telefono: ''
            },
            {
                nombre: 'Lorena Garcia Hernandez',
                correo: 'lorena@gmail.com',
                password: '567890',
                telefono: '4454577468'
            }
        ];

        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
}
