// Compatibility shim. Provider AI sekarang multi (Gemini / OpenAI / OpenRouter)
// dan diatur via aiProvider.ts. File ini di-re-export untuk menjaga kode lama
// (transactionParser, insightGenerator) tetap jalan.
export { aiGenerate as geminiGenerate } from "./aiProvider";
