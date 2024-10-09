const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GENERATIVE_AI_KEY;

const genAI = new GoogleGenerativeAI(apiKey);
let model;

async function routes(fastify, options) {
  try {
    model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (error) {
    console.error("Error fetching model:", error);
    return;
  }

  // Function to generate unique questions with retries
  const generateUniqueQuestions = async (prompt, retries = 3) => {
    let uniqueQuestions = [];
    let attempts = 0;

    while (uniqueQuestions.length < 10 && attempts < retries) {
      const remainingQuestions = 10 - uniqueQuestions.length;
      const currentPrompt = `${prompt} Generate ${remainingQuestions} additional questions.`;

      try {
        const result = await model.generateContent(currentPrompt);
        const candidates = result?.response?.candidates;

        if (Array.isArray(candidates) && candidates.length > 0) {
          const questionsText = candidates[0]?.content?.parts?.[0]?.text;

          if (typeof questionsText === 'string' && questionsText.trim().length > 0) {
            const questionsArray = questionsText.split('\n\n').filter(q => q.trim().length > 0);
            const formattedQuestions = questionsArray.map((questionText) => {
              const lines = questionText.split('\n').filter(line => line.trim().length > 0);
              if (lines.length < 6) {
                console.warn('Incomplete MCQ format detected');
                return null;
              }
              const question = lines[0].replace('Question: ', '').trim();
              const options = lines.slice(1, 5).map((line, idx) => ({
                label: String.fromCharCode(97 + idx), // Convert index to a, b, c, d
                option: line.replace(`(${String.fromCharCode(97 + idx)})`, '').trim()
              }));
              const correctAnswerLine = lines[5]?.replace('Correct Answer: ', '').trim();
              const correctAnswers = correctAnswerLine?.match(/\((.)\)/g)?.map(match => match[1]);
              const explanation = lines.length > 6 ? lines[6].replace('Explanation: ', '').trim() : "No explanation provided.";
              return { question, options, correctAnswers, explanation };
            }).filter(q => q !== null);

            formattedQuestions.forEach((q) => {
              if (!uniqueQuestions.some(existingQuestion => existingQuestion.question === q.question)) {
                uniqueQuestions.push(q);
              }
            });
          }
        }
      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error);
      }

      attempts += 1;
    }

    if (uniqueQuestions.length < 10) {
      throw new Error('Failed to generate 10 unique questions after multiple attempts.');
    }

    return uniqueQuestions;
  };

  // Route to generate questions
  fastify.post('/questions/generate', async (request, reply) => {
    const { subject, chapter } = request.body;

    const prompt = `Generate 10 multiple-choice questions for the chapter "${chapter}" in ${subject}. Each question should have four options labeled (a), (b), (c), and (d), with one or more correct answers indicated. Each question should also include a detailed explanation (2-3 lines) for the answer. Format each question like the following example:

    Question: What is the sum of 2 + 2?
    (a) 1
    (b) 2
    (c) 3
    (d) 4
    Correct Answer: (d)
    Explanation: The sum of 2 and 2 is 4, which is obtained by adding both numbers together.

    Ensure that each question follows this format.`;

    try {
      console.log("Prompt:", prompt);

      if (!model) {
        throw new Error("Model not initialized correctly.");
      }

      // Generate unique questions
      const questions = await generateUniqueQuestions(prompt);
      console.log("Generated Questions:", questions);

      return reply.code(201).send({ questions });
    } catch (error) {
      console.error('Error generating questions:', error);
      return reply.status(500).send({ message: 'Error generating questions', error: error.message });
    }
  });

  // Route to evaluate answers
  fastify.post('/questions/evaluate', async (request, reply) => {
    const { userAnswers } = request.body; // Expected format: { "1": "a", "2": "b", ... }

    try {
      if (!model) {
        throw new Error("Model not initialized correctly.");
      }

      // Retrieve questions from the in-memory storage
      const generatedQuestions = fastify.generatedQuestions;
      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error("No questions available for evaluation.");
      }

      // Evaluate user answers
      const evaluation = generatedQuestions.map((question, index) => {
        const userAnswer = userAnswers[(index + 1).toString()];
        const isCorrect = question.correctAnswers.includes(userAnswer);
        return {
          question: question.question,
          correctAnswers: question.correctAnswers,
          userAnswer: userAnswer,
          isCorrect: isCorrect,
          explanation: question.explanation
        };
      });

      return reply.code(200).send({ evaluation });
    } catch (error) {
      console.error('Error evaluating answers:', error);
      return reply.status(500).send({ message: 'Error evaluating answers', error: error.message });
    }
  });
}

module.exports = routes;