import { useState, useEffect, useRef } from 'react'
import './App.css'
import geminiService from './services/geminiService';

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentTypingMessage, setCurrentTypingMessage] = useState(null);
  const chatContainerRef = useRef(null);
  
  const formatBoldText = (text) => {
    // Mengganti format markdown ** atau * menjadi tag HTML <strong>
    return text.replace(/\*\*(.*?)\*\*|\*(.*?)\*/g, '<strong>$1$2</strong>');
  };
  
  const typewriterEffect = async (text, messageIndex) => {
    let currentText = '';
    
    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[messageIndex] = {
          ...newHistory[messageIndex],
          content: currentText
        };
        return newHistory;
      });
      await new Promise(resolve => setTimeout(resolve, 20)); // delay 20ms per karakter
    }
    setCurrentTypingMessage(null);
  };

  const generateContent = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    try {
      // Tambahkan pesan user terlebih dahulu
      const userMessage = { role: 'user', content: prompt };
      setChatHistory(prev => [...prev, userMessage]);
      
      const responseText = await geminiService.generateResponse(prompt);
      
      // Tambahkan pesan AI dengan konten kosong
      const aiMessage = { role: 'assistant', content: '' };
      setChatHistory(prev => [...prev, aiMessage]);
      
      // Mulai efek mengetik untuk pesan terakhir
      const newMessageIndex = chatHistory.length + 1;
      setCurrentTypingMessage(newMessageIndex);
      await typewriterEffect(responseText, newMessageIndex);
      
      setPrompt(''); // Reset input prompt
    } catch (error) {
      console.error("Error:", error);
      alert("Maaf, terjadi kesalahan saat menghasilkan respons.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Fungsi untuk reset chat
  const handleResetChat = () => {
    geminiService.resetChat();
    setChatHistory([]);
  };

  // Fungsi untuk scroll ke bawah
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Effect untuk scroll otomatis saat chat history berubah
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  return (
    <div className="chatbot-container flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-100 to-gray-200">
      <div className={`main-content-wrapper w-full max-w-2xl transition-all duration-300 ${
        chatHistory.length === 0 ? 'h-[400px]' : 'min-h-[400px]'
      } bg-white rounded-xl shadow-lg p-6`}>
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Kru AI</h1>
        
        {isGenerating && (
          <div className="loading-indicator mb-4">
            <div className="dot-typing"></div>
          </div>
        )}

        <div 
          ref={chatContainerRef}
          className="chat-history w-full overflow-y-auto p-4 mb-4 bg-gray-50 rounded-lg transition-all duration-300"
          style={{
            height: chatHistory.length === 0 ? '100px' : 'auto',
            minHeight: '100px',
            maxHeight: '500px'
          }}
        >
          {chatHistory.length === 0 && (
            <div className="text-gray-400 text-center py-8">
              Mulai chat dengan mengetik pesan...
            </div>
          )}
          {chatHistory.map((message, index) => (
            <div 
              key={index} 
              className={`message-bubble mb-4 ${
                message.role === 'user' 
                  ? 'ml-auto bg-blue-500 text-white rounded-l-lg rounded-tr-lg' 
                  : 'mr-auto bg-gray-200 text-gray-800 rounded-r-lg rounded-tl-lg'
              } max-w-[70%] p-3 shadow-md`}
            >
              <p>{message.content}</p>
              {currentTypingMessage === index && <span className="typing-cursor">|</span>}
            </div>
          ))}
        </div>

        <div className="input-container mt-auto">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Masukkan prompt Anda..."
            disabled={isGenerating}
          />
          <button 
            onClick={generateContent} 
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? 'Menghasilkan...' : 'Kirim'}
          </button>
          <button onClick={handleResetChat}>
            Reset Chat
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
