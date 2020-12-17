const error = require('../../utils/error')

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
                    taskColumn: task.taskColumn,
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
                    taskColumn: task.taskColumn,
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
                    taskColumn: task.taskColumn,
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
                    taskColumn: task.taskColumn,
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
                    taskColumn: task.taskColumn,
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
                    taskColumn: task.taskColumn,
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

                Promise.all( userTasks.map(async task => {
                    let taskNotifications = await injectedStore.taskNotificationModel.find({ task_id: task._id })
                    let newNotification

                    if (taskNotifications && taskNotifications.length) {
                        taskNotifications = taskNotifications.map(taskNotification => totalNotifications.push({
                            expireDate: task.expires_at,
                            deleted_at: task.deleted_at,
                            taskTitle: task.title,
                            task_id: task.task_id,
                            taskColumn: task.taskColumn,
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
                  .catch((e) => reject('Something went wrong: ' + e))

                                

                if (userData.facebook_id || userData.google_id) {
                    profile = {
                        alias: userData.alias,
                        tasks: userTasks || [],
                        notifications: totalNotifications.length ? totalNotifications.slice(0, 20) : [],
                        notSeenNotifications: notifications.filter(notification => !notification.seen).length,
                        profileImage: userData.profile_image || null,
                        firstTime: userData.firstTime || false
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
                        profileImage: userData.profile_image || null,
                        firstTime: userData.firstTime || false
                    }
    
                    resolve({ profile: profile })
                }

            } else {
                reject('Cannot find the user you requested')
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




    function endUserFirstTime({ userEmail, userAlias }) {
        return new Promise(async (resolve, reject) => {
            if (userEmail && userBody) {
                const requestedUser = await injectedStore.userModel.findOne({ alias: userAlias })

                if (requestedUser) {
                    requestedUser.firstTime = false
                    requestedUser.save(err => {
                        if (err) {
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
        updateUserNotifications,
        endUserFirstTime
    }
}

