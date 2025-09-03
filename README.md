[![npm version](https://img.shields.io/npm/v/encryption-lib.svg)](https://www.npmjs.com/package/encryption-lib)


# 🔐 My Encryption Lib

A simple custom encryption library that uses **character patterns** combined with a **secret key** to generate deterministic encrypted text.  
This library is mainly educational and designed for lightweight text obfuscation, not for high-security production use.

---

## ✨ Features
- Encrypts text using pre-defined character patterns (`fixed_patterns.json`).
- Requires a **secret key** → same text encrypted with different keys produces different results.
- Deterministic encryption → same text + same key always gives the same output.
- Includes a verification function to check if encrypted text matches the original.

---

## 📦 Installation

First, install via **npm**:

```bash
npm install encryption
