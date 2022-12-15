const socket = io()

socket.on('mensajes', data =>{
    const mensajesHtml = data
        .map(msj => {

            return `[${msj.date}] ${msj.email} dice: ${msj.mensaje}`
        })

        .join('<br>')

        document.getElementById('chat').innerHTML = mensajesHtml
})

function addMsj(){
    const mens = {
        email: document.getElementById('mail').value,
        mensaje: document.getElementById('msj').value,
        date: new Date().toLocaleString()
    }

    socket.emit('mensaje', mens)
    return
}