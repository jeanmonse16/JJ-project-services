const error = require('../../utils/error')
const config = require('../../config')
const jwtAuth = require('../../auth_handlers')
const bcrypt = require('bcryptjs')

module.exports = (injectedStore) => {
    const createTaskDateNotification = async (task, typeIndex) => {
        let newNotification

        if (typeIndex) {
            if (typeIndex === 0 && Date.now() > task.expires_at) {
                newNotification = new injectedStore.taskNotificationModel({ task_id: task._id, seen: false, type: 'onExpire' })
                await newNotification.save((err) => {
                    if (err)
                        throw error('Something went wrong while creating the notification', 500)
                    return true
                })
                return {
                    expireDate: task.expires_at,
                    deleted_at: task.deleted_at,
                    taskTitle: task.title,
                    task_id: task.task_id,
                    columnName: task.columnName,
                    seen: false,
                    type: 'onExpire'
                }
            }
    
            else if (typeIndex === 1 && Date.now() > new Date(task.expires_at).getTime() - (60 * 60 * 60 * 1000)) {
                newNotification = new injectedStore.taskNotificationModel({ task_id: task._id, seen: false, type: 'onOneDayLeft' })
                await newNotification.save((err) => {
                    if (err)
                        throw error('Something went wrong while creating the notification', 500)
                    return true
                })
                return {
                    expireDate: task.expires_at,
                    deleted_at: task.deleted_at,
                    taskTitle: task.title,
                    task_id: task.task_id,
                    columnName: task.columnName,
                    seen: false,
                    type: 'onOneDayLeft'
                }
            }
    
            else if (typeIndex === 2 && Date.now() > new Date(task.expires_at.getDate() - 7)) {
                newNotification = new injectedStore.taskNotificationModel({ task_id: task._id, seen: false, type: 'onOneWeekLeft' })
                await newNotification.save((err) => {
                    if (err)
                        throw error('Something went wrong while creating the notification', 500)
                    return true
                })
                return {
                    expireDate: task.expires_at,
                    deleted_at: task.deleted_at,
                    taskTitle: task.title,
                    task_id: task.task_id,
                    columnName: task.columnName,
                    seen: false,
                    type: 'onOneWeekLeft'
                }
            }

            else 
                return null
            
        } else {
            if (Date.now() > task.expires_at) {
                newNotification = new injectedStore.taskNotificationModel({ task_id: task._id, seen: false, type: 'onExpire' })
                await newNotification((err) => {
                    if (err)
                        throw error('Something went wrong while creating the notification', 500)
                })
                return {
                    expireDate: task.expires_at,
                    deleted_at: task.deleted_at,
                    taskTitle: task.title,
                    task_id: task.task_id,
                    columnName: task.columnName,
                    seen: false,
                    type: 'onExpire'
                }
            }
    
            else if (Date.now() > new Date(task.expires_at).getTime() - (60 * 60 * 60 * 1000)) {
                newNotification = new injectedStore.taskNotificationModel({ task_id: task._id, seen: false, type: 'onOneDayLeft' })
                await newNotification.save((err) => {
                    if (err)
                        throw error('Something went wrong while creating the notification', 500)
                    return true
                })
                return {
                    expireDate: task.expires_at,
                    deleted_at: task.deleted_at,
                    taskTitle: task.title,
                    task_id: task.task_id,
                    columnName: task.columnName,
                    seen: false,
                    type: 'onOneDayLeft'
                }
            }
    
            else if (Date.now() > new Date(task.expires_at.getDate() - 7)) {
                newNotification = new injectedStore.taskNotificationModel({ task_id: task._id, seen: false, type: 'onOneWeekLeft' })
                await newNotification.save((err) => {
                    if (err)
                        throw error('Something went wrong while creating the notification', 500)
                    return true
                })
                return {
                    expireDate: task.expires_at,
                    deleted_at: task.deleted_at,
                    taskTitle: task.title,
                    task_id: task.task_id,
                    columnName: task.columnName,
                    seen: false,
                    type: 'onOneWeekLeft'
                }
            }

            else {
                return null
            }    
        }
    }




    function getUserProfile(userEmail) {
        return new Promise(async (resolve, reject) => {
            const userData = await injectedStore.userModel.findOne({ email: userEmail })
            if (userData) {
                let profile, notifications = [], totalNotifications = []
                let userTasks = await injectedStore.taskModel.find({ user_id: userData._id })

                const getTaskColumns = async tasks => {
                    let taskColumnsToReturn = []
              
                    Promise.all(
                      tasks.map(async task => {
                        if (!taskColumnsToReturn.find(taskColumn => taskColumn === task.columnName)) {
                          const queryColumn = await injectedStore.columnModel.findOne({ name: task.columnName })
                          if (queryColumn) {
                            Promise.resolve(taskColumnsToReturn.push({
                              id: queryColumn.tasks_id,
                              name: task.columnName,
                            }))
                          } else {
                            Promise.resolve({})
                          }
                        } else {
                            Promise.resolve({})
                        }
                      })
                    )
              
                    return taskColumnsToReturn
                }

                const taskColumns = await getTaskColumns(userTasks)
                userTasks = userTasks.map(task => {
                    if (taskColumns.find(taskColumn => taskColumn.name === task.columnName)) {
                        return {
                            ...task._doc,
                            columnId: taskColumns.find(taskColumn => taskColumn.name === task.columnName).id
                        }
                    } else {
                        return {
                            ...task._doc,
                            columnId: null
                        }
                    }
                })

                Promise.all( userTasks.map(async task => {
                    let taskNotifications = await injectedStore.taskNotificationModel.find({ task_id: task._id })
                    let newNotification

                    if (taskNotifications && taskNotifications.length) {
                        taskNotifications = taskNotifications.map(taskNotification => totalNotifications.push({
                            expireDate: task.expires_at,
                            deleted_at: task.deleted_at,
                            taskTitle: task.title,
                            task_id: task.task_id,
                            columnName: task.columnName,
                            seen: taskNotification.seen || true,
                            type: taskNotification.type
                        }))

                        if (!taskNotifications.find(notification => notification.type === 'onExpire')) {
                            newNotification = await createTaskDateNotification(task, 0)
                            newNotification ? totalNotifications.push(newNotification) : null
                        }

                        else if (!taskNotifications.find(notification => notification.type === 'onOneDayLeft')) {
                            newNotification = await createTaskDateNotification(task, 1)
                            newNotification ? totalNotifications.push(newNotification) : null
                        }

                        else if (!taskNotifications.find(notification => notification.type === 'onOneWeekLeft')) {
                            newNotification = await createTaskDateNotification(task, 2)
                            newNotification ? totalNotifications.push(newNotification) : null
                        }

                    }

                    else {
                        newNotification = createTaskDateNotification(task)
                        newNotification ? totalNotifications.push(newNotification) : null
                    }

                }))
                  .then(() => {
                      totalNotifications = totalNotifications.sort((a, b) => new Date(b.expiresDate) - new Date(a.expiresDate))
                  })
                  .catch((e) => reject({ message: 'Something went wrong: ' + e, code: 404 }))   

                if (userData.facebook_id || userData.google_id) {
                    profile = {
                        username: userData.username,
                        alias: userData.alias,
                        tasks: userTasks || [],
                        notifications: totalNotifications.length ? totalNotifications.slice(0, 20) : [],
                        notSeenNotifications: notifications.filter(notification => !notification.seen).length,
                        profileImage: userData.profile_picture || null,
                        firstTime: userData.firstTime || false,
                        email: userData.email,
                        socialMediaUser: true
                    }

                    if (userData.facebook_id) {
                        profile.facebook_fullname = userData.facebook_fullname
                        resolve({ profile: profile })
                    } else {
                        profile.google_fullname = userData.google_fullname
                        profile.google_given_name = userData.google_given_name
                        resolve({ profile: profile })
                    }
    
                }
                
                else {
                    profile = {
                        username: userData.username,
                        alias: userData.alias,
                        tasks: userTasks || [],
                        notifications: totalNotifications.length ? totalNotifications.slice(0, 20) : [],
                        notSeenNotifications: notifications.filter(notification => !notification.seen).length,
                        profileImage: userData.profile_picture || null,
                        firstTime: userData.firstTime || false,
                        email: userData.email,
                        socialMediaUser: false
                    }
    
                    resolve({ profile: profile })
                }

            } else {
                reject({ message: 'Cannot find the user you requested', code: 404 })
            }
        })
    }




    function updateSessionKey(reqBody) {
        return new Promise(async (resolve, reject) => {
            if (reqBody.userEmail && reqBody.alias) {
                let userQuery = await injectedStore.userModel.findOne({ alias: reqBody.alias })

                userQuery
                  ? resolve({ feedback: 'sessionKey updated!', key: jwtAuth.sign({ email: userQuery.email, alias: userQuery.alias }) })
                  : reject({ message:'No user found', code: 404 })
            }
    
            else {
                reject({ message: 'no user alias or email found', code: 500 })
            }
        })
    }




    function updateUserNotifications(req) {
        return new Promise((resolve, reject) => {
            const userNotificationsIds = req.notifications
            Promise.all(
                userNotificationsIds.map(async id => {
                    const taskNotification = await injectedStore.taskNotificationModel.findOne({ _id: id })
                    if (taskNotification) {
                        taskNotification.seen = true
                        taskNotification.save((err) => {
                            if (err)
                                Promise.reject('something went wrong')
                            return true
                        })
                    } else {
                        Promise.reject('something went wrong')
                    }
                })
            )
              .then(() => resolve({}))
              .catch((err) => reject(err))
        })
    }




    function updateUser (userUpdate) {
        return new Promise (async (resolve, reject) => {
            let userToUpdate = await injectedStore.userModel.findOne({ alias: userUpdate.alias })

            if (userToUpdate) {
                
                if (userUpdate.profileImage) {
                    let newUserProfileImage = ''
                    
                    userUpdate.profileImage.originalname 
                        ? newUserProfileImage = `${config.cdn.host}${config.cdn.port.length ? ':' + config.cdn.port : ''}${config.cdn.publicRoute}/${config.cdn.filesRoute}${userUpdate.profileImage.originalname }`
                        : newUserProfileImage = userUpdate.profileImage

                    userToUpdate.profile_picture = newUserProfileImage
                }

                if (userUpdate.email) {
                    userToUpdate.email = userToUpdate.email
                }

                if (userUpdate.username) {
                    let usernameQuery = await injectedStore.userModel.findOne({ username: userUpdate.username }) 

                    usernameQuery
                        ? reject({ message: 'this username already exists', code: 409 })
                        : userToUpdate.username = userUpdate.username
                }

                if (userUpdate.currentPassword) {
                    await bcrypt.compare(userUpdate.currentPassword, userToUpdate.password)
                          .then(async (isCorrect) => {
                              if (isCorrect) {
                                  userToUpdate.password = await bcrypt.hash(userUpdate.newPassword, 5)
                               } else {
                                  reject({message: 'Credenciales inválidas, intentalo de nuevo', code: 404 })
                              }
                          })
                          .catch(e => reject({ message: 'ocurrio un error: ' + e, code: 500 }))
                }


                userToUpdate.save(err => {
                    if (err)
                        reject({ message: 'something went wrong', code: 500 })

                    resolve({})
                })

            }

            else {
                reject({ message: 'User not found', code: 404 })
            }
        })
    }




    function endUserFirstTime(userAlias) {
        return new Promise(async (resolve, reject) => {
            if (userAlias) {
                const requestedUser = await injectedStore.userModel.findOne({ alias: userAlias })

                if (requestedUser) {
                    requestedUser.firstTime = false
                    requestedUser.save(err => {
                        if (err) {
                            console.log(err)
                            reject('something went wrong')
                        }

                        resolve({})
                    })
                } else {
                    reject('no user found')
                }
            } else {
                reject('You cant access this')
            }
        })
    }

    return {
        getUserProfile,
        updateSessionKey,
        updateUserNotifications,
        updateUser,
        endUserFirstTime
    }
}

