const req = {
    body: {
        id: null
    },
    headers: {
        text: 'hello world!'
    }
}

const id = req.body.id;
const room = req.body.room;

console.log(id, room);
console.log(req.body.room());