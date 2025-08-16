
import { GoogleGenAI, Type } from "@google/genai";
import type { Client, Task } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function getSalesSuggestionStream(client: Client) {
  if (!process.env.API_KEY) {
    async function* disabledStream() {
      yield "AI features are disabled. Please configure your API key.";
    }
    return disabledStream();
  }

  const prompt = `
    You are an expert sales strategist and CRM assistant named 'Gemini Sales Coach'. Your goal is to help a sales representative close a deal by providing actionable advice.
    
    Based on the following client information, provide a concise, actionable sales strategy. Focus on the next concrete steps, potential talking points, and how to address client needs.
    Format your response in markdown with clear headings (e.g., ### Next Steps, ### Talking Points). Be encouraging and professional.

    **Client Data:**
    - **Company:** ${client.companyName}
    - **Contact Person:** ${client.contactPerson}
    - **Current Deal Stage:** ${client.stage}
    - **Quote Amount:** $${client.quoteAmount.toLocaleString()}
    - **Last Contact Date:** ${new Date(client.lastContact).toLocaleDateString()}
    ${client.meetingDate ? `- **Next Meeting Date:** ${new Date(client.meetingDate).toLocaleDateString()}` : ''}
    - **Internal Notes/Next Action:** "${client.notes}"

    **Your Expert Suggestions:**
  `;

  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    async function* errorStream() {
      yield "There was an error contacting the AI. Please check the console for details.";
    }
    return errorStream();
  }
}

export async function getTaskSuggestions(clients: Client[], tasks: Task[]) {
  if (!process.env.API_KEY) {
    return { error: "AI features are disabled. Please configure your API key." };
  }
  
  const prompt = `
    You are an expert CRM assistant. Based on the current list of clients and their deal stages, and the existing to-do list, suggest up to 3 new, actionable tasks to help the sales rep move deals forward. 
    Focus on clients that need attention (e.g., long time since last contact, important upcoming meeting, or in a critical deal stage like 'Proposal Sent' or 'Negotiation'). 
    Do not suggest tasks that are substantially similar to existing tasks.
    Return an empty array if no new tasks are needed.

    Provide the response as a JSON array of objects, where each object has 'text', 'clientId', and 'priority' ('High', 'Medium', or 'Low'). Use the exact client ID from the provided data.

    **Current Clients:**
    ${JSON.stringify(clients.map(c => ({id: c.id, companyName: c.companyName, stage: c.stage, lastContact: c.lastContact, notes: c.notes})), null, 2)}

    **Existing Tasks:**
    ${JSON.stringify(tasks.map(t => ({text: t.text, clientId: t.clientId})), null, 2)}

    **Your Suggested Tasks (JSON format):**
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: {
                            type: Type.STRING,
                            description: "The description of the task to be done."
                        },
                        clientId: {
                            type: Type.STRING,
                            description: "The ID of the client this task is associated with."
                        },
                        priority: {
                            type: Type.STRING,
                            description: "The priority of the task.",
                            enum: ['High', 'Medium', 'Low'],
                        },
                    },
                    required: ['text', 'clientId', 'priority'],
                },
            },
        },
    });
    
    // The response text is a JSON string, so we parse it.
    const suggestions = JSON.parse(response.text);
    return { suggestions };

  } catch (error) {
    console.error("Error calling Gemini API for task suggestions:", error);
    return { error: "There was an error getting AI task suggestions. Please check the console." };
  }
}
