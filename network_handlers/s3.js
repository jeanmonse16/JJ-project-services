const AWS = require("aws-sdk")
const config = require('../config')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const multerS3 = require('multer-s3')

module.exports = () => {
    //const credentials = new AWS.SharedIniFileCredentials({profile: 'personal-account'})
    const credentials = {
      expired: false,
      expireTime: null,
      refreshCallbacks: [],
      accessKeyId: config.aws.accessKeyId,
      sessionToken: undefined,
      filename: undefined,
      profile: config.aws.profile,
      disableAssumeRole: false,
      preferStaticCredentials: false,
      tokenCodeFn: null,
      httpOptions: null
    }
    AWS.config.credentials = credentials
    s3 = new AWS.S3({
        apiVersion: '2006-03-01'
    })
    const bucketName = config.s3.bucketName

    const uploadFileWithNode = file => {
        const uploadParams = {
            Bucket: bucketName,
            Key: '',
            Body: ''
        }
        const fileStream = fs.createReadStream(file)
        fileStream.on('error', function(err) {
          console.log('File Error', err)
        })
        uploadParams.Body = fileStream
        uploadParams.Key = path.basename(file)
        
        // call S3 to retrieve upload file to specified bucket
        return new Promise((resolve, reject) => {
            s3.upload (uploadParams, function (err, data) {
                if (err) {
                  console.log("Error", err);
                  reject(err)
                } if (data) {
                  console.log("Upload Success", data.Location);
                  resolve(data)
                }
            })
        }) 
    }

    const uploadFile = () => {
        return multer({
            storage: multerS3({
              s3: s3,
              bucket: bucketName,
              acl: 'public-read',
              contentType: multerS3.AUTO_CONTENT_TYPE,
              metadata: function (req, file, cb) {
                cb(null, {fieldName: file.fieldname});
              },
              key: function (req, file, cb) {
                cb(null, file.originalname)
              }
            })
        })
    }

    return { uploadFile }
}