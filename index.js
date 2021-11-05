const {existsSync,mkdirSync} = require('fs')
const sqlite3 = require('sqlite3')
const {resolve} = require('path')
const {open} = require('sqlite')
const tmi = require('tmi.js')

;(async () => {
    try {
        const channels = process.argv.slice(2)
    
        if(channels.length <= 0) {
            console.log('usage: node index.js [channel1] [channel2] (etc..)')
            process.exit(1)
        }

        const client = new tmi.Client({channels})
    
        await client.connect()
    
        if(!existsSync(resolve(__dirname,'backups/'))) {
            mkdirSync(resolve(__dirname,'backups/'))
        }

        const db = await open({
            filename:resolve(__dirname,'backups/' + Date.now() + '.db'),
            driver:sqlite3.Database
        })

        process.on('SIGINT',async () => {
            await db.close()
            process.exit(0)
        })
    
        await db.exec('CREATE TABLE messages(id VARCHAR(36) PRIMARY KEY NOT NULL,channel VARCHAR(26),username VARCHAR(25),subscribed bool,message text);')
    
        client.on('message',async (channel,tags,message) => {
            try {
                const {id,username,subscriber} = tags
    
                await db.run(
                    'INSERT INTO messages (id,channel,username,subscribed,message) VALUES (?,?,?,?,?)',
                    id,
                    channel,
                    username,
                    subscriber,
                    message
                )
            } catch(err) {
                console.trace('Failed to save message:',err)
            }
        })
    } catch(err) {
        console.trace('Failed to start:',err)
    }
})()