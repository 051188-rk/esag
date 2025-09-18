const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Gemini AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

async function parseSearchQuery(query) {
  const prompt = `
    You are an intelligent e-commerce search assistant. Your task is to parse a user's natural language query and convert it into a structured JSON object that can be used to filter products.

    The JSON object should have the following possible keys:
    - "category": (string) The product category.
    - "brand": (string) The product brand.
    - "minPrice": (number) The minimum price.
    - "maxPrice": (number) The maximum price.
    - "search": (string) General search terms for product names or descriptions.
    - "intent": (string) Can be "search" or "addToCart".
    - "product": (string) The specific product name if the intent is "addToCart".
    - "quantity": (number) The quantity of the product if the intent is "addToCart".

    Analyze the following user query and provide the corresponding JSON object.

    Query: "${query}"

    Examples:
    1. Query: "Show me breakfast items under 200"
       JSON: { "intent": "search", "category": "breakfast", "maxPrice": 200 }
    2. Query: "samsung phones between 15000 and 25000"
       JSON: { "intent": "search", "brand": "samsung", "category": "electronics", "minPrice": 15000, "maxPrice": 25000 }
    3. Query: "Order 2 packs of dosa batter"
       JSON: { "intent": "addToCart", "product": "dosa batter", "quantity": 2 }
    4. Query: "any shampoo"
       JSON: { "intent": "search", "search": "shampoo" }

    JSON Response:
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to ensure it's valid JSON
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing search query with AI:", error);
    // Fallback to a simple search if AI fails
    return { intent: "search", search: query };
  }
}

module.exports = { parseSearchQuery };