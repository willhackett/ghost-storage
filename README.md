## ghost-storage

### Description
`ghost-storage` is a [Ghost Blog](https://ghost.org/developers/) plugin used to store static files in other cloud storage services like [Amazon S3](https://aws.amazon.com) instead of local file system storage.

### Supported storage services
- Amazon S3 Storage

### Getting started
#### Configuration on AWS S3 console
* Generate Security Credentials in [AWS console](https://aws.amazon.com) with `Access Key ID` and `Secret Access Key`, credentials should be keep safe, otherwise can be used to access all AWS services by other users.
* Create a bucket with a unique name and assign permission to yourself in order to upload, delete and view assets in bucket.
* Enable static site hosting and add policy below, so your bucket can be served as static site with read access to all users. For example, you can access your static files in browser with URL `example-bucket.s3-website-us-east-1.amazonaws.com`
```json
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
#### Setting up in Ghost Blog
In order to replace the storage module, the basic requirements are:

- Create a new folder inside `/content` called `/storage`
- Inside of `/storage` you need to create your new module
- Your module must export a constructor function that accepts a config option
- Your `config.js` file will need to be updated to provide config for your new storage module and set it as active.
* Get the name of bucket, subdomains of aws host path from AWS S3 console to update configuration file.
```json
"storage": {
    "active": "ghost-storage",
    "ghost-storage": {
        "accessKeyId": "",
      "secretAccessKey": "",
      "bucket": "example_bucket",
      "awsPath": "s3-website-us-east-1.amazonaws.com"
    }
},
```
- Create `index.js` file with folder path `content/storage/ghost-storage/index.js` (manually create folder if not exist) and fill this file with content below
```javascript
'use strict';
module.exports = require('ghost-storage').S3;
```
