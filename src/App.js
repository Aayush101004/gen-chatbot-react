import { useEffect, useRef, useState } from 'react';

const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
  </svg>
);

const BotIcon = () => (
  <img src="/diamond.png" alt="Bot Avatar" className="w-8 h-8" />
);

const UserIcon = () => (
  <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="currentColor" className="w-8 h-8 text-slate-500">
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const MarkdownRenderer = ({ content }) => {
  const renderLineContent = (line) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let elements = [];
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(line)) !== null) {
      if (match.index > lastIndex) elements.push(line.substring(lastIndex, match.index));
      elements.push(<a key={match[2] + match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{match[1]}</a>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) elements.push(line.substring(lastIndex));
    elements = elements.flatMap((el, i) => {
      if (typeof el !== 'string') return [el];
      const parts = [];
      let last = 0;
      let m;
      while ((m = boldRegex.exec(el)) !== null) {
        if (m.index > last) parts.push(el.substring(last, m.index));
        parts.push(<strong key={i + '-' + m.index}>{m[1]}</strong>);
        last = m.index + m[0].length;
      }
      if (last < el.length) parts.push(el.substring(last));
      return parts;
    });
    return elements;
  };

  const lines = content.split('\n');
  const elements = [];
  const listStack = [];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      while (listStack.length > 0) {
        const finishedList = listStack.pop();
        const ListTag = finishedList.type;
        elements.push(<ListTag key={`list-${index}-${listStack.length}`} className={finishedList.className}>{finishedList.items}</ListTag>);
      }
      return;
    }

    const indentMatch = line.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[0].length : 0;

    if (trimmedLine.startsWith('* ')) {
      const listItemContent = trimmedLine.substring(2);
      const newItem = <li key={index}>{renderLineContent(listItemContent)}</li>;

      while (listStack.length > 0 && indent < listStack[listStack.length - 1].indent) {
        const finishedList = listStack.pop();
        const ListTag = finishedList.type;
        elements.push(<ListTag key={`list-${index}-${listStack.length}`} className={finishedList.className}>{finishedList.items}</ListTag>);
      }

      if (listStack.length === 0 || indent > listStack[listStack.length - 1].indent) {
        const listStyles = ['list-disc', 'list-decimal', 'list-[lower-alpha]'];
        const listLevel = listStack.length;
        const ListTag = listLevel === 0 ? 'ul' : 'ol';
        const listClass = `${listStyles[listLevel % listStyles.length]} list-inside my-1 ml-4`;
        listStack.push({ type: ListTag, items: [newItem], indent: indent, className: listClass });
      } else {
        listStack[listStack.length - 1].items.push(newItem);
      }
    } else {
      while (listStack.length > 0) {
        const finishedList = listStack.pop();
        const ListTag = finishedList.type;
        elements.push(<ListTag key={`list-${index}-${listStack.length}`} className={finishedList.className}>{finishedList.items}</ListTag>);
      }
      elements.push(<p key={index} className="whitespace-pre-wrap">{renderLineContent(trimmedLine)}</p>);
    }
  });

  while (listStack.length > 0) {
    const finishedList = listStack.pop();
    const ListTag = finishedList.type;
    elements.push(<ListTag key={`list-end-${listStack.length}`} className={finishedList.className}>{finishedList.items}</ListTag>);
  }

  return <>{elements}</>;
};

function App() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;
  const newsApiKey = process.env.REACT_APP_GNEWS_API_KEY;
  const GEMINI_API_URL = geminiApiKey && geminiApiKey !== "YOUR_GEMINI_API_KEY"
    ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`
    : null;
  const NEWS_API_BASE_URL = newsApiKey && newsApiKey !== "YOUR_GNEWS_API_KEY"
    ? `https://gnews.io/api/v4/top-headlines?lang=en&country=in&token=${newsApiKey}`
    : null;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!geminiApiKey || geminiApiKey === "YOUR_GEMINI_API_KEY") {
      setMessages([{
        role: 'assistant',
        content: 'Welcome! Please add your Gemini API key in the .env file as REACT_APP_GEMINI_API_KEY to begin.'
      }]);
    } else {
      setMessages([{
        role: 'assistant',
        content: 'Hello! I am **Gem**, your AI assistant. How can I help you today?'
      }]);
    }
  }, [geminiApiKey]);

  const fetchNews = async (topic) => {
    if (!NEWS_API_BASE_URL) {
      return "News API key is missing or not initialized. Please add REACT_APP_GNEWS_API_KEY to your .env file.";
    }
    let url = NEWS_API_BASE_URL;
    if (topic) url += `&topic=${topic}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors[0] || "Could not fetch news.");
      }
      const data = await response.json();
      if (data.articles?.length) {
        let news = `Here are the top ${topic || ''} headlines in India:\n\n`;
        data.articles.slice(0, 5).forEach(article => {
          const source = article.url ? `[${article.source.name}](${article.url})` : article.source.name;
          news += `* **${article.title}**\n  Source: ${source}\n`;
        });
        return news;
      }
      return `No top headlines for "${topic}" found.`;
    } catch (error) {
      return `Error fetching news: ${error.message}`;
    }
  };

  function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        matrix[i][j] = a[i - 1] === b[j - 1]
          ? matrix[i - 1][j - 1]
          : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
      }
    }
    return matrix[a.length][b.length];
  }

  const getNewsTopic = (query) => {
    const topics = ['sports', 'technology', 'business', 'entertainment', 'health', 'science', 'world'];
    const lower = query.toLowerCase();
    for (const topic of topics) {
      if (lower.includes(topic)) return topic;
    }
    const words = lower.split(/\W+/);
    for (const word of words) {
      for (const topic of topics) {
        if (levenshtein(word, topic) <= 2 && word.length > 3) return topic;
      }
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    if (!geminiApiKey || geminiApiKey === "YOUR_GEMINI_API_KEY") {
      setMessages(prev => [...prev, { role: 'assistant', content: "Gemini API key is missing or not initialized. Please add REACT_APP_GEMINI_API_KEY to your .env file." }]);
      return;
    }

    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);
    let botResponse = "";

    const newsKeywords = ['news', 'headlines', 'latest', 'current events'];
    const isNews = newsKeywords.some(k => currentInput.toLowerCase().includes(k));

    if (isNews) {
      if (!newsApiKey || newsApiKey === "YOUR_GNEWS_API_KEY") {
        botResponse = "News API key is missing or not initialized. Please add REACT_APP_GNEWS_API_KEY to your .env file.";
      } else if (!NEWS_API_BASE_URL) {
        botResponse = "News API key is missing or not initialized. Please add REACT_APP_GNEWS_API_KEY to your .env file.";
      } else {
        const allowed = ['sports', 'technology', 'business', 'entertainment', 'health', 'science', 'world'];
        const topic = getNewsTopic(currentInput);
        const isAllowed = topic && allowed.some(t => t === topic || levenshtein(t, topic) <= 2);
        const genericRegex = /^\s*(news|headlines|current events|latest)\s*\??$/i;
        if (topic === null && genericRegex.test(currentInput)) {
          botResponse = await fetchNews(topic);
        } else if (!topic || !isAllowed) {
          const paraphrases = [
            "I'm unable to provide news updates on that topic.",
            "Sorry, I can't generate news for that subject.",
            "Currently, I'm not able to generate this news.",
            "Unfortunately, I can't fetch news for that topic."
          ];
          const chosen = paraphrases[Math.floor(Math.random() * paraphrases.length)];
          const top = await fetchNews(null);
          botResponse = `${chosen}\n\nHere are the top headlines:\n\n${top}`;
        } else {
          botResponse = await fetchNews(topic);
        }
      }
    } else {
      try {
        const history = newMessages.filter(m => m.role !== 'system').slice(-10);
        const contents = history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }));

        const response = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Unknown error.");
        }

        const result = await response.json();
        if (!result.candidates?.length || !result.candidates[0].content) {
          throw new Error("Empty or blocked response.");
        }
        botResponse = result.candidates[0].content.parts[0].text.trim();
      } catch (error) {
        botResponse = `Error: ${error.message}`;
      }
    }

    setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-indigo-600">Gem AI</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && <BotIcon />}
              <div className={`max-w-xl p-4 rounded-2xl shadow-sm ${msg.role === 'assistant' ? 'bg-white text-slate-800 rounded-tl-none' : 'bg-indigo-500 text-white rounded-br-none'}`}>
                {msg.role === 'assistant' ? <MarkdownRenderer content={msg.content} /> : <p className="whitespace-pre-wrap">{msg.content}</p>}
              </div>
              {msg.role === 'user' && <UserIcon />}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <BotIcon />
              <div className="max-w-xl p-4 rounded-2xl shadow-sm bg-white text-slate-800 rounded-tl-none">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>
      <footer className="bg-white border-t p-4">
        <div className="flex items-center gap-4 max-w-2xl mx-auto">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            rows="1"
            disabled={isLoading || geminiApiKey === "YOUR_GEMINI_API_KEY"}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || geminiApiKey === "YOUR_GEMINI_API_KEY"}
            className="p-3 bg-indigo-600 rounded-lg disabled:bg-indigo-300 hover:bg-indigo-700 transition-colors duration-200"
          >
            <SendIcon />
          </button>
        </div>
        <div className="text-center text-sm">
          <p>Don't trust Gem blindly. It may generate false results.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
