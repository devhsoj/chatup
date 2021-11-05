# Chatup

Chatup is an extremely simple, easy to use backup service for twitch messages.

## Requirements
`nodejs` `npm`

## Installation

```bash
git clone https://github.com/devhsoj/chatup.git
cd chatup/
npm i
```

## Example Usage

Single Channel
```bash
node index.js xqcow
```

Multiple Channels
```bash
node index.js xqcow sodapoppin
```

## Backups
Backups are stored in a **backups/** folder under where you installed **chatup** in the format of **{timestamp}**.db

They are written as a **sqlite3** database.

## License
[MIT](https://choosealicense.com/licenses/mit/)