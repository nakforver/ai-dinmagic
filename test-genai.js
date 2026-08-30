const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({});
console.log(ai.files.upload.toString());
