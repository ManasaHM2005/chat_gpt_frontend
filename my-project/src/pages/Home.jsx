import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);

  const handleSend = () => {
    if (input.trim()) {
      navigate("/chat", { state: { initialMessage: input.trim() } });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const truncated = content.length > 2000 ? content.slice(0, 2000) + "\n...(truncated)" : content;
      const message = `I'm sharing a file "${file.name}" (${file.type || "text"}):\n\n${truncated}\n\nPlease analyze this file.`;
      navigate("/chat", { state: { initialMessage: message } });
    };
    reader.onerror = () => {
      navigate("/chat", { state: { initialMessage: `I tried to share a file "${file.name}" but it couldn't be read. Can you help me with file "${file.name}"?` } });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleActionClick = (action) => {
    const prompts = {
      Search: "Search for: ",
      Study: "Help me study about: ",
      "Create image": "Create an image of: ",
    };

    if (action === "Attach") {
      handleAttach();
    } else {
      setInput(prompts[action] || "");
      textInputRef.current?.focus();
    }
  };

  const actionButtons = [
    { label: "Attach", icon: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" },
    { label: "Search", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
    { label: "Study", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { label: "Create image", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.csv,.json,.js,.jsx,.py,.java,.html,.css,.xml,.log,.sql,.ts,.tsx,.c,.cpp,.h,.yml,.yaml,.ini,.cfg,.env"
      />

      {/* Main content */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
        What can I help with?
      </h1>

      {/* Input box */}
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 border border-gray-300 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-gray-300">
          <input
            ref={textInputRef}
            type="text"
            placeholder="Ask anything"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 outline-none text-gray-700 placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 rounded-lg flex items-center justify-center transition disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {actionButtons.map((item) => (
            <button
              key={item.label}
              onClick={() => handleActionClick(item.label)}
              className="px-4 py-1.5 text-sm border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer text */}
      <p className="text-xs text-gray-400 mt-10 text-center max-w-md">
        By messaging ChatGPT, you agree to our Terms and have read our Privacy
        Policy.
      </p>
    </div>
  );
};

export default Home;