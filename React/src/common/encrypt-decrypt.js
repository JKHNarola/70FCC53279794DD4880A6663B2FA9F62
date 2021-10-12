import * as crypto from 'crypto';
const algorithm = 'aes-256-cbc';
const key = Buffer.from([845, 121, 14, 52, 65, 85, 412, 59, 63, 541, 21, 51, 156, 125, 8, 62, 845, 121, 14, 52, 65, 85, 412, 59, 63, 541, 21, 51, 156, 125, 8, 62]);
const iv = Buffer.from([845, 121, 14, 52, 63, 51, 156, 8, 52, 65, 874, 54, 12, 652, 65, 85]);

export const encrypt = (text) => {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

export const decrypt = (text) => {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

