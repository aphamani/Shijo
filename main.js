const { Client, Collection, Intents } = require('discord.js');
require('dotenv').config({ path: 'config/.env' })

const shijo = new Client({
    intents: [

    ]
})

shijo.on('ready', () => {
    console.log('The bot is on')
})

shijo.login(process.env.TOKEN)
