const crypto = require('crypto');

function hashfuc(str1, str2) {
    const hash1 = crypto.createHash('sha256');
    hash1.update(str1);
    const str1Hash =  hash1.digest('hex');

    const hash2 = crypto.createHash('sha256');
    hash2.update(str2);
    const str2Hash =  hash2.digest('hex');

    const hash3 = crypto.createHash('sha256');
    hash3.update(`${str1Hash}${str2Hash}`);
    return hash3.digest('hex');
}

module.exports = {
    hash: hashfuc
};

console.log(hashfuc('1', '2'));
console.log(hashfuc('1', '2'));