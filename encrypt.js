const NodeRSA = require('node-rsa');

function encrypt(rawData) {
    const { privatePem, publicPem } = generator();
    var key = new NodeRSA(privatePem);
    let cipherText = key.encryptPrivate(rawData, 'base64');
    console.log(`cipherText: ${cipherText}, publicPem: ${publicPem}`);
}

function generator() {
    var key = new NodeRSA({ b: 512 })
    key.setOptions({ encryptionScheme: 'pkcs1' })  
    var privatePem = key.exportKey('pkcs1-private-pem')
    var publicPem = key.exportKey('pkcs1-public-pem') 
    return {privatePem, publicPem}
  }
  
  

encrypt("input your content")