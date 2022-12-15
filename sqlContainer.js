const knex = require('knex')


class ContenedorSQL{
    constructor(options) {
        this.knex = knex(options)
    }

    crearTabla(){
        return this.knex.schema.dropTableIfExists('productos')
        .finally(()=> {
            return this.knex.schema.createTable('productos', table => {
                table.increments('id').primary()
                table.string('title', 50).notNullable()
                table.float('price').notNullable()
                table.string('thumbnail',200).notNullable()

            })
        })
    }

    insertarProductos(productos) {
        return this.knex('productos').insert(productos)
    }

    listarProductos() {
        return this.knex('productos').select('*')
    }

    close() {
        this.knex.destroy()
    }
}

module.exports = {
    ContenedorSQL
}