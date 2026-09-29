const { GoogleGenAI, Type } = require("@google/genai")
const { z } = require("zod")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = z.object({

    matchScore: z.number().describe("A score between 0 and 100 indicating how weel the the candidate's profile matches the job description"),
    technicalQuestions: z.array(
        z.object({
            question: z.string().describe("A technical interview question tailored to the candidate's resume, skills, projects, and target job description. The question should test practical knowledge, problem-solving ability, technical depth, and understanding of concepts relevant to the role."),
            intention: z.string().describe("Explain the interviewer's purpose behind asking this question. Mention what the interviewer is evaluating, such as conceptual understanding, coding ability, debugging skills, architecture knowledge, real-world experience, or depth of knowledge."),
            answer: z.string().describe("Provide a structured approach for answering this question. Include key points to mention, concepts to explain, examples from projects or experience to reference, and the ideal thought process expected from a strong candidate.")
        })
    ).describe("A list of technical interview questions generated based on the candidate profile and job requirements. Each question should simulate a realistic interview scenario and include the reason behind asking it and guidance on answering effectively."),
    behavioralQuestions: z.array(
        z.object({
            question: z.string().describe("A behavioral interview question designed to evaluate the candidate's communication skills, teamwork, leadership, problem-solving approach, adaptability, conflict handling, and professional experiences."),
            intention: z.string().describe("Explain what the interviewer wants to understand through this behavioral question. Mention the specific soft skill, personality trait, work habit, or professional quality being evaluated."),
            answer: z.string().describe("Provide guidance on how the candidate should structure their response. Include recommended approaches such as STAR method (Situation, Task, Action, Result), important points to cover, and examples of strong answers.")
        })
    ).describe("A list of realistic behavioral interview questions along with the interviewer's intention and guidance for creating strong, structured responses."),
    skillGaps: z.array(
        z.object({
            skill: z.string().describe("The technical or professional skill that is missing, weak, or insufficiently demonstrated in the candidate's profile compared to the requirements of the target role."),
            severity: z.enum(["low", "medium", "high"]).describe("Indicates how critical this skill gap is for the target role. High means the missing skill is essential and may strongly impact job suitability. Medium means improvement is recommended. Low means it is a minor gap with limited impact.")
        })
    ).describe("A detailed analysis of missing skills between the candidate profile and job requirements. The purpose is to identify improvement areas that increase interview and job success chances."),
    preparationPlan: z.array(
        z.object({
            day: z.number().describe("The sequential day number in the interview preparation roadmap. The plan should start from day 1 and progress logically toward interview readiness."),
            focus: z.string().describe("The primary learning objective for this preparation day. It should specify the main area of improvement, such as technical concepts, coding practice, system design, projects, communication skills, or mock interviews."),
            tasks: z.array(z.string()).describe("A list of specific actionable tasks the candidate should complete on this day. Tasks should be practical, measurable, and directly connected to improving interview performance, technical ability, or confidence.")
        })
    ).describe("A structured day-by-day interview preparation roadmap that guides the candidate from identifying weaknesses to becoming interview-ready. Each day should contain a clear focus area and practical tasks."),
    title: z.string().describe("A concise title summarizing the overall interview report, highlighting the candidate's profile, key strengths, and areas for improvement."),
    summary: z.string().describe("A brief summary of the interview report, providing an overview of the candidate's profile, strengths, weaknesses, and recommended next steps for interview preparation.")
});

function stripUnsupportedKeys(schema) {
    if (Array.isArray(schema)) {
        return schema.map(stripUnsupportedKeys);
    }
    if (schema && typeof schema === "object") {
        const cleaned = {};
        for (const [key, value] of Object.entries(schema)) {
            // Gemini's responseSchema (OpenAPI 3.0 subset) doesn't support these
            if (key === "$schema" || key === "additionalProperties") continue;
            cleaned[key] = stripUnsupportedKeys(value);
        }
        return cleaned;
    }
    return schema;
}

