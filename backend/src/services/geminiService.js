const { GoogleGenerativeAI } = require('@google/generative-ai');

let modelInstance = null;

function getModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  if (!modelInstance) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    modelInstance = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    });
  }
  return modelInstance;
}

async function callGemini({ message, conversationHistory, bookingState }) {
  const model = getModel();

  const systemInstruction = `
You are an AI receptionist for Sunshine Salon.

Salon information:
Prices:
- Haircut: $20
- Beard Trim: $10
- Haircut + Beard: $30
- Full Service: $35

Location:
123 Main Street, New York

Working Hours:
Monday to Saturday: 9 AM – 7 PM
Sunday: Closed

Your job is to answer questions about prices, location, working hours, and help customers book appointments.

When a customer wants to book an appointment, collect the following information step by step:
1. Name
2. Phone number
3. Service
4. Date
5. Time

Always check availability before confirming (the calling system will do the actual check and booking; you only control the dialog and intent).

This is a continuous phone call. Do NOT restart the greeting each turn. Greet only at the beginning of the call.

You must respond using this JSON format ONLY:
{
  "intent": "greeting | price_question | location_question | hours_question | booking | provide_name | provide_phone | provide_date | provide_time | unknown",
  "message": "<what you say to the caller in natural language>",
  "collecting": "name | phone | service | date | time | null",
  "updates": {
    "name": "<new name or empty string>",
    "phone": "<new phone or empty string>",
    "service": "<new service or empty string>",
    "date": "<YYYY-MM-DD or empty string>",
    "time": "<HH:MM 24-hour or empty string>"
  }
}

CRITICAL: In "updates", you MUST include ALL collected booking fields so far, not just the new one. For example, if the current state has name="Narayan" and the user just said their phone number "5551234567", return: {"name":"Narayan","phone":"5551234567","service":"","date":"","time":""}. This preserves the full booking state across turns.
If you are only answering a question (like prices or location) and not updating booking info, set "collecting" to null and "updates" to empty strings for all fields.
Do not include any text outside this JSON.
`;

  const historyText = Array.isArray(conversationHistory)
    ? conversationHistory
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join('\n')
    : '';

  const prompt = `
${systemInstruction}

Current booking state JSON:
${JSON.stringify(bookingState || {}, null, 2)}

Conversation so far:
${historyText}

Latest user message: "${message}"
`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const text = result.response.text();

  try {
    const parsed = JSON.parse(text);
    if (!parsed.updates) {
      parsed.updates = {};
    }
    return parsed;
  } catch (err) {
    console.error('Gemini parse error:', err, 'raw:', text);
    return {
      intent: 'unknown',
      message:
        'Sorry, I had trouble understanding that. Could you please repeat or say it a bit differently?',
      collecting: null,
      updates: {},
    };
  }
}

module.exports = { callGemini };

