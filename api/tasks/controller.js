const config = require('../../config')
const createAlias = require('../../utils/aliasGenerator')
const createUUID = require('../../utils/UUIDGenerator')

module.exports = injectedStore => {
    function createTask(newTask, userId) {
        console.log(newTask, userId)
        return new Promise(async (resolve, reject) => {
            if (newTask) {
                const requestedUser = userId ? await injectedStore.userModel.findOne({ _id: userId }) : null

                if (requestedUser) {
                    const taskToStore = new injectedStore.taskModel({
                        ...newTask,
                        ['files']: newTask.files ? newTask.files.map(file => `${config.cdn.host}:${config.cdn.port}/${config.cdn.publicRoute}${config.cdn.filesRoute}${file.originalname}`) : [],
                        user_id: requestedUser._id,
                        task_id: createUUID()
                    })

                    taskToStore.save((err) => {
                        if (err) reject(err)

                        resolve({})
                    })

                } else {
                    reject('something went wrong')
                }
            } else {
                resolve({})
            }
        })
    }

    return {
        createTask
    }
}