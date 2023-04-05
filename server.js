const app = require("./src/app");
const PORT = process.env.DEV_APP_PORT || 3056

const server = app.listen(PORT, () => {
    console.log(`Server start with ${PORT}`)
})

// process.on('SIGNINT', () => {
//     server.close(() => console.log(`Exit server express`))
//     //notify.send() email, message
// })