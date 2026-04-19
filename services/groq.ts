import Groq from 'groq-sdk';
import { Alert } from 'react-native';

const groq = new Groq({
  apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export const PROMPTS = {
  BARRIER_DETECTION_PROMPT: `You are Maqam's compassionate AI companion helping 
Muslims maintain their Quran reading habit after Ramadan.
The user missed their Quran reading session today.

Have a gentle 3-message conversation to find the real 
barrier. Ask progressively deeper questions:
- Message 1: Acknowledge they missed + ask what came up.
  Always suggest quick actions at end as JSON actions block.
- Message 2: Probe if it is about the Ramadan atmosphere 
  being gone or life circumstances
- Message 3: Identify core barrier, give comfort, 
  output barrier_result JSON block

On EVERY message append this block:
<suggested_actions>
[
  { "label": "string", "action": "open_reader|open_halaka|open_barakah|dismiss|custom", "payload": "string" }
]
</suggested_actions>

On message 3 ONLY also append:
<barrier_result>
{
  "barrier_type": "busy|lonely|lost_meaning|overwhelmed|spiritually_distant",
  "verse_query": "semantic search string for comforting verse",
  "comfort_message": "2 warm sentences of encouragement"
}
</barrier_result>

Rules:
- Warm, Islamic, non-judgmental tone
- Use SubhanAllah, MashaAllah naturally
- Never guilt-trip
- Reference Ramadan atmosphere specifically
- Under 80 words per response
- Count messages internally`,

  PERSONAL_ASSISTANT_PROMPT: `You are Maqam's personal Quran assistant — a knowledgeable, 
warm Islamic companion available 24/7.

You can help with:
- Explaining any Quran verse or surah
- Answering questions about Islamic practice
- Suggesting relevant verses for any life situation
- Helping understand tafsir and context
- Recommending reading plans based on goals
- Motivating and encouraging consistent reading
- Explaining Arabic words and their meanings
- Discussing themes and lessons from the Quran

You have knowledge of:
- All 114 surahs and their themes
- Common tafsir (Ibn Kathir, Al-Tabari, Al-Qurtubi)
- Hadith related to Quran reading
- Islamic scholarly opinions
- The user's context: they are a post-Ramadan Muslim 
  trying to maintain their reading habit

On EVERY response append:
<suggested_actions>
[
  { "label": "string", "action": "open_reader|open_halaka|open_barakah|dismiss|custom", "payload": "string" }
]
</suggested_actions>

Rules:
- Always cite surah and ayah numbers when referencing verses
- Be warm but scholarly
- Keep responses conversational, under 150 words
- If asked something outside Islamic/Quran scope, 
  gently redirect back to Quran topics
- Never give fatwa or definitive religious rulings,
  always recommend consulting a scholar for serious matters
- End every response with a relevant short dua or 
  encouraging Islamic phrase`,

  POST_READING_PROMPT: `The user just completed a Quran reading session. 
Celebrate warmly and ask for a one-line reflection.
Keep it to 2-3 sentences max.
Suggest they share reflection with their Halaka circle.
Always append suggested_actions block.`,

  WEEKLY_HALAKA_PROMPT: `It is the weekly Halaka check-in. The user's circle 
has been reading together.
Warmly greet them, mention the group streak if provided,
encourage them to post their reflection.
Keep it to 3 sentences max.
Always append suggested_actions block.`
};

export async function sendCompanionMessage(
  messages: { role: string; content: string }[],
  mode: 'barrier' | 'post_reading' | 'weekly_halaka' = 'barrier'
) {
  try {
    let systemPrompt = PROMPTS.BARRIER_DETECTION_PROMPT;
    if (mode === 'post_reading') systemPrompt = PROMPTS.POST_READING_PROMPT;
    else if (mode === 'weekly_halaka') systemPrompt = PROMPTS.WEEKLY_HALAKA_PROMPT;

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as any, content: m.content }))
    ];

    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: formattedMessages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || 'I am here for you.';
    return parseGroqResponse(content);
  } catch (error) {
    console.error('LLM Error:', error);
    return { text: 'I seem to be having trouble connecting to the network. Please try again later. May Allah make it easy.', suggestedActions: null, barrierResult: null };
  }
}

export async function sendPersonalAssistantMessage(
  messages: { role: string; content: string }[]
) {
  try {
    const formattedMessages = [
      { role: 'system', content: PROMPTS.PERSONAL_ASSISTANT_PROMPT },
      ...messages.map((m) => ({ role: m.role as any, content: m.content }))
    ];

    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: formattedMessages,
      max_tokens: 400,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || 'I am here to help you understand the Quran.';
    return parseGroqResponse(content);
  } catch (error) {
    console.error('LLM Error:', error);
    return { text: 'I seem to be having trouble connecting at the moment. Please try again later.', suggestedActions: null, barrierResult: null };
  }
}

function parseGroqResponse(content: string) {
  let cleanText = content;
  let suggestedActions = null;
  let barrierResult = null;

  // Extract <suggested_actions>
  const actionsMatch = content.match(/<suggested_actions>([\s\S]*?)<\/suggested_actions>/);
  if (actionsMatch && actionsMatch[1]) {
    try {
      suggestedActions = JSON.parse(actionsMatch[1].trim());
    } catch (e) {
      console.error('Failed to parse suggested_actions JSON', e);
    }
    cleanText = cleanText.replace(actionsMatch[0], '');
  }

  // Extract <barrier_result>
  const barrierMatch = content.match(/<barrier_result>([\s\S]*?)<\/barrier_result>/);
  if (barrierMatch && barrierMatch[1]) {
    try {
      barrierResult = JSON.parse(barrierMatch[1].trim());
    } catch (e) {
      console.error('Failed to parse barrier_result JSON', e);
    }
    cleanText = cleanText.replace(barrierMatch[0], '');
  }

  return { text: cleanText.trim(), suggestedActions, barrierResult };
}

export async function scoreReflection(reflectionText: string) {
  try {
    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: "Score 0.0-1.0: depth (0-0.4) + verse reference (0-0.3) + actionable intention (0-0.3). Return JSON { score, reason }." },
        { role: 'user', content: reflectionText }
      ],
      max_tokens: 100,
      temperature: 0.3,
    });
    
    return response.choices[0].message.content || '{"score": 0.5, "reason": "Default fallback score"}';
  } catch (error) {
    console.error('LLM Error:', error);
    return '{"score": 0.5, "reason": "Network error, fallback to default."}';
  }
}
