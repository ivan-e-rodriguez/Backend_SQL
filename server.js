const express = require('express')
const handlebars = require('express-handlebars')
const { Server: HttpServer } = require('http')
const { default: knex } = require('knex')
const { Server: IOServer } = require('socket.io')



const app = express()
const httpServer = HttpServer(app)
const io = new IOServer(httpServer)


app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('./public'))

//------------------------------------------------HANDLEBARS---------------------------------------------------------------------------

app.engine('handlebars', handlebars.engine())

app.set('views', './public/views')
app.set('view engine', 'handlebars')


const { options } = require('./options/mysqlconn.js')
const { options2 } = require('./options/sqlite3.js')
const { ContenedorSQL } = require('./sqlContainer.js')
const { ContenedorSQLite } = require('./sqliteContainer.js')


const sql = new ContenedorSQL(options)

const sqlite = new ContenedorSQLite(options2)

//------------------------------------------------WEB SOCKET---------------------------------------------------------------------------




const mensajes = []

io.on('connection', socket => {

  socket.emit('mensajes', mensajes)

  socket.on('mensaje', data => {
    sqlite.crearTabla()
        .then(() => {
          mensajes.push(data)
          return sqlite.insertarProductos(mensajes)
        })
    

    io.sockets.emit('mensajes', mensajes)
  })
})




//-------------------------------------------PRODUCTOS -----------------------------------------------------------------------------------

sql.crearTabla()
        .then(() => {
          const productos = [
            {
              "title": "Escuadra",
              "price": 123.45,
              "thumbnail": "https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png",

            },
            {
              "title": "Calculadora",
              "price": 234.56,
              "thumbnail": "https://cdn3.iconfinder.com/data/icons/education-209/64/calculator-math-tool-school-256.png",

            },
            {
              "title": "Globo Terráqueo",
              "price": 345.67,
              "thumbnail": "https://cdn3.iconfinder.com/data/icons/education-209/64/globe-earth-geograhy-planet-school-256.png",

            }
          ]

          return sql.insertarProductos(productos)
        })
        .then(()=>{
          return sql.listarProductos()
        })
        .then((productos) =>{
          app.get('/productos', (req, res) => {
            let listaProductos = false;
          
            if (productos.length > 0) {
              listaProductos = true
            }
          
            res.render('./partials/productos', { listaProductos: listaProductos, productos : productos})
          })
        })
        .finally(()=> {
          sql.close();
        })





//-------------------------------------------------ROUTER PRODUCTOS-------------------------------------------------------------------




app.post('/productos', (req, res) => {

  sql.insertarProductos(req.body)
  res.redirect('/productos')
})


//------------------------------------------------CONEXION--------------------------------------------------------------------------

const PORT = 8080

httpServer.listen(PORT, () => {
  console.log("Escuchando en 8080");
})