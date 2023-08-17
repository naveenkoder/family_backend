import { bucket } from '../app.js';

export const fileUplaodOnFirebase = (file) => {
    return new Promise((resolve, reject) => {
        let newFileName = `${Date.now()}`;
        let fileUpload = bucket.file(newFileName);
        fileUpload.getSignedUrl({
            action: 'read',
            expires: '03-09-2041'
        }).then(async signedUrls => {
            resolve(signedUrls[0]);
        }).catch((err) => {
            console.log(err);
            reject(err);
        })
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (error) => {
            console.log(error);
            reject(error);
        });

        blobStream.on('finish', () => {
            console.log('Successfully file uploaded on firebase:::::::::::::::');
        });
        blobStream.end(file.buffer);
    })
}