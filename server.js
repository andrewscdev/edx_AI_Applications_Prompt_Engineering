const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StructuredOutputParser } = require("@langchain/core/output_parsers");
const z = require('zod');
require('dotenv').config();

// 1. Define the desired output schema using Zod
const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    answer: z.string().describe("A concise answer to the user's question"),
    source: z.string().describe("The source of the information, if applicable"),
  })
);

// 2. Initialize the GPT-3.5-turbo model
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set as an environment variable
  modelName: "gpt-3.5-turbo",
  temperature: 0.7, // Adjust as needed
});

// 3. Create a PromptTemplate with format instructions
const promptTemplate = new PromptTemplate({
  template: `Answer the following question as concisely as possible.
  {format_instructions}
  Question: {question}`,
  inputVariables: ["question"],
  partialVariables: { format_instructions: parser.getFormatInstructions() },
});

// 4. Create a chain to combine the prompt and the model
const chain = promptTemplate.pipe(model).pipe(parser);

// 5. Invoke the chain with a question
async function main() {
  try {
    const result = await chain.invoke({
      question: "What is the capital of France?",
    });

    console.log("Parsed Output:", result);
    console.log("Answer:", result.answer);
    console.log("Source:", result.source);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();