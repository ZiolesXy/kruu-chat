import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const systemInstruction = "anda adalah KruAI, AI Desainer video";

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: generationConfig,
    });
    
    // Inisialisasi chat baru dengan history kosong
    this.resetChat();
  }

  // Method untuk reset chat
  resetChat() {
    this.chat = this.model.startChat({
      history: [],
      generationConfig: generationConfig,
      safetySettings: [],
      systemPrompt: systemInstruction,
    });
    this.chatHistory = [];
  }

  // Method untuk mendapatkan history chat
  getChatHistory() {
    return this.chatHistory;
  }

  async generateResponse(prompt) {
    try {
      const result = await this.chat.sendMessage(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Simpan prompt dan response ke history
      this.chatHistory.push({
        role: 'user',
        content: prompt
      });
      this.chatHistory.push({
        role: 'assistant',
        content: responseText
      });

      return responseText;
    } catch (error) {
      console.error("Error in generating response:", error);
      throw error;
    }
  }
}

export default new GeminiService(); 