const users = []

const addUser = ({id, username, room}) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if (!username || !room) {
        return {
            error: 'Username And Room Are Required'
        }
    }


    //check existing user
    const existinguser = users.find((user) => {
        return user.room === room && user.username === username
    })

//validate username
    if (existinguser) {
        return {
            error: "Username already exist in the room!"
        }
    }
    //store user
    const user = {id,username,room}
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    const index = users.findIndex((user)=>user.id === id)
    if (index!==-1){
        return users.splice(index,1)[0]
        //return array with single item,extract it with [0] so it's not array anymore
    }
}

const getUser = (id)=>{
    return users.find((user)=> user.id === id)
}

const getUserInRoom = (room)=>{
    return users.filter((user)=>user.room === room)

}
module.exports = {
    addUser,
    removeUser,
    getUserInRoom,
    getUser
}