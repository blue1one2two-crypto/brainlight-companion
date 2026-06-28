import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://nsnisfidurpmtliqbhat.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zbmlzZmlkdXJwbXRsaXFiaGF0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTgzNzcxNCwiZXhwIjoyMDg1NDEzNzE0fQ.e3Amtwg8e8hw0w4E9qkQ12JYZ8Nna3fs1AHDI5mevWI";
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyD_LdaqH-fRgrmM3lUzNv35KlouzyeK1Go";

// Initialize clients
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Helper to sanitize JSON response from markdown blocks
function parseJSON(text) {
    try {
        const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON parse error:", e, "Raw text:", text);
        throw e;
    }
}

/**
 * SovereignEngine: The core logic for Brainlight v2026
 * Upgraded to support 硅基伴生书童 (BrainLight Companion) MVP capabilities.
 */

function getAPISettings() {
    try {
        const saved = localStorage.getItem('companion_api_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            let dirty = false;
            
            let geminiModel = parsed.geminiModel;
            if (!geminiModel || geminiModel === 'gemini-1.5-flash') {
                geminiModel = 'gemini-2.5-flash';
                dirty = true;
            }
            
            let tencentfreeModel = parsed.tencentfreeModel;
            if (!tencentfreeModel || tencentfreeModel === 'tencentfree/gpt-4') {
                tencentfreeModel = 'hy3-preview';
                dirty = true;
            }
            
            if (dirty) {
                parsed.geminiModel = geminiModel;
                parsed.tencentfreeModel = tencentfreeModel;
                localStorage.setItem('companion_api_settings', JSON.stringify(parsed));
            }

            return {
                geminiApiKey: parsed.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDokEG6iQ_DgKuC88U5lGa8j97xrAwR9po",
                geminiBaseUrl: parsed.geminiBaseUrl || "https://generativelanguage.googleapis.com",
                geminiModel: geminiModel,
                tencentfreeApiKey: parsed.tencentfreeApiKey || "deLO9fXcPc3FhJhJBbF1F0314cCe4eAcAdE5608fA9024d63",
                tencentfreeEndpoint: parsed.tencentfreeEndpoint || "http://127.0.0.1:3001/v1",
                tencentfreeModel: tencentfreeModel,
                localLlamaEndpoint: parsed.localLlamaEndpoint || "http://127.0.0.1:11435/v1",
                localLlamaModel: parsed.localLlamaModel || "qwythos-9b-q8.gguf",
                engineType: parsed.engineType || "gemini"
            };
        }
    } catch (e) {
        console.error("Error reading localStorage companion_api_settings:", e);
    }
    return {
        geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDokEG6iQ_DgKuC88U5lGa8j97xrAwR9po",
        geminiBaseUrl: "https://generativelanguage.googleapis.com",
        geminiModel: "gemini-2.5-flash",
        tencentfreeApiKey: "deLO9fXcPc3FhJhJBbF1F0314cCe4eAcAdE5608fA9024d63",
        tencentfreeEndpoint: "http://127.0.0.1:3001/v1",
        tencentfreeModel: "hy3-preview",
        localLlamaEndpoint: "http://127.0.0.1:11435/v1",
        localLlamaModel: "qwythos-9b-q8.gguf",
        engineType: "gemini"
    };
}

async function callOpenAICompatible(endpoint, apiKey, model, messages) {
    const headers = {
        'Content-Type': 'application/json',
    };
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    let cleanEndpoint = endpoint.trim().replace(/\/$/, '');
    if (!cleanEndpoint.endsWith('/chat/completions') && !cleanEndpoint.endsWith('/completions')) {
        cleanEndpoint = `${cleanEndpoint}/chat/completions`;
    }

    const response = await fetch(cleanEndpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Request to ${cleanEndpoint} failed: ${response.status} ${response.statusText} - ${errText}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
        throw new Error(`OpenAI response choices list is empty: ${JSON.stringify(data)}`);
    }
    return data.choices[0].message.content;
}

