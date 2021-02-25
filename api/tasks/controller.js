const config = require('../../config')
const createAlias = require('../../utils/aliasGenerator')
const createUUID = require('../../utils/UUIDGenerator')

module.exports = injectedStore => {
    function createTask(newTask, userAlias) {
        return new Promise(async (resolve, reject) => {
            if (newTask.expires_at && newTask.title && newTask.columnName) {
                const requestedUser = userAlias ? await injectedStore.userModel.findOne({ alias: userAlias }) : null

                if (requestedUser) {

                    const columnQuery = await injectedStore.columnModel.findOne({ name: newTask.columnName }) 

                    if (!columnQuery) {
                        const columnToStore = new injectedStore.columnModel({
                            name: newTask.columnName,
                            tasks_id: createUUID(0, 8)
                        })

                        columnToStore.save((err) => {
                            if (err) reject({ code: 500, message: 'Could not create column task' })
                        })

                    }

                    const taskToStore = new injectedStore.taskModel({
                        ...newTask,
                        ['files']: newTask.files ? newTask.files.map(file => `${config.cdn.host}${config.cdn.port.length ? ':' + config.cdn.port : ''}${config.cdn.publicRoute}${config.cdn.filesRoute}${file.originalname}`) : [],
                        user_id: requestedUser._id,
                        task_id: createUUID().slice(0, 6)
                    })

                    taskToStore.save((err) => {
                        if (err) reject(err)

                        resolve({})
                    })

                } else {
                    reject({ message:'user not found', code: 404 })
                }
            } else {
                resolve({})
            }
        })
    }

    function updateTask (taskToEdit) {
        return new Promise (async (resolve, reject) => {
            if (taskToEdit.title && taskToEdit.expires_at && taskToEdit.columnName) {
                const requestedTask = await injectedStore.taskModel.findOne({ task_id: taskToEdit.id })

                if (requestedTask) {
                    const columnQuery = await injectedStore.columnModel.findOne({ name: taskToEdit.columnName }) 

                    if (!columnQuery) {
                        const columnToStore = new injectedStore.columnModel({
                            name: taskToEdit.columnName,
                            tasks_id: createUUID(0, 8)
                        })

                        columnToStore.save((err) => {
                            if (err) reject({ code: 500, message: 'Could not create column task' })
                        })
                    } 

                    requestedTask.title = taskToEdit.title
                    requestedTask.description = taskToEdit.description
                    requestedTask.expires_at = taskToEdit.expires_at
                    requestedTask.columnName = taskToEdit.columnName
                    requestedTask.state = 'pending'
                    requestedTask.files = taskToEdit.files ? taskToEdit.files.map(fileName => `${config.cdn.host}${config.cdn.port.length ? ':' + config.cdn.port : ''}/taskfiles/${fileName}`) : []
    
                    requestedTask.save((err) => {
                        if (err) reject({ message: err, code: 500 })
    
                         resolve({})
                    })
                } else {
                    reject({ message: 'The task does not exist' , code: 409 })
                }
            } else {
                resolve({})
            }
        })
    }

    return {
        createTask,
        updateTask
    }
}