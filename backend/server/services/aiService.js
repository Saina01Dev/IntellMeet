import OpenAI from 'openai';



export const generateMeetingSummary = async (transcript) => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is missing. Please add it to the .env file.");
    }

    const openai = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
    });

    try {
        const prompt = `
Summarize this meeting professionally.

Also extract:
1. Key decisions
2. Important discussion points
3. Action items with assignees and deadlines.
4. Key decisions made (as an array of strings).
5. Sentiment of the meeting (Positive, Neutral, or Negative).

Respond in JSON format EXACTLY matching this structure:
{
  "summary": "The professional summary text...",
  "actionItems": [
    {
      "task": "Task description",
      "assignee": "Name of assignee",
      "deadline": "Deadline"
    }
  ],
  "decisionPoints": ["Decision 1", "Decision 2"],
  "sentiment": "Positive"
}

Meeting Transcript:
${transcript}
`;

        const response = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are an AI meeting assistant. You must respond with valid JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const result = JSON.parse(response.choices[0].message.content);
        return {
            summary: result.summary || "No summary generated.",
            actionItems: result.actionItems || [],
            decisionPoints: result.decisionPoints || [],
            sentiment: result.sentiment || "Neutral"
        };

    } catch (error) {
        console.error("OpenAI Error:", error.message);



        if (error.status === 429 || error.code === 'insufficient_quota') {
            console.log(">>> Falling back to Mock Summary due to API Quota/Rate Limit <<<");
            return {
                summary: `(MOCK SUMMARY) The meeting focused on the initial project phase and technical architecture. Key discussion points included the integration of OpenAI for automated summaries and the design of a responsive, light-themed user interface. The team agreed on using a modern palette with blue (#2F46FD) as the primary brand color. [Note: This is a fallback because your OpenAI API quota has been exceeded.]`,
                actionItems: [
                    { task: "Top up OpenAI API balance", assignee: "Admin", deadline: "As soon as possible" },
                    { task: "Finalize UI components for Meeting Room", assignee: "Design Team", deadline: "Friday" },
                    { task: "Implement real-time transcription", assignee: "Engineering", deadline: "Next Week" }
                ],
                decisionPoints: [
                    "Use blue palette for brand",
                    "Proceed with Groq API integration",
                    "Delay mobile app launch"
                ],
                sentiment: "Positive"
            };
        }

        throw new Error("Failed to generate AI summary: " + error.message);
    }
};