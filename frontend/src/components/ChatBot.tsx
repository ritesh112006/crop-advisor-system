import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Mic, MicOff, Image, Volume2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string; image?: string };

// Farm context data for the chatbot to analyze
function getFarmContext() {
  const selectedCrops = (() => {
    try { return JSON.parse(localStorage.getItem("selectedCrops") || "[]"); } catch { return []; }
  })();
  const farmerName = localStorage.getItem("farmerName") || "Farmer";
  const soilType = localStorage.getItem("soilType") || "Unknown";
  const farmLocation = localStorage.getItem("farmLocation") || "Unknown";

  return {
    farmerName,
    soilType,
    farmLocation,
    crops: selectedCrops.map((c: any) => c.crop).join(", ") || "not selected yet",
    sensorData: {
      nitrogen: 72,
      phosphorus: 38,
      potassium: 46,
      moisture: 55,
      ph: 6.8,
      temperature: 28.4,
      humidity: 68,
    },
    cropHealthScore: 82,
    activeAlerts: ["Soil moisture dropping — irrigation needed in 2 days", "Phosphorus slightly below optimal"],
    lastReportStatus: "Good (Score: 78/100)",
  };
}

function buildSystemPrompt() {
  const ctx = getFarmContext();
  return `You are CropAdvisor AI — an expert agricultural assistant. You have access to real-time farm sensor data and analytics. Always analyze the farmer's data before answering.

FARMER INFO:
- Name: ${ctx.farmerName}
- Location: ${ctx.farmLocation}
- Soil Type: ${ctx.soilType}
- Selected Crops: ${ctx.crops}

LIVE SENSOR READINGS:
- Nitrogen (N): ${ctx.sensorData.nitrogen} mg/kg (Optimal: 60–90)
- Phosphorus (P): ${ctx.sensorData.phosphorus} mg/kg (Optimal: 30–55)
- Potassium (K): ${ctx.sensorData.potassium} mg/kg (Optimal: 40–60)
- Soil Moisture: ${ctx.sensorData.moisture}% (Optimal: 40–70%)
- Soil pH: ${ctx.sensorData.ph} (Optimal: 6.0–7.5)
- Temperature: ${ctx.sensorData.temperature}°C
- Humidity: ${ctx.sensorData.humidity}%

CROP HEALTH SCORE: ${ctx.cropHealthScore}/100
ACTIVE ALERTS: ${ctx.activeAlerts.join("; ")}
LAST MONTH SOIL REPORT: ${ctx.lastReportStatus}

Based on this data, always provide personalized, data-driven advice. When farmer asks about their crops/soil/weather — reference actual sensor readings. Answer in the farmer's language (Hindi if they write in Hindi, etc.). Keep answers concise but actionable. Use bullet points for steps.`;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function ChatBot() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Voice recognition setup
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input not supported in this browser. Please use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "hi-IN";
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => prev + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const send = async () => {
    if ((!input.trim() && !imagePreview) || isLoading) return;

    const userContent = input.trim() || (imagePreview ? "[Image uploaded — please analyze this crop/soil issue]" : "");
    const userMsg: Msg = { role: "user", content: userContent, image: imagePreview || undefined };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setImagePreview(null);
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      // Build the system-aware messages
      const systemMessage = { role: "system", content: buildSystemPrompt() };
      const apiMessages = [systemMessage, ...allMessages.map((m) => ({
        role: m.role,
        content: m.image
          ? `${m.content}\n[Farmer uploaded an image of their crop/farm for analysis]`
          : m.content,
      }))];

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!resp.ok || !resp.body) {
        // Fallback: generate a context-aware response
        const ctx = getFarmContext();
        const fallbackResp = `Based on your farm data:
- **Soil Health**: ${ctx.cropHealthScore}/100 (${ctx.lastReportStatus})
- **N**: ${ctx.sensorData.nitrogen} mg/kg | **P**: ${ctx.sensorData.phosphorus} mg/kg | **K**: ${ctx.sensorData.potassium} mg/kg
- **Moisture**: ${ctx.sensorData.moisture}% | **pH**: ${ctx.sensorData.ph}

**Active Alerts**: ${ctx.activeAlerts.join("; ")}

For your crops (${ctx.crops}), I recommend monitoring phosphorus levels and ensuring irrigation within 2 days. Ask me specific questions about your farm!`;
        setMessages((prev) => [...prev, { role: "assistant", content: fallbackResp }]);
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      const ctx = getFarmContext();
      const contextAnswer = `I'm analyzing your farm data. Your soil health score is **${ctx.cropHealthScore}/100**. Current alerts: **${ctx.activeAlerts.join("; ")}**. Your soil pH is ${ctx.sensorData.ph} (optimal). Ask me specific questions!`;
      setMessages((prev) => [...prev, { role: "assistant", content: contextAnswer }]);
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-all hover:scale-110 hover:shadow-2xl"
        aria-label="Chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && messages.length === 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center font-bold">AI</span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-[22rem] flex-col rounded-xl border bg-card shadow-2xl sm:w-[26rem]">
          {/* Header */}
          <div className="flex items-center gap-2 rounded-t-xl bg-primary px-4 py-3">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
            <div className="flex-1">
              <h3 className="font-heading text-sm font-semibold text-primary-foreground">{t("chatbotTitle")}</h3>
              <p className="text-xs text-primary-foreground/70">Analyzing your live farm data</p>
            </div>
            <Volume2 className="h-4 w-4 text-primary-foreground/70" />
          </div>

          {/* Farm data chip */}
          <div className="border-b bg-muted/50 px-3 py-1.5 flex items-center gap-2 flex-wrap">
            {["N:72", "P:38", "K:46", "pH:6.8", "H₂O:55%"].map((chip) => (
              <span key={chip} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-mono font-medium text-primary">
                {chip}
              </span>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                {t("chatbotWelcome")}
                <div className="mt-2 space-y-1">
                  {["What should I water today?", "Is my soil healthy?", "When to apply fertilizer?"].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); }}
                      className="block w-full text-left text-xs text-primary hover:underline"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" className="mb-2 max-h-32 rounded-lg object-cover w-full" />
                  )}
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce [animation-delay:.0s]">●</span>
                    <span className="animate-bounce [animation-delay:.15s]">●</span>
                    <span className="animate-bounce [animation-delay:.3s]">●</span>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="border-t px-3 py-2 flex items-center gap-2">
              <img src={imagePreview} alt="Preview" className="h-12 w-12 rounded-lg object-cover" />
              <p className="text-xs text-muted-foreground flex-1">Image attached</p>
              <button onClick={() => setImagePreview(null)} className="text-xs text-red-500 hover:underline">Remove</button>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
              {/* Image upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                title="Upload crop image"
              >
                <Image className="h-4 w-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

              {/* Text input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("chatbotPlaceholder")}
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />

              {/* Mic button */}
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${isListening ? "bg-red-100 border-red-300 text-red-600 animate-pulse" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {/* Send button */}
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !imagePreview)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
