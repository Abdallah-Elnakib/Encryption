# 🔐 Encryption Lib

[![npm version](https://img.shields.io/npm/v/encryption-lib.svg)](https://www.npmjs.com/package/encryption-lib)

A lightweight deterministic encryption library that uses custom character patterns and secret keys for text encryption and verification.

## 📦 Installation

```bash
npm install encryption-lib
```

## ✨ Features

- 🔒 **Deterministic Encryption**: Same input + same key = same output every time
- 🎨 **Pattern-Based**: Uses customizable character patterns for encryption
- ✅ **Verification Function**: Validate encrypted text against original content
- ⚡ **Lightweight**: No heavy dependencies, uses native Node.js crypto module
- 🌍 **Multi-Language Support**: Works with English, Arabic, and special characters

## 🚀 Quick Start

```javascript
const { encrypt, verifyEncryption } = require('encryption-lib');

// Encrypt text
const secretKey = 'my-super-secret-key';
const originalText = 'Sensitive data 123! @#٪';
const encrypted = encrypt(originalText, secretKey);

console.log('Encrypted:', encrypted);

// Verify encryption
const isValid = verifyEncryption(encrypted, originalText, secretKey);
console.log('Verification result:', isValid); // true
```

```ts
// TypeScript / ESM
import { encrypt, verifyEncryption } from 'encryption-lib';

const secretKey = 'my-super-secret-key';
const originalText = 'Sensitive data 123! @#٪';
const encrypted = encrypt(originalText, secretKey);
console.log('Encrypted:', encrypted);

const isValid = verifyEncryption(encrypted, originalText, secretKey);
console.log('Verification result:', isValid); // true
```

## 📖 API Reference

### `encrypt(text, secretKey)`

Encrypts text using predefined patterns and a secret key.

**Parameters:**
- `text` (String): The plain text to encrypt (supports English, Arabic, and special characters)
- `secretKey` (String): Secret key used for deterministic encryption

**Returns:**
- (String): Encrypted text consisting of 4-character blocks

**Example:**
```javascript
const { encrypt } = require('encryption-lib');
const encrypted = encrypt('Hello World 123', 'my-secret-key');
console.log(encrypted); // Output: "x9$FM3@tQ1#z..."
```

### `verifyEncryption(encryptedText, originalText, secretKey)`

Verifies if encrypted text matches the original text when decrypted with the given key.

**Parameters:**
- `encryptedText` (String): The encrypted text to verify (must be divisible by 4 characters)
- `originalText` (String): The original plain text to compare against
- `secretKey` (String): Secret key used for encryption

**Returns:**
- (Boolean): `true` if encrypted text matches original text, `false` otherwise

**Example:**
```javascript
const { verifyEncryption } = require('encryption-lib');
const isValid = verifyEncryption(encryptedText, 'Hello World', 'my-secret-key');
console.log(isValid); // Output: true or false
```

## 💡 Usage Examples

### Basic Text Encryption

```javascript
const { encrypt, verifyEncryption } = require('encryption-lib');

const secretKey = 'my-secret-password';
const originalText = 'Hello World 123! @#٪ العربية';

// Encrypt
const encrypted = encrypt(originalText, secretKey);
console.log('Encrypted:', encrypted);

// Verify
const isValid = verifyEncryption(encrypted, originalText, secretKey);
console.log('Verification successful:', isValid); // true
```

### Different Keys Produce Different Results

```javascript
const { encrypt } = require('encryption-lib');

const text = 'Same text but different keys';
const encrypted1 = encrypt(text, 'key1');
const encrypted2 = encrypt(text, 'key2');

console.log('Different keys produce different results:', encrypted1 !== encrypted2); // true
```

### File Content Encryption

```javascript
const { encrypt, verifyEncryption } = require('encryption-lib');
const fs = require('fs');

// Encrypt file content
const fileContent = fs.readFileSync('document.txt', 'utf8');
const encryptedContent = encrypt(fileContent, 'file-secret-key');

// Save encrypted content
fs.writeFileSync('document.encrypted.txt', encryptedContent);

// Later, verify the encrypted content
const isValid = verifyEncryption(
  fs.readFileSync('document.encrypted.txt', 'utf8'),
  fileContent,
  'file-secret-key'
);

console.log('File verification:', isValid ? '✅ Success' : '❌ Failed');
```

### Configuration Management

```javascript
const { encrypt } = require('encryption-lib');

// Store keys securely (never in code)
const config = {
  apiKey: encrypt('actual-api-key', 'master-secret-key'),
  dbPassword: encrypt('database-password', 'master-secret-key')
};

// Save config to file
const fs = require('fs');
fs.writeFileSync('config.encrypted.json', JSON.stringify(config, null, 2));
```

## 🔧 Pattern Configuration

The library uses a `fixed_patterns.json` file that defines encryption patterns for each character. This file contains:

- Key-value pairs where keys are characters (including special characters, numbers, letters)
- Values are arrays of 4-character strings used as encryption patterns

**Example pattern structure:**

```json
{
  "A": ["x9$F", "M3@t", "Q1#z"],
  "B": ["m8$K", "E2@q", "L4!c"],
  "ا": ["}o4x", "[W}G", "dQU|"],
  " ": ["jjej", "eggw", "6fx2"],
  "@": ["a1B@", "c2D#", "e3F$"],
  "1": ["1a0@", "1b1#", "1c2$"]
}
```

Each character has multiple 4-character patterns, and the specific pattern used is determined deterministically based on the secret key and character position.

## 🧩 Runtime Notes

- This library is written in **TypeScript** and ships type definitions at `dist/index.d.ts`.
- The library reads `fixed_patterns.json` at runtime from the package root. The file is included in the published package via the `files` field in `package.json`.
- Requires **Node.js >= 16**.

## 🛠️ Development

```bash
npm install          # install deps
npm run dev          # watch mode (rebuild on change)
npm run build        # build to dist/
npm run clean        # remove dist/
```

## ⚠️ Security Notes

- 🔐 **Purpose**: This library is designed for obfuscation and light protection rather than military-grade encryption.
- ✅ **Suitable For**: client-side and server-side applications that need deterministic text obfuscation.

Maintainer: Abdallah Elnakib

For questions or support, please open an issue on the GitHub repository.
