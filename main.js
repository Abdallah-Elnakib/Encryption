const fs = require('fs');
const patterns = JSON.parse(fs.readFileSync('fixed_patterns.json'));

const encrypt = (text) => {
    let encryptedText = '';
    for (let char of text) {
        const options = patterns[char];
        if (Array.isArray(options) && options.length > 0) {
            const randomIndex = Math.floor(Math.random() * options.length);
            encryptedText += options[randomIndex];
        } else {
            encryptedText += char;
        }
    }
    return encryptedText;
}

const verifyEncryption = (encryptedText, originalText) => {
    let i = 0;
    let j = 0;
    const n = encryptedText.length;
    const m = originalText.length;
    
    const reverseMap = {};
    for (const [char, charPatterns] of Object.entries(patterns)) {
        for (const pattern of charPatterns) {
            reverseMap[pattern] = char;
        }
    }
    
    while (i < n && j < m) {
        let found = false;
        
        for (let length = Math.min(4, n - i); length >= 1; length--) {
            const chunk = encryptedText.substring(i, i + length);
            
            if (reverseMap[chunk] === originalText[j]) {
                i += length;
                j++;
                found = true;
                break;
            }
        }
        
        if (!found) {
            return false;
        }
    }
    
    return i === n && j === m;
}

const testText = "1722-2932025*";

const encrypted = encrypt(testText);
console.log("Encrypted Text:", encrypted);

const decrypted = verifyEncryption(encrypted, testText);
console.log("Decrypted Text:", decrypted);

