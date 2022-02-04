const { existsSync, mkdirSync, statSync } = require('fs')
const { resolve } = require('path')
const { open } = require('sqlite')

const sqlite3 = require('sqlite3')
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

        const timestamp = new Date()
        const stats = {
            messages:0,
            subMessages:0,
            latestMessage:{
                username:'',
                message:''
            },
            archive:{
                size:0
            }
        }


        const filename = resolve(__dirname,`backups/${timestamp.getTime()}.db`)
        const db = await open({
            driver:sqlite3.Database,
            filename
        })

        process.on('SIGINT',async () => {
            await db.close()
            process.exit(0)
        })
    
        await db.exec('CREATE TABLE messages(id VARCHAR(36) PRIMARY KEY NOT NULL,channel VARCHAR(26),username VARCHAR(25),subscribed bool,message text)')

        client.on('message',async (channel,tags,message) => {
            try {
                const { id, username, subscriber } = tags

                await db.run(
                    'INSERT INTO messages (id,channel,username,subscribed,message) VALUES (?,?,?,?,?)',
                    id,
                    channel,
                    username,
                    subscriber,
                    message
                )

                stats.latestMessage = {
                    username,
                    message
                }

                if(subscriber) {
                    stats.subMessages++
                }

                stats.messages++
            } catch(err) {
                console.trace(`Failed to save message: ${err}`)
            }
        })

        setInterval(() => {
            stats.archive.size = statSync(filename).size

            console.clear()
            console.log(`
Backing up messages for channels: ${channels.join(',')}
                
Total messages: ${stats.messages}
Subscriber messages: ${stats.subMessages}

Latest message: [${stats.latestMessage.username}]: ${stats.latestMessage.message}

Backup size: ${stats.archive.size / 1024} kb
            `
            )
        },1000)
    } catch(err) {
        console.trace(`Failed to start ${err}`)
    }
})()