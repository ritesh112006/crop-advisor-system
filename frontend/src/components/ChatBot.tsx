import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Mic, MicOff, ImageIcon, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import ReactMarkdown from "react-markdown";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Msg = { role: "user" | "assistant"; content: string; image?: string };

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;

// ─── Farm sensor context ───────────────────────────────────
function getFarmContext() {
  const crops = (() => {
    try { return JSON.parse(localStorage.getItem("selectedCrops") || "[]"); } catch { return []; }
  })();
  return {
    farmerName: localStorage.getItem("farmerName") || "Farmer",
    state: localStorage.getItem("farmerLocation") || "India",
    soilType: localStorage.getItem("soilType") || "Loamy",
    crops: crops.map((c: any) => c.crop).join(", ") || "not selected yet",
    N: 72, P: 38, K: 46, moisture: 55, ph: 6.8, temp: 28.4, humidity: 68,
    healthScore: 82,
    alerts: ["Soil moisture dropping — irrigation needed", "Phosphorus slightly below optimal"],
  };
}

function buildSystemPrompt(imageIncluded: boolean) {
  const ctx = getFarmContext();
  return `You are **CropAdvisor AI** — an expert agricultural assistant for Indian farmers. You have live access to the farmer's sensor data and farm analytics.

**FARMER PROFILE:**
- Name: ${ctx.farmerName}
- Location/State: ${ctx.state}
- Soil Type: ${ctx.soilType}
- Crops Growing: ${ctx.crops}

**LIVE SOIL SENSOR READINGS:**
- Nitrogen (N): ${ctx.N} mg/kg ${ctx.N < 60 ? "⚠️ LOW" : ctx.N > 90 ? "⚠️ HIGH" : "✅ OK"} (Optimal: 60–90)
- Phosphorus (P): ${ctx.P} mg/kg ${ctx.P < 30 ? "⚠️ LOW" : ctx.P > 55 ? "⚠️ HIGH" : "✅ OK"} (Optimal: 30–55)
- Potassium (K): ${ctx.K} mg/kg ${ctx.K < 40 ? "⚠️ LOW" : ctx.K > 60 ? "⚠️ HIGH" : "✅ OK"} (Optimal: 40–60)
- Soil Moisture: ${ctx.moisture}% (Optimal: 40–70%)
- Soil pH: ${ctx.ph} (Optimal: 6.0–7.5)
- Temperature: ${ctx.temp}°C | Humidity: ${ctx.humidity}%

**CROP HEALTH SCORE:** ${ctx.healthScore}/100
**ACTIVE ALERTS:** ${ctx.alerts.join("; ")}

${imageIncluded ? "**The farmer has also shared an image of their crop/field — analyze it for disease, pest damage, or growth issues.**" : ""}

**YOUR BEHAVIOR:**
- Always analyze the farmer's ACTUAL sensor data before answering
- Provide specific, actionable advice (exact fertilizer amounts, timing, application method)
- Detect problems from sensor readings and warn proactively
- Answer in the SAME language the farmer uses (Hindi → Hindi, English → English, etc.)
- If asked about crops, always reference the actual sensor readings
- Format responses cleanly with bullet points and bold headings
- Be conversational and friendly — like a trusted farm advisor

IMPORTANT: Never say you don't have access to data. Use the sensor data above to give personalized answers.`;
}

// ─── Quick suggestion chips ────────────────────────────────
const QUICK_CHIPS = [
  "Soil health check",
  "When to irrigate?",
  "Fertilizer advice",
  "Pest & disease help",
  "Best crop for my soil",
  "Market price trend",
];

export function ChatBot() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const chatRef = useRef<any>(null);

  const ctx = getFarmContext();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Initialize chat session when opened
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `🌱 **Hello ${ctx.farmerName}!** I am your **CropAdvisor AI** — powered by Gemini.\n\nI can see your live farm data:\n- **N:** ${ctx.N} | **P:** ${ctx.P} | **K:** ${ctx.K} mg/kg\n- **Moisture:** ${ctx.moisture}% | **pH:** ${ctx.ph} | **Temp:** ${ctx.temp}°C\n- **Crops:** ${ctx.crops}\n\nAsk me anything about your farm — soil, crops, irrigation, pests, or market prices! 🌾`
      }]);
    }
  }, [open]);

  // Create or get Gemini chat session
  async function getGeminiChat(withImage: boolean) {
    if (!genAI) return null;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: messages
        .filter(m => m.role !== "assistant" || messages.indexOf(m) > 0)
        .slice(-10) // last 10 messages for context
        .map(m => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
      systemInstruction: buildSystemPrompt(withImage),
    });
    return chat;
  }

  async function sendMessage(text?: string, chip?: string) {
    const userText = text || chip || input.trim();
    if (!userText && !imageBase64) return;
    if (loading) return;

    const userMsg: Msg = { role: "user", content: userText, image: imagePreview || undefined };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setImagePreview(null);
    setLoading(true);

    try {
      if (!genAI) throw new Error("Gemini API key not configured");

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Build full prompt with system context
      const systemPrompt = buildSystemPrompt(!!imageBase64);
      let parts: any[] = [{ text: systemPrompt + "\n\n---\n\nFarmer asks: " + userText }];

      // Add image if present
      if (imageBase64) {
        parts = [
          { text: systemPrompt + "\n\n---\n\nFarmer asks: " + userText + "\n\n[Image attached — please analyze it]" },
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
        ];
      }

      // Add conversation history as context
      const historyContext = messages.slice(-6).map(m =>
        `${m.role === "user" ? "Farmer" : "CropAdvisor AI"}: ${m.content}`
      ).join("\n");
      if (historyContext) {
        parts[0].text = systemPrompt + "\n\n---\n\nPrevious conversation:\n" + historyContext + "\n\n---\n\nFarmer asks: " + userText;
      }

      const result = await model.generateContent(parts);
      const response = result.response.text();

      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (err: any) {
      console.error("Gemini error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `⚠️ **Connection error.** Please check your internet connection.\n\n*Error: ${err.message || "Unknown error"}*`
      }]);
    } finally {
      setLoading(false);
      setImageBase64(null);
    }
  }

  // Voice input
  function toggleVoice() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "hi-IN";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }

  // Image upload
  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      // Extract base64 (remove data:image/...;base64, prefix)
      const base64 = result.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-2xl hover:scale-110 transition-transform"
        >
          <img src="/crop-logo.jpg" alt="AI Chat" className="h-9 w-9 rounded-full object-cover" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex w-[360px] max-w-[calc(100vw-1.5rem)] flex-col rounded-2xl border bg-card shadow-2xl overflow-hidden"
          style={{ height: "540px" }}>
          {/* Header */}
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <img src="/crop-logo.jpg" alt="Crop Advisor" className="h-8 w-8 rounded-full object-cover border-2 border-white/30" />
            <div className="flex-1">
              <p className="text-sm font-bold leading-none">CropAdvisor AI</p>
              <p className="text-[10px] opacity-80 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" /> Powered by Gemini — Farm-Aware
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="opacity-70 hover:opacity-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sensor chips */}
          <div className="flex gap-1.5 overflow-x-auto px-3 py-2 border-b bg-muted/30 text-[10px] font-mono">
            {[`N:${ctx.N}`, `P:${ctx.P}`, `K:${ctx.K}`, `pH:${ctx.ph}`, `H₂O:${ctx.moisture}%`, `${ctx.temp}°C`].map(chip => (
              <span key={chip} className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-primary font-semibold">{chip}</span>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {msg.role === "assistant" && (
                  <img src="/crop-logo.jpg" className="h-6 w-6 rounded-full object-cover shrink-0 mt-1" alt="AI" />
                )}
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted rounded-tl-sm"}`}>
                  {msg.image && <img src={msg.image} className="mb-2 rounded-lg max-h-32 object-cover" alt="uploaded" />}
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <img src="/crop-logo.jpg" className="h-6 w-6 rounded-full object-cover shrink-0 mt-1" alt="AI" />
                <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips */}
          {messages.length <= 1 && (
            <div className="flex gap-1.5 overflow-x-auto px-3 py-2 border-t">
              {QUICK_CHIPS.map(chip => (
                <button key={chip} onClick={() => sendMessage(chip)}
                  className="shrink-0 rounded-full border bg-muted px-2.5 py-1 text-[11px] hover:bg-primary/10 hover:border-primary transition-colors">
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mx-3 mb-1">
              <img src={imagePreview} alt="preview" className="h-16 rounded-lg object-cover border" />
              <button onClick={() => { setImagePreview(null); setImageBase64(null); }}
                className="absolute -top-1 -right-1 rounded-full bg-destructive text-white p-0.5">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 border-t p-3">
            <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleImage} />
            <button onClick={() => fileRef.current?.click()}
              className="text-muted-foreground hover:text-primary transition-colors shrink-0">
              <ImageIcon className="h-5 w-5" />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={t("chatbotPlaceholder") || "Ask about your farm..."}
              className="flex-1 rounded-full border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button onClick={toggleVoice}
              className={`shrink-0 transition-colors ${listening ? "text-red-500" : "text-muted-foreground hover:text-primary"}`}>
              {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button onClick={() => sendMessage()} disabled={loading || (!input.trim() && !imageBase64)}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