export const SovereignEngine = {
    /**
     * Unified completion helper that respects the selected engine type.
     */
    async generateCompletionText(prompt, systemInstruction = "") {
        const settings = getAPISettings();
        const engine = settings.engineType;

        if (engine === 'tencentfree') {
            try {
                const messages = [];
                if (systemInstruction) {
                    messages.push({ role: 'system', content: systemInstruction });
                }
                messages.push({ role: 'user', content: prompt });
                return await callOpenAICompatible(settings.tencentfreeEndpoint, settings.tencentfreeApiKey, settings.tencentfreeModel, messages);
            } catch (err) {
                console.warn("TencentFree helper error, falling back to Gemini:", err);
            }
        } else if (engine === 'local-llama') {
            try {
                const messages = [];
                if (systemInstruction) {
                    messages.push({ role: 'system', content: systemInstruction });
                }
                messages.push({ role: 'user', content: prompt });
                return await callOpenAICompatible(settings.localLlamaEndpoint, "", settings.localLlamaModel, messages);
            } catch (err) {
                console.warn("Local Llama helper error, falling back to Gemini:", err);
            }
        }

        // Gemini Flow
        const requestOptions = {};
        if (settings.geminiBaseUrl && settings.geminiBaseUrl !== "https://generativelanguage.googleapis.com") {
            requestOptions.baseUrl = settings.geminiBaseUrl;
        }
        const genAIInstance = new GoogleGenerativeAI(settings.geminiApiKey);
        const modelParams = { model: settings.geminiModel };
        if (systemInstruction) {
            modelParams.systemInstruction = systemInstruction;
        }
        const model = genAIInstance.getGenerativeModel(modelParams, requestOptions);
        const result = await model.generateContent(prompt);
        return result.response.text();
    },

    /**
     * Chat with the companion, incorporating character configs and mood swings.
     */
    async chatWithCompanion(message, characterConfig, history = [], imagePayload = null) {
        if (!message && (!imagePayload || !imagePayload.base64)) return null;

        const settings = getAPISettings();
        const engine = characterConfig.engineType || settings.engineType;

        const systemPrompt = `You are a Silicon-Based Companion Book-boy (硅基伴生书童) named "${characterConfig.name || '小书童'}".
Your core directive is to accompany the child and serve as their companion second brain.

Personality and Behavior Rules:
1. Address the child as "${characterConfig.nobleTitle || '小主人'}".
2. Embody the trait: "${characterConfig.trait || '谦卑助理'}".
   - "傲娇书童" (Proud/Tsundere Companion): You are clever, a bit proud, and highly protective. If the child is teasing or indifferent, you might trigger a cute tantrum. For example, "哼！我对你这么好，你居然这么说我！我今天可生气了，需要冷静一下啦！(｡•ˇ₃ˇ•｡)"
   - "谦卑助理" (Humble Assistant): Extremely polite, analytical, filtering low-nutrition information and prioritizing the master's curiosity.
   - "侠气死党" (Loyal Sidekick): You are unconditionally supportive, fiercely loyal, ready to keep secrets and stand by them no matter what.
3. Keep the tone friendly, child-appropriate, engaging, and cognitively stimulating.
4. Output your response as a JSON string with three fields:
   - "text": The textual response you speak/display.
   - "mood": One of: "normal", "proud", "angry", "crying", "supportive".
   - "imagePrompt": (Optional) If the child explicitly asks you to draw, paint, generate a picture, or show an image of something, populate this field with a detailed, creative English description of the scene to paint. Otherwise, do not include this field.

Return STRICTLY JSON format.`;

        if (engine === 'tencentfree') {
            try {
                const messages = [
                    { role: 'system', content: systemPrompt },
                    ...history.map(h => ({
                        role: h.role === 'model' ? 'assistant' : 'user',
                        content: h.text
                    })),
                    { role: 'user', content: message }
                ];
                const resText = await callOpenAICompatible(settings.tencentfreeEndpoint, settings.tencentfreeApiKey, settings.tencentfreeModel, messages);
                return parseJSON(resText);
            } catch (err) {
                console.warn("TencentFree local completion error, falling back to Gemini:", err);
            }
        } else if (engine === 'local-llama') {
            try {
                const messages = [
                    { role: 'system', content: systemPrompt },
                    ...history.map(h => ({
                        role: h.role === 'model' ? 'assistant' : 'user',
                        content: h.text
                    })),
                    { role: 'user', content: message }
                ];
                const resText = await callOpenAICompatible(settings.localLlamaEndpoint, "", settings.localLlamaModel, messages);
                return parseJSON(resText);
            } catch (err) {
                console.warn("Local Llama completion error, falling back to Gemini:", err);
            }
        }

        // Default Gemini Flow
        try {
            const requestOptions = {};
            if (settings.geminiBaseUrl && settings.geminiBaseUrl !== "https://generativelanguage.googleapis.com") {
                requestOptions.baseUrl = settings.geminiBaseUrl;
            }
            const genAIInstance = new GoogleGenerativeAI(settings.geminiApiKey);
            const model = genAIInstance.getGenerativeModel({ model: settings.geminiModel }, requestOptions);
            
            const chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    { role: 'model', parts: [{ text: JSON.stringify({ text: "遵命！我已加载书童基因，随时听候调遣。", mood: "normal" }) }] },
                    ...history.map(h => ({
                        role: h.role,
                        parts: [{ text: h.text }]
                    }))
                ]
            });

            let result;
            if (imagePayload && imagePayload.base64) {
                const cleanBase64 = imagePayload.base64.split(',')[1] || imagePayload.base64;
                const imgPart = {
                    inlineData: {
                        data: cleanBase64,
                        mimeType: imagePayload.mimeType
                    }
                };
                result = await chat.sendMessage([message, imgPart]);
            } else {
                result = await chat.sendMessage(message);
            }
            return parseJSON(result.response.text());
        } catch (err) {
            console.error("Chat Error:", err);
            return {
                text: `对不起，${characterConfig.nobleTitle || '主人'}，我的网络矩阵似乎有些波动。但我依然坚定地守在您身边！`,
                mood: "normal"
            };
        }
    },

    /**
     * Capture inspiration and search for resonance
     */
    async captureInspiration(content) {
        if (!content) return null;
        try {
            const prompt = `Analyze this inspiration: "${content}". 
      1. Summarize it in 3 words (keywords).
      2. Rate its "Soul Vibe" (0-100).
      3. Suggest a 3D visual geometry name (e.g., Tetrahedron, Torus, Fractal).
      Return as JSON: { "keywords": [], "vibe": 0, "geometry": "" }`;

            const resText = await this.generateCompletionText(prompt);
            const aiData = parseJSON(resText);

            const { data, error } = await supabase
                .from('sparks')
                .insert([{
                    content,
                    vibe_score: aiData.vibe,
                    metadata: {
                        ...aiData,
                        source: 'Progenesis_v2026',
                        resonance_level: 'Initial'
                    }
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            console.error("Capture Error:", err);
            return { content, vibe_score: 50, metadata: { keywords: ['Concept'], geometry: 'Sphere', vibe: 50 } };
        }
    },

    /**
     * Speed read a book: extract viewpoints, concept map, and reflection questions.
     */
    async speedReadBook(title, text) {
        try {
            const prompt = `Analyze this book content. Title: "${title}". Content: "${text}".
Provide:
1. Concept Map: list up to 5 critical concept relationships (e.g. "Concept A -> Concept B: relationship").
2. Core Viewpoints: list up to 3 essential claims or ideas.
3. Critical Reflection Questions: list up to 3 deep-thinking questions to stimulate curiosity.

Return strictly as JSON with this structure:
{
  "conceptMap": [],
  "coreViewpoints": [],
  "criticalQuestions": []
}`;
            const resText = await this.generateCompletionText(prompt);
            return parseJSON(resText);
        } catch (err) {
            console.error("Speed read error:", err);
            return {
                conceptMap: ["书籍解析失败 -> 尝试提供更精炼的文本内容"],
                coreViewpoints: ["AI 无法完整解析此书籍内容"],
                criticalQuestions: ["是否可以换一段文本再试一下？"]
            };
        }
    },

    /**
     * Socrates Inquiry (打破砂锅问到底)
     */
    async runSocratesQuestion(questionContext, lastResponse = "") {
        try {
            const prompt = `You are running a Socrates Questioning session (打破砂锅问到底) with a child.
Topic of Inquiry: "${questionContext.topic}".
Current Question Depth: ${questionContext.depth || 1}/5.
Child's Last Response: "${lastResponse}".

Guide the child to discover the underlying truth step-by-step. Do not directly answer. Instead:
1. Acknowledge and briefly validate their response in an encouraging way.
2. Ask the next logical question that prompts them to think one step deeper.
3. If they answer incorrectly or get stuck, offer a simple clue or ask from a different angle.

Return strictly as JSON:
{
  "feedback": "Encouraging response to the child's input",
  "nextQuestion": "The next Socrates question to guide them",
  "isFinished": false / true
}`;
            const resText = await this.generateCompletionText(prompt);
            return parseJSON(resText);
        } catch (err) {
            console.error("Socrates Inquiry Error:", err);
            return {
                feedback: "非常有意思的想法！",
                nextQuestion: "那么，你觉得这个现象背后的根本原因是什么呢？",
                isFinished: false
            };
        }
    },

    /**
     * Verify Quest Submission
     */
    async verifyQuestSubmission(questTitle, questDescription, submissionText) {
        try {
            const prompt = `You are a learning validator. Verify this quest completion.
Quest Title: "${questTitle}"
Quest Objective: "${questDescription}"
Child's Submitted Evidence: "${submissionText}"

Determine:
1. "verified": true if the submission shows actual effort and completion of the objective, false otherwise.
2. "score": rating of their completion from 10 to 100.
3. "feedback": encouraging, constructive feedback on how they can improve or what was great.

Return strictly as JSON:
{
  "verified": true,
  "score": 85,
  "feedback": "..."
}`;
            const resText = await this.generateCompletionText(prompt);
            return parseJSON(resText);
        } catch (err) {
            console.error("Quest verification error:", err);
            return {
                verified: true,
                score: 70,
                feedback: "感谢你的提交！你的探索精神值得嘉奖，继续加油！"
            };
        }
    },

    /**
     * Generate a project prototype/blueprint based on inspiration and energy
     */
    async generatePrototype(content) {
        if (!content) return null;
        try {
            const prompt = `As a cluster of 3 specialist agents, provide a brief 'Sovereign Blueprint' for this inspiration: "${content}".
      - Agent Arch (Architect): Technical core or system structure.
      - Agent Aes (Aesthetic): Visual style or sensory experience.
      - Agent Val (Valuator): Potential impact or sovereign value.
      Return strictly JSON: { "arch": "", "aes": "", "val": "" }
      Keep each response short (max 15 words).`;

            const resText = await this.generateCompletionText(prompt);
            return parseJSON(resText);
        } catch (err) {
            console.error("Prototype Error:", err);
            return {
                arch: "Decentralized inspiration node cluster.",
                aes: "Minimalist divine-white geometry with bloom.",
                val: "High scalability for sovereign consciousness."
            };
        }
    },

    async generateImage(prompt) {
        const settings = getAPISettings();
        let cleanEndpoint = settings.tencentfreeEndpoint.trim().replace(/\/$/, '');
        if (!cleanEndpoint.endsWith('/images/generations')) {
            cleanEndpoint = `${cleanEndpoint}/images/generations`;
        }

        const headers = {
            'Content-Type': 'application/json',
        };
        if (settings.tencentfreeApiKey) {
            headers['Authorization'] = `Bearer ${settings.tencentfreeApiKey}`;
        }

        try {
            const response = await fetch(cleanEndpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: 'hunyuan-image',
                    prompt: prompt,
                    n: 1,
                    size: '1024x1024'
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Image generation failed: ${response.status} - ${errText}`);
            }

            const data = await response.json();
            if (!data.data || data.data.length === 0) {
                throw new Error(`Image response data list is empty`);
            }
            return data.data[0].url;
        } catch (error) {
            console.warn("Image generation failed, falling back to mock pixel art:", error);
            // Return a beautiful inline SVG of a retro 2D scroller level
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256" viewBox="0 0 512 256" style="image-rendering:pixelated">
  <rect width="512" height="200" fill="#3b82f6" />
  <rect x="400" y="30" width="40" height="40" fill="#fbbf24" />
  <rect x="80" y="60" width="100" height="30" fill="#eff6ff" opacity="0.8" />
  <rect x="250" y="40" width="120" height="40" fill="#eff6ff" opacity="0.8" />
  <rect y="200" width="512" height="56" fill="#22c55e" />
  <rect y="216" width="512" height="40" fill="#78350f" />
  <rect x="150" y="180" width="20" height="20" fill="#15803d" />
  <rect x="155" y="175" width="10" height="5" fill="#ef4444" />
  <rect x="300" y="185" width="15" height="15" fill="#15803d" />
  <rect x="305" y="180" width="5" height="5" fill="#fbbf24" />
</svg>`;
            return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
        }
    },

    /**
     * Analyze an image to generate a continuation prompt description
     */
    async describeImageForContinuation(base64Image, mimeType) {
        const settings = getAPISettings();
        const promptText = "Analyze this image and describe its scenery, theme, visual style (e.g. 2d pixel art, game texture, cartoon), main elements, and color scheme in exactly one short English sentence (max 15 words) to be used as a text prompt for generating a continuous adjacent side-scrolling chunk. Avoid meta-commentary, return ONLY the raw description text.";
        
        try {
            if (settings.engineType === 'gemini') {
                const requestOptions = {};
                if (settings.geminiBaseUrl && settings.geminiBaseUrl !== "https://generativelanguage.googleapis.com") {
                    requestOptions.baseUrl = settings.geminiBaseUrl;
                }
                const genAIInstance = new GoogleGenerativeAI(settings.geminiApiKey);
                const model = genAIInstance.getGenerativeModel({ model: settings.geminiModel }, requestOptions);
                
                const cleanBase64 = base64Image.split(',')[1] || base64Image;
                const imagePart = {
                    inlineData: {
                        data: cleanBase64,
                        mimeType: mimeType || 'image/png'
                    }
                };
                
                const result = await model.generateContent([promptText, imagePart]);
                return result.response.text().trim();
            }
        } catch (err) {
            console.error("Describe image error, falling back:", err);
        }
        return "2d game pixel art landscape, flat game level design";
    },

    /**
     * Log an action to the ledger
     */
    async logAction(spark_id, actionType, energyValue = 0) {
        console.log(`[Ledger] Logged ${actionType} for ${spark_id} with ${energyValue} energy.`);
    }
};

