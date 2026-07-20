import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  Mic, 
  Send, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Languages, 
  Loader2,
  Trash2,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectSpecs } from "../App";

interface VoiceChatAssistantProps {
  specs: ProjectSpecs;
  setSpecs: React.Dispatch<React.SetStateAction<ProjectSpecs>>;
  dimensionUnit: "m" | "ft";
  setDimensionUnit: (unit: "m" | "ft") => void;
  weatherType: "clear" | "rain" | "snow" | "storm";
  setWeatherType: (type: "clear" | "rain" | "snow" | "storm") => void;
  projectName: string;
  setProjectName: (name: string) => void;
  configTab: string;
  setConfigTab: (tab: string) => void;
  visualizerTab: string;
  setVisualizerTab: (tab: any) => void;
  projectNotes: string;
  setProjectNotes: (notes: string) => void;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
  status?: "sending" | "success" | "error";
  actionsExecuted?: string[];
}

interface LanguageOption {
  code: string;
  name: string;
  speechCode: string;
  flag: string;
  placeholder: string;
  presets: string[];
}

const LANGUAGES: LanguageOption[] = [
  {
    code: "en",
    name: "English",
    speechCode: "en-US",
    flag: "🇺🇸",
    placeholder: "Type or ask me to build something...",
    presets: [
      "Set size to 40 x 80 feet",
      "Add side walls",
      "Switch to 3D frame view",
      "Make the weather rainy",
      "Switch dimension to meters",
      "Make colors blue"
    ]
  },
  {
    code: "hi",
    name: "हिंदी (Hindi)",
    speechCode: "hi-IN",
    flag: "🇮🇳",
    placeholder: "शेड के बारे में कुछ भी पूछें या निर्देश दें...",
    presets: [
      "शेड का साइज 50 x 100 फीट करो",
      "साइड की दीवारें लगाओ",
      "3D फ्रेम ढांचा दिखाओ",
      "बारिश का मौसम चालू करो",
      "इकाई को मीटर में बदलो",
      "शेड का रंग लाल करो"
    ]
  },
  {
    code: "hi-en",
    name: "Hinglish (Hindi written in English)",
    speechCode: "hi-IN",
    flag: "🇮🇳",
    placeholder: "Type e.g., 'wall color blue karo'...",
    presets: [
      "size ko 60 by 120 feet karo",
      "walls ko remove kar do",
      "rain weather set karo",
      "frame structure dikhao",
      "color green kar do"
    ]
  },
  {
    code: "es",
    name: "Español (Spanish)",
    speechCode: "es-ES",
    flag: "🇪🇸",
    placeholder: "Pídeme diseñar o configurar un cobertizo...",
    presets: [
      "Establecer tamaño en 50 x 100 pies",
      "Agregar paredes laterales",
      "Cambiar a vista de marco 3D",
      "Activar clima lluvioso",
      "Cambiar dimensiones a metros"
    ]
  },
  {
    code: "mr",
    name: "मराठी (Marathi)",
    speechCode: "mr-IN",
    flag: "🇮🇳",
    placeholder: "शेड डिझाइन किंवा बदल सांगा...",
    presets: [
      "शेडचा आकार ५० x १०० फूट करा",
      "बाजूच्या भिंती जोडा",
      "पाऊस हवामान सुरू करा",
      "रंग निळा करा"
    ]
  },
  {
    code: "ar",
    name: "العربية (Arabic)",
    speechCode: "ar-SA",
    flag: "🇸🇦",
    placeholder: "اطلب مني تصميم مستودع أو تعديل الهيكل...",
    presets: [
      "اجعل الحجم 50 في 100 قدم",
      "أضف الجدران الجانبية",
      "شغل طقس العاصفة",
      "غير اللون إلى الأزرق"
    ]
  }
];

export default function VoiceChatAssistant({
  specs,
  setSpecs,
  dimensionUnit,
  setDimensionUnit,
  weatherType,
  setWeatherType,
  projectName,
  setProjectName,
  configTab,
  setConfigTab,
  visualizerTab,
  setVisualizerTab,
  projectNotes,
  setProjectNotes
}: VoiceChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "👋 Hello! I am your AI PEB Steel Engineering Assistant. You can tell me what to build, modify specifications, or query bill of materials (BOM) in multiple languages by typing or clicking the mic! Try saying: 'Make size 40 by 80 feet and add side walls'.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = selectedLang.speechCode;

      rec.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      rec.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          handleSendMessage(transcript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        if (e.error === 'not-allowed') {
          setRecognitionError("Microphone access is blocked. Please check browser permissions, or click 'Open in new tab' to grant access.");
        } else {
          setRecognitionError(`Speech capture error (${e.error || "unknown"}). Please try again or type your command.`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = rec;
    }
  }, [selectedLang]);

  // Handle reading assistant messages aloud (Text-to-Speech)
  const speakText = (text: string) => {
    if (!isSpeakingEnabled || !window.speechSynthesis) return;
    
    // Stop any ongoing speech first
    window.speechSynthesis.cancel();
    
    // Clean text of emojis and special characters for smoother synthesis
    const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, "");
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedLang.speechCode;
    
    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(selectedLang.speechCode.split("-")[0]));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleVoiceListening = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop();
    } else {
      if (!speechRecognitionRef.current) {
        alert("Speech recognition is not supported in this browser. Please use Google Chrome or Safari.");
        return;
      }
      speechRecognitionRef.current.lang = selectedLang.speechCode;
      speechRecognitionRef.current.start();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text || text.trim() === "") return;

    if (!textToSend) {
      setInputValue("");
    }

    const userMsgId = `user_${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text,
      timestamp: new Date(),
      status: "sending"
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          language: selectedLang.code,
          currentSpecs: specs,
          currentDimensionUnit: dimensionUnit,
          currentWeatherType: weatherType,
          currentProjectName: projectName,
          currentConfigTab: configTab,
          currentVisualizerTab: visualizerTab,
          currentProjectNotes: projectNotes
        })
      });

      const responseText = await response.text();
      let resData: any;
      try {
        resData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(responseText || "Failed to parse response as JSON");
      }

      if (!response.ok) {
        throw new Error(resData?.error || resData?.message || responseText || "Failed to communicate with AI server");
      }

      if (resData.success && resData.data) {
        const payload = resData.data;
        const actionsExecuted: string[] = [];

        // Apply visual updates in state
        if (payload.updateSpecs) {
          setSpecs(prev => ({
            ...prev,
            ...payload.updateSpecs
          }));
          actionsExecuted.push("Updated structure parameters");
        }

        if (payload.updateDimensionUnit) {
          setDimensionUnit(payload.updateDimensionUnit);
          actionsExecuted.push(`Switched unit to ${payload.updateDimensionUnit === "ft" ? "Feet" : "Meters"}`);
        }

        if (payload.updateWeatherType) {
          setWeatherType(payload.updateWeatherType);
          actionsExecuted.push(`Set weather scene to ${payload.updateWeatherType}`);
        }

        if (payload.updateProjectName) {
          setProjectName(payload.updateProjectName);
          actionsExecuted.push(`Renamed project to: "${payload.updateProjectName}"`);
        }

        if (payload.updateConfigTab) {
          setConfigTab(payload.updateConfigTab);
          actionsExecuted.push(`Changed config section to "${payload.updateConfigTab}"`);
        }

        if (payload.updateVisualizerTab) {
          setVisualizerTab(payload.updateVisualizerTab);
          actionsExecuted.push(`Switched view to "${payload.updateVisualizerTab}"`);
        }

        if (payload.updateProjectNotes) {
          setProjectNotes(payload.updateProjectNotes);
          actionsExecuted.push("Added engineer's project notes");
        }

        // Add assistant reply
        const assistantMsg: Message = {
          id: `asst_${Date.now()}`,
          sender: "assistant",
          text: payload.reply || "Done!",
          timestamp: new Date(),
          actionsExecuted
        };

        setMessages(prev => {
          return prev.map(m => m.id === userMsgId ? { ...m, status: "success" as const } : m).concat(assistantMsg);
        });

        // Speak aloud if enabled
        if (isSpeakingEnabled) {
          speakText(payload.reply);
        }

      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.warn("ℹ️ Gemini API rate limit or error encountered. Engaging smart client-side local parser fallback.", err);
      
      const msgLower = text.toLowerCase();
      let reply = "";
      const updateSpecs: any = {};
      let updateDimensionUnit: "m" | "ft" | undefined;
      let updateWeatherType: "clear" | "rain" | "snow" | "storm" | undefined;
      let updateVisualizerTab: any;
      let updateConfigTab: string | undefined;

      const isHindi = selectedLang.code === "hi" || selectedLang.code === "hi-en" || 
                      /[\u0900-\u097F]/.test(text) || 
                      /\b(karo|lajao|lagao|hatao|badlo|dikhao|barish|toofan|deewar|chat)\b/i.test(msgLower);

      if (isHindi) {
        reply = "नमस्ते! मैंने आपके निर्देश के अनुसार शेड संरचना में बदलाव किए हैं।";
      } else if (selectedLang.code === "es" || /hola|buenos|gracias|muro|techo|lluvia|nieve/i.test(msgLower)) {
        reply = "¡Hola! He actualizado el diseño del cobertizo según sus instrucciones.";
      } else {
        reply = "Hello! I have updated the shed configuration based on your instructions.";
      }

      const actionsExecuted: string[] = [];

      // 1. Weather types
      if (msgLower.includes("rain") || msgLower.includes("बारिश") || msgLower.includes("barish") || msgLower.includes("water") || msgLower.includes("पानी")) {
        updateWeatherType = "rain";
        reply += isHindi ? " बारिश का मौसम शुरू कर दिया गया है।" : " Weather set to rainy.";
      } else if (msgLower.includes("storm") || msgLower.includes("तूफान") || msgLower.includes("toofan") || msgLower.includes("wind") || msgLower.includes("हवा")) {
        updateWeatherType = "storm";
        reply += isHindi ? " तूफान और तेज हवाएं सक्रिय कर दी गई हैं।" : " Weather set to storm mode.";
      } else if (msgLower.includes("snow") || msgLower.includes("बर्फ") || msgLower.includes("barf")) {
        updateWeatherType = "snow";
        reply += isHindi ? " बर्फबारी का मौसम चालू हो गया है।" : " Weather set to snowy.";
      } else if (msgLower.includes("clear") || msgLower.includes("साफ") || msgLower.includes("धूप") || msgLower.includes("sunny")) {
        updateWeatherType = "clear";
        reply += isHindi ? " मौसम बिल्कुल साफ और सुहावना कर दिया गया है।" : " Weather cleared.";
      }

      // 2. Units
      if (msgLower.includes("feet") || msgLower.includes("ft") || msgLower.includes("फिट") || msgLower.includes("फुट")) {
        updateDimensionUnit = "ft";
        reply += isHindi ? " माप इकाइयों को फीट (ft) में बदल दिया गया है।" : " Dimension unit switched to feet.";
      } else if (msgLower.includes("meter") || msgLower.includes("mtr") || msgLower.includes("मीटर") || msgLower.includes(" m ")) {
        updateDimensionUnit = "m";
        reply += isHindi ? " माप इकाइयों को मीटर (m) में बदल दिया गया है।" : " Dimension unit switched to meters.";
      }

      // 3. Walls
      if (msgLower.includes("wall") || msgLower.includes("दीवार") || msgLower.includes("deewar")) {
        if (msgLower.includes("remove") || msgLower.includes("हटा") || msgLower.includes("no ") || msgLower.includes("off") || msgLower.includes("bina")) {
          updateSpecs.hasWalls = false;
          reply += isHindi ? " दीवारों को हटा दिया गया है (केवल छत संरचना)।" : " Walls have been removed (Roof-only structure).";
        } else {
          updateSpecs.hasWalls = true;
          reply += isHindi ? " सहायक दीवारों को जोड़ दिया गया है।" : " Side sheets and walls have been added.";
        }
      }

      // 4. Roof
      if (msgLower.includes("roof") || msgLower.includes("छत") || msgLower.includes("chat")) {
        if (msgLower.includes("remove") || msgLower.includes("हटा") || msgLower.includes("no ") || msgLower.includes("off")) {
          updateSpecs.hasRoof = false;
          reply += isHindi ? " छत की शीट हटा दी गई हैं।" : " Roof sheeting removed.";
        } else {
          updateSpecs.hasRoof = true;
          reply += isHindi ? " छत की शीट जोड़ दी गई हैं।" : " Roof sheeting enabled.";
        }
      }

      // 5. Tabs/Visualizer
      if (msgLower.includes("frame") || msgLower.includes("ढांचा") || msgLower.includes("dhancha")) {
        updateVisualizerTab = "3d-frame";
        reply += isHindi ? " दृश्य को 3D फ्रेम मॉडल में बदल दिया गया है।" : " View switched to 3D frame mode.";
      } else if (msgLower.includes("model") || msgLower.includes("3d") || msgLower.includes("शेड")) {
        updateVisualizerTab = "3d-model";
        reply += isHindi ? " मुख्य 3D शेड मॉडल सक्रिय है।" : " Main 3D shed model view activated.";
      }

      // 6. Sizes (Regex match for width x length or width by length)
      const sizeMatch = msgLower.match(/(\d+)\s*(?:x|by|into|bhai|\*)\s*(\d+)/);
      let isFt = msgLower.includes("feet") || msgLower.includes("ft") || msgLower.includes("फिट") || msgLower.includes("फुट") || dimensionUnit === "ft";
      
      const getClientShedCostReport = (w: number, l: number, isFtUnit: boolean, isHi: boolean) => {
        const w_m = isFtUnit ? w * 0.3048 : w;
        const l_m = isFtUnit ? l * 0.3048 : l;

        const area_m2 = w_m * l_m;
        const area_sqft = area_m2 * 10.7639;

        const weightFactor = 35;
        const targetSteelWeight = (area_m2 * weightFactor) / 1000;
        const primarySteelTons = targetSteelWeight * 0.65;
        const secondarySteelTons = targetSteelWeight * 0.15;

        const primaryCost = Math.round(primarySteelTons * 110000);
        const secondaryCost = Math.round(secondarySteelTons * 90000);
        const roofCost = Math.round(area_m2 * 1.05 * 500);
        const wallCost = Math.round(2 * (w_m + l_m) * 8 * 465);
        const civilCost = Math.round(area_m2 * 1500);
        const hardwareAndLogistics = Math.round(area_m2 * 150 + 30000);

        const subTotal = primaryCost + secondaryCost + roofCost + wallCost + civilCost + hardwareAndLogistics;
        const tax = Math.round(subTotal * 0.18);
        const grandTotal = subTotal + tax;

        const sizeStr = isFtUnit ? `${w} x ${l} ft` : `${w} x ${l} m`;
        const areaStr = `${Math.round(area_sqft).toLocaleString('en-IN')} Sq.ft (${Math.round(area_m2).toLocaleString('en-IN')} Sqm)`;

        if (isHi) {
          return `\n\n💰 **शेड अनुमानित बजट रिपोर्ट (${sizeStr}):**
• **कुल क्षेत्रफल (Area):** ${areaStr}
• **प्राइमरी स्टील फ्रेमिंग (कॉलम और राफ्टर्स):** ₹${primaryCost.toLocaleString('en-IN')} (~${primarySteelTons.toFixed(1)} टन)
• **सेकेंडरी स्टील फ्रेमिंग (पर्लिन्स और गर्ट्स):** ₹${secondaryCost.toLocaleString('en-IN')} (~${secondarySteelTons.toFixed(1)} टन)
• **छत की शीट (Roof sheeting installed):** ₹${roofCost.toLocaleString('en-IN')}
• **दीवार की शीट (Wall cladding installed):** ₹${wallCost.toLocaleString('en-IN')}
• **फाउंडेशन और सिविल कार्य (₹1,500/वर्ग मीटर):** ₹${civilCost.toLocaleString('en-IN')}
• **फास्टनर्स, हार्डवेयर और लॉजिस्टिक्स:** ₹${hardwareAndLogistics.toLocaleString('en-IN')}
• **जीएसटी टैक्स (18% GST):** ₹${tax.toLocaleString('en-IN')}
---
🏆 **कुल टर्नकी अनुमानित मूल्य (Overall PEB Turnkey Total): ₹${grandTotal.toLocaleString('en-IN')}**`;
        } else {
          return `\n\n💰 **Estimated Shed Cost Report (${sizeStr}):**
• **Total Area:** ${areaStr}
• **Primary Steel Framing (Columns & Rafters):** ₹${primaryCost.toLocaleString('en-IN')} (~${primarySteelTons.toFixed(1)} Tons)
• **Secondary Steel Framing (Purlins & Girts):** ₹${secondaryCost.toLocaleString('en-IN')} (~${secondarySteelTons.toFixed(1)} Tons)
• **Roof Sheeting (Installed):** ₹${roofCost.toLocaleString('en-IN')}
• **Wall Cladding (Installed):** ₹${wallCost.toLocaleString('en-IN')}
• **Civil Foundation Work (₹1,500/sqm):** ₹${civilCost.toLocaleString('en-IN')}
• **Fasteners, Hardware & Logistics:** ₹${hardwareAndLogistics.toLocaleString('en-IN')}
• **GST Tax (18%):** ₹${tax.toLocaleString('en-IN')}
---
🏆 **Overall PEB Turnkey Total: ₹${grandTotal.toLocaleString('en-IN')}**`;
        }
      };

      if (sizeMatch) {
        const w = parseInt(sizeMatch[1]);
        const l = parseInt(sizeMatch[2]);
        
        // Convert to meters for storage (since React state expects meters)
        const w_m = isFt ? w * 0.3048 : w;
        const l_m = isFt ? l * 0.3048 : l;

        if (w_m >= 3 && w_m <= 150) updateSpecs.width = Number(w_m.toFixed(2));
        if (l_m >= 3 && l_m <= 500) updateSpecs.length = Number(l_m.toFixed(2));

        const unitLabel = isFt ? "ft" : "m";
        reply += isHindi 
          ? ` शेड का आकार बदलकर ${w} x ${l} ${unitLabel === "ft" ? "फीट" : "मीटर"} कर दिया गया है।` 
          : ` Shed size updated to ${w} x ${l} ${unitLabel}.`;

        // Check if cost/price was also asked
        const isCostQuery = /\b(price|cost|estimate|valuation|amount|budget|paisa|daam|keemat|kharcha|rupee|rs|gst|tax|खर्चा|कीमत|दाम|मूल्य|पैसे)\b/i.test(msgLower);
        if (isCostQuery) {
          reply += getClientShedCostReport(w, l, isFt, isHindi);
        }
      }

      // If they asked about price but didn't specify a size, calculate for current specs
      const isCostQuery = /\b(price|cost|estimate|valuation|amount|budget|paisa|daam|keemat|kharcha|rupee|rs|gst|tax|खर्चा|कीमत|दाम|मूल्य|पैसे)\b/i.test(msgLower);
      if (isCostQuery && !sizeMatch) {
        const currentW = specs ? (specs.width || 30) : 30;
        const currentL = specs ? (specs.length || 60) : 60;
        
        const w_display = isFt ? Math.round(currentW * 3.28084) : currentW;
        const l_display = isFt ? Math.round(currentL * 3.28084) : currentL;

        reply += isHindi
          ? ` यहाँ आपके वर्तमान शेड आकार का अनुमानित मूल्य दिया गया है:`
          : ` Here is the estimated price for your current shed dimensions:`;
        
        reply += getClientShedCostReport(w_display, l_display, isFt, isHindi);
      }

      // 7. Heights
      const heightMatch = msgLower.match(/(?:height|unachai|lambai|eave|ऊंचाई|ऊँचाई)\s*(?:of|is|ko)?\s*(\d+)/) || msgLower.match(/(\d+)\s*(?:feet|ft|meter|m|फिट|मीटर)?\s*(?:height|unachai|ऊंचाई)/);
      if (heightMatch) {
        const h = parseInt(heightMatch[1]);
        if (h >= 6 && h <= 50) {
          updateSpecs.eaveHeight = h;
          reply += isHindi ? ` ईव ऊंचाई को ${h} कर दिया गया है।` : ` Eave height set to ${h}.`;
        }
      }

      // 8. Colors
      if (msgLower.includes("red") || msgLower.includes("लाल") || msgLower.includes("laal")) {
        updateSpecs.roofColor = "#ef4444";
        updateSpecs.wallColor = "#ef4444";
        reply += isHindi ? " रंग लाल कर दिया गया है।" : " Color changed to red.";
      } else if (msgLower.includes("blue") || msgLower.includes("नीला") || msgLower.includes("neela")) {
        updateSpecs.roofColor = "#0089b6";
        updateSpecs.wallColor = "#0089b6";
        reply += isHindi ? " रंग नीला कर दिया गया है।" : " Color changed to blue.";
      } else if (msgLower.includes("green") || msgLower.includes("हरा") || msgLower.includes("hara")) {
        updateSpecs.roofColor = "#22c55e";
        updateSpecs.wallColor = "#22c55e";
        reply += isHindi ? " रंग हरा कर दिया गया है।" : " Color changed to green.";
      }

      // Apply updates to React state
      if (Object.keys(updateSpecs).length > 0) {
        setSpecs(prev => ({ ...prev, ...updateSpecs }));
        actionsExecuted.push("Updated structure parameters");
      }
      if (updateDimensionUnit) {
        setDimensionUnit(updateDimensionUnit);
        actionsExecuted.push(`Switched unit to ${updateDimensionUnit === "ft" ? "Feet" : "Meters"}`);
      }
      if (updateWeatherType) {
        setWeatherType(updateWeatherType);
        actionsExecuted.push(`Set weather scene to ${updateWeatherType}`);
      }
      if (updateVisualizerTab) {
        setVisualizerTab(updateVisualizerTab);
        actionsExecuted.push(`Switched view to "${updateVisualizerTab}"`);
      }

      // Create assistant reply message
      const assistantMsg: Message = {
        id: `asst_local_${Date.now()}`,
        sender: "assistant",
        text: reply,
        timestamp: new Date(),
        actionsExecuted
      };

      setMessages(prev => {
        return prev.map(m => m.id === userMsgId ? { ...m, status: "success" as const } : m).concat(assistantMsg);
      });

      if (isSpeakingEnabled) {
        speakText(reply);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear the conversation history?")) {
      setMessages([
        {
          id: "welcome",
          sender: "assistant",
          text: `👋 Chat history cleared. Language set to ${selectedLang.name}. How can I assist you in configuring your shed?`,
          timestamp: new Date()
        }
      ]);
    }
  };

  return (
    <>
      {/* Floating launcher Button */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-96 max-w-[calc(100vw-2rem)] overflow-hidden flex flex-col h-[520px]"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Bot className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-none flex items-center gap-1.5">
                      Shed Copilot <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                    </h3>
                    <span className="text-[10px] text-slate-400">Multi-lingual AI Engineer</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Language Selector Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-1 bg-slate-800 text-xs py-1 px-2.5 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">
                      <Languages className="w-3.5 h-3.5" />
                      <span>{selectedLang.flag}</span>
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 w-44 z-50 hidden group-hover:block">
                      {LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => setSelectedLang(lang)}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-700 transition-colors flex items-center gap-2 ${selectedLang.code === lang.code ? "bg-slate-700 text-white font-medium" : "text-slate-300"}`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Speech Toggle Button */}
                  <button
                    onClick={() => {
                      const next = !isSpeakingEnabled;
                      setIsSpeakingEnabled(next);
                      if (!next && window.speechSynthesis) {
                        window.speechSynthesis.cancel();
                      }
                    }}
                    title={isSpeakingEnabled ? "Disable speech response" : "Enable speech response"}
                    className={`p-1.5 rounded-lg transition-colors ${isSpeakingEnabled ? "bg-indigo-600/30 text-indigo-400 border border-indigo-500/30" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                  >
                    {isSpeakingEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  {/* Clear Button */}
                  <button
                    onClick={clearHistory}
                    title="Clear history"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[85%] flex flex-col gap-1">
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === "user" ? "bg-slate-900 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-100 shadow-sm rounded-bl-none"}`}>
                        {msg.text}

                        {/* Executed Action Tags */}
                        {msg.actionsExecuted && msg.actionsExecuted.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-col gap-1">
                            {msg.actionsExecuted.map((act, idx) => (
                              <span key={idx} className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                                {act}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className={`flex items-center gap-1 text-[9px] text-slate-400 px-1 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {msg.status === "sending" && <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-400" />}
                        {msg.status === "error" && <AlertCircle className="w-2.5 h-2.5 text-red-500" />}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-slate-500 border border-slate-100 shadow-sm rounded-2xl rounded-bl-none p-3 text-xs flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions / Presets */}
              <div className="p-2 bg-white border-t border-slate-100 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
                {selectedLang.presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(preset)}
                    className="inline-block px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] rounded-full transition-colors border border-slate-200 cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-100 flex flex-col gap-1.5">
                {recognitionError && (
                  <p className="text-[10px] text-red-500 font-medium leading-tight">{recognitionError}</p>
                )}
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={toggleVoiceListening}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${isListening ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/20" : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800"}`}
                    title={isListening ? "Stop listening" : "Start Voice Input"}
                  >
                    <Mic className={`w-4 h-4 ${isListening ? "scale-110" : ""}`} />
                  </button>

                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={selectedLang.placeholder}
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all text-slate-800 placeholder-slate-400"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim()}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-12 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 relative border-2 border-slate-800 ${isOpen ? "rotate-90 bg-indigo-600 hover:bg-indigo-700 border-indigo-500" : ""}`}
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