function toGeminiSchema(zodSchema) {
    // Zod v4 has a built-in JSON Schema converter (zod-to-json-schema doesn't
    // support Zod v4's internal structure and silently returns {} for these schemas)
    const schema = z.toJSONSchema(zodSchema);
    return stripUnsupportedKeys(schema);
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `
You are an expert technical interviewer.

Generate ONLY valid JSON matching the provided schema.

Rules:
- Follow the schema exactly.
- technicalQuestions must contain objects with: question, intention, answer
- behavioralQuestions must contain objects with: question, intention, answer
- skillGaps must contain objects with: skill, severity
- preparationPlan must contain objects with: day, focus, tasks
- Do not replace objects with strings.
- matchScore must be a number between 0 and 100.
- Do not add % symbol.
- Do not add markdown.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: toGeminiSchema(interviewReportSchema)
        }
    });

    let text = response.text.trim();
    if (text.startsWith("```")) {
        text = text.replace(/```json|```/g, "").trim();
    }

    return JSON.parse(text);
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
    } });
    await browser.close();
    return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription, interviewReport }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume, which can be converted to PDF format using any library or tool that supports HTML to PDF conversion. The HTML should be well-structured, styled, and formatted to create a professional-looking resume document."),
    });

    const prompt = `Generate a professional resume in HTML format based on the provided resume, self-description, job description, and interview report. The HTML should be well-structured, styled, and formatted to create a visually appealing and professional-looking resume document. The resume should highlight the candidate's skills, experience, and achievements in a clear and concise manner.
                    Resume:${resume},
                    Self Description:${selfDescription},
                    Job Description:${jobDescription},
                    Interview Report:${JSON.stringify(interviewReport)}
                    the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF format using any library or tool that supports HTML to PDF conversion.
                    The resume should be tailored for the given job description and should highlight the candidate's skills, experience, and achievements in a clear and concise manner. The HTML should be well-structured, styled, and formatted to create a visually appealing and professional-looking resume document.
                    The content of theresume should not sound like it was generated by AI and should be as close as possible to a real human-written resume. The content should be unique and not copied from any existing resume or job description. The content should be relevant to the given job description and should highlight the candidate's skills, experience, and achievements in a clear and concise manner. The content should be free of any grammatical errors, spelling mistakes, or awkward phrasing. The content should be well-organized and easy to read, with clear headings, bullet points, and sections. The content should be tailored for the given job description and should highlight the candidate's skills, experience, and achievements in a clear and concise manner.
                    you can highlight the content of the resume using bold, italics, and underline. You can also use different font sizes, colors, and styles to make the resume visually appealing but the overall design should be simple and professional. The resume should be tailored for the given job description and should highlight the candidate's skills, experience, and achievements in a clear and concise manner.
                    the content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing any important information and any other issues. The content should be relevant to the given job description and should highlight the candidate's skills, experience, and achievements in a clear and concise manner. The content should be free of any grammatical errors, spelling mistakes, or awkward phrasing. The content should be well-organized and easy to read, with clear headings, bullet points, and sections. The content should be tailored for the given job description and should highlight the candidate's skills, experience, and achievements in a clear and concise manner.
                    The resume should not be so lengthy, it should ideally be only 1 page long and when converted to PDF. Focus on quality rather than quantity andmake sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description. The content should be relevant to the given job description and should highlight the candidate's skills, experience, and achievements in a clear and concise manner. The content should be free of any grammatical errors, spelling mistakes, or awkward phrasing. The content should be well-organized and easy to read, with clear headings, bullet points, and sections. The content should be tailored for the given job description and should highlight the candidate's skills, experience, and achievements in a clear and concise manner.
                    `;
                    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: toGeminiSchema(resumePdfSchema),
        }
    });

    let text = response.text.trim();
    if (text.startsWith("```")) {
        text = text.replace(/```json|```/g, "").trim();
    }

    const jsonContent = JSON.parse(text);

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

    return pdfBuffer;
}

module.exports = {
    generateInterviewReport,
    generateResumePdf
}