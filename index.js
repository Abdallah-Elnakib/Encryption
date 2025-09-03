const fs = require("fs");
const crypto = require("crypto");

const patterns = JSON.parse(fs.readFileSync("fixed_patterns.json"));


const getDeterministicIndex = (input, max) => {
    const hash = crypto.createHash("sha256").update(input).digest("hex");
    const num = parseInt(hash.slice(0, 8), 16); 
    return num % max;
}


const encrypt = (text, secretKey) => {
    let encryptedText = "";
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const options = patterns[char];
        if (Array.isArray(options) && options.length > 0) {
            const index = getDeterministicIndex(secretKey + char + i, options.length);
            encryptedText += options[index];
        } else {
            encryptedText += char;
        }
    }
    return encryptedText;
}

const verifyEncryption = (encryptedText, originalText, secretKey) => {
    let i = 0;
    for (let j = 0; j < originalText.length; j++) {
        const char = originalText[j];
        const options = patterns[char];
        if (!options) return false;

        const index = getDeterministicIndex(secretKey + char + j, options.length);
        const pattern = options[index];

        if (encryptedText.startsWith(pattern, i)) {
            i += pattern.length;
        } else {
            return false;
        }
    }
    return i === encryptedText.length;
}

module.exports = { encrypt, verifyEncryption };
