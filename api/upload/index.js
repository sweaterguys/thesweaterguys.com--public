//Upload API

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET),
    uuid = require('uuid/v4'),
    format = require('util').format;

module.exports = (file) => {
    return new Promise(resolve => {
        console.log('uploading');
        const ext = file.originalname.split('.').pop(),
            f = bucket.file(uuid() + '.' + ext);
        f.createWriteStream({resumable: false, metadata:{contentType: file.mimetype}})
            .on('error', (err) => next(err))
            .on('finish', () => {
                const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${f.name}`);
                console.log(publicUrl);
                resolve ([publicUrl, 'data:image/' + ext + ';base64,' + file.buffer.toString('base64')]);
            })
            .end(file.buffer)
    })
};