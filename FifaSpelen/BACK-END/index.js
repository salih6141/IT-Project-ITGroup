const http = require ('http')
const poort = 3000

const server = http.createServer(function (req, res) {
    res.write('Welkom')
    res.end()
})

server.

server.listen(poort, function(error) {
    if (error) {
        console.log('Er is iets misgelopen', error)
    }
    else {
        console.log('Server is gestart op poort', + poort)
    }
})