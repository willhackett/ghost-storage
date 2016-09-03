# ghost-storage

## Description
`ghost-storage` is a [Ghost Blog](https://ghost.org/developers/) plugin used to store static files in other cloud storage services like [Amazon S3](https://aws.amazon.com/s3) instead of local file system storage.

## Supported storage services
- Amazon S3 Storage
- Google Cloud Storage

## Amazon S3 Storage
### Configuration on AWS S3 console
* Generate Security Credentials in [AWS console](https://aws.amazon.com) with `Access Key ID` and `Secret Access Key`, credentials should be keep safe, otherwise can be used to access all AWS services by other users.
* Create a bucket with a unique name and assign permission to yourself in order to upload, delete and view assets in bucket.
* Enable static site hosting and add policy below, so your bucket can be served as static site with read access to all users. For example, you can access your static files in browser with URL `example-bucket.s3-website-us-east-1.amazonaws.com`
```javascript
{
  "Version":"2012-10-17",
  "Statement":[{
  "Sid":"PublicReadForGetBucketObjects",
        "Effect":"Allow",
    "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::example-bucket/*"
      ]
    }
  ]
}
```
### Setting up in Ghost Blog
In order to replace the storage module, the basic requirements are:

- Create a new folder inside `/content` called `/storage`
- Inside of `/storage` you need to create your new module
- Your `config.js` file will need to be updated to provide config for your new storage module and set it as active.
* Get the name of bucket, subdomains of aws host path from AWS S3 console to update config file.
* In your `config.js` file, you'll need to add a new storage block to whichever environment you want to change:
```javascript
production: {
  "others": {},
  "storage": {
      "active": "ghost-storage",
      "ghost-storage": {
        "accessKeyId": "",
        "secretAccessKey": "",
        "bucket": "example_bucket",
        "awsPath": "s3-website-us-east-1.amazonaws.com",
        "cdnHost": "https://cdn.yourdomain.com/" //OPTIONAL: If you serve files from a different path than storage.googleapis.com.
      }
  },
}
development: {

}
```
- Create `index.js` file with folder path `content/storage/ghost-storage/index.js` (manually create folder if not exist) and fill this file with content below
```javascript
'use strict';
module.exports = require('ghost-storage').S3;
```
## Google Cloud Storage
### Configuration on Google API console
* Generate Security Credentials in [Google API console](https://console.developers.google.com) with `Project ID` and download `JSON key` file, credentials should be keep safe.
* Create a new bucket with domain unique name and make it public to be readable to all visitors. Write down `bucket name` to be used later.
### Setting up in Ghost blog
- Repeat most steps as the same in Amazon S3 Storage configuration.
- Put `key.json` file under the same directory as `config.js` to be imported in Ghost configuration.
- Update your `config.js` file, you'll need to add a new storage block to whichever environment you want to change:
```javascript
production: {
  "others": {},
  "storage": {
      "active": "ghost-storage",
      "ghost-storage": {
        projectId: '',
            keyFilename: path.join(__dirname, './key.json'),
            bucket: 'bucket name',
            gcloudPath: 'storage.googleapis.com',
            cdnHost: 'https://cdn.yourdomain.com/' //OPTIONAL: If you serve files from a different path than storage.googleapis.com.
      }
  },
}
development: {

}
```
- Create `index.js` file with folder path `content/storage/ghost-storage/index.js` (manually create folder if not exist) and fill this file with content below.
```javascript
'use strict';
module.exports = require('ghost-storage').Google;
```



## Collaboration
If you are interested in this project and want to be collaborators to implement other cloud storage plugins, please send pull requests or shoot me a email.
