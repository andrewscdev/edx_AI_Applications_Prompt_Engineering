const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { StructuredOutputParser } = require("@langchain/core/output_parsers");
const z = require('zod');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
// Middleware to parse JSON requests
app.use(bodyParser.json());

//1. Define the desired output schema using Zod
// const parser = StructuredOutputParser.fromZodSchema(
//   z.object({
//     answer: z.string().describe("JavaScript code that answers the user's question"),
//     source: z.string().describe("detailed explanation of the example code provided"),
//   })
// );

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    answer: z.string().describe("JavaScript code that answers the user's question"),
    source: z.string().describe("detailed explanation of the example code provided"),
  })
);

// const parser = StructuredOutputParser.fromZodSchema(
//   z.object({
//     answer: z.string().describe("A concise answer to the user's question"),
//     source: z.string().describe("The source of the information, if applicable"),
//   })
// );

// const parser = StructuredOutputParser.fromZodSchema(
//   z.object({
//     code: z.string().describe("JavaScript code that answers the user's question"),
//     explanation: z.string().describe("detailed explanation of the example code provided"),
//   })
// );

// 2. Initialize the GPT-3.5-turbo model
const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set as an environment variable
  modelName: "gpt-3.5-turbo",
  temperature: 0.7, // Adjust as needed
});

// 3. Create a PromptTemplate with format instructions
const promptTemplate = new PromptTemplate({
  template: `You are a programming expert and will answer the user’s coding questions as thoroughly as possible using JavaScript. If the question is unrelated to coding, do not answer.
  {format_instructions}
  Question: {question}`,
  inputVariables: ["question"],
  partialVariables: { format_instructions: parser.getFormatInstructions() },
});

// 4. Create a chain to combine the prompt and the model
const chain = promptTemplate.pipe(model).pipe(parser);

// // 5. Invoke the chain with a question
// async function main() {
//   try {
//     const result = await chain.invoke({
//       question: "What is the capital of France?",
//     });

//     console.log("Parsed Output:", result);
//     console.log("Answer:", result.answer);
//     console.log("Source:", result.source);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// main();

const promptFunc = async (input) => {
  try {
      // Format the prompt with the user input
      // const promptInput = await prompt.format({
      //   question: input
      // });

      //const res = await chain.invoke(promptInput);
      console.log("input is: " + input + "type is: "+ typeof input);
      const inputFormatted = input.toString();
      console.log("inputFormatted is: " + inputFormatted);


      const res = await chain.invoke({
       question: inputFormatted,
     });

    // For a non-coding question, the model returns an error message, causing parse() to throw an exception.
    // In this case, simply return the error message instead of the parsed results.
        try { 
            // const parsedResult = await parser.parse(res);
            // console.log("parsedResult is: "+parsedResult);
            console.log("Parsed Output:", result);

            console.log("Answer:", result.answer);
            console.log("Source:", result.source);

            //  console.log("Code:", result.code);
            //  console.log("Explanation:", result.explanation);
            return parsedResult;
        } catch (e) { 
            return res;
        }
    }
    catch (err) {
        console.error(err);
        throw(err);
    }
};

// POST /ask route
app.post("/ask", async (req, res) => {
 // const { question } = req.body;
    try {
        const userQuestion = req.body.question;

        if (!userQuestion) {
            return res.status(400).json({ error: "A question is required." });
        }
        // Simple response logic (replace with AI logic, DB lookup, etc.)
        // const answer = `You asked: "${question}". This is the server's response!`;
        // res.json({ answer });

        const result = await promptFunc(userQuestion);
        //console.log(result);
        res.json({ result });
    }
    catch(error){
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});