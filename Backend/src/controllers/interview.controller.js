const mongoose = require('mongoose');
const pdfParse = require('pdf-parse');
const { generateInterviewReport, generateResumePdf } = require('../services/ai.service');
const InterviewReportModel = require('../models/interviewReport.model');


/**
 * @desc Generate an interview report based on the provided resume, self-description, and job description.
 * @route POST /api/interview/
 * @access private
 */
async function generateInterviewReportController(req, res) {
    const resumeFile = req.file;
    const { selfDescription, jobDescription } = req.body;

    if (!jobDescription) {
        return res.status(400).json({ message: "Job description is required" });
    }

    if (!resumeFile && !selfDescription) {
        return res.status(400).json({ message: "Either a resume file or a self-description is required" });
    }

    let resumeContentText = "";
    if (resumeFile) {
        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(resumeFile.buffer))).getText();
        resumeContentText = resumeContent.text;
    }

    const interviewReportByAI = await generateInterviewReport({
        resume: resumeContentText,
        selfDescription,
        jobDescription
    });

    const interviewReport = await InterviewReportModel.create({
        ...interviewReportByAI,
        user: req.user.id,
        resume: resumeContentText,
        selfDescription,
        jobDescription
    });

    res.status(201).json({
        message: "Interview report generated successfully",
        interviewReport
    });

}

/**
 * @desc Get an interview report by its ID.
 * @route GET /api/interview/report/:interviewId
 * @access private
 */
async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params;
    if (!mongoose.isValidObjectId(interviewId)) {
        return res.status(400).json({ message: "Invalid report id" });
    }
    const interviewReport = await InterviewReportModel.findOne({ _id: interviewId, user: req.user.id });

    if (!interviewReport) {
        return res.status(404).json({ message: "Interview report not found" });
    }

    res.status(200).json({
        message: "Interview report fetched successfully",
        interviewReport
    });
}

/**
 * 
 */
async function getAllInterviewReportsController(req, res) {
     const interviewReports = await InterviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}

/**
 * @description Generate a PDF version of the resume based on the provided resume, self-description, job description, and interview report.
 * @route POST /api/interview/generate-resume-pdf
 * @access private
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params;
    if (!mongoose.isValidObjectId(interviewReportId)) {
        return res.status(400).json({ message: "Invalid report id" });
    }
    const interviewReport = await InterviewReportModel.findOne({ _id: interviewReportId, user: req.user.id });

    if (!interviewReport) {
        return res.status(404).json({ message: "Interview report not found" });
    }

    const { resume, selfDescription, jobDescription } = interviewReport;
    const pdfBuffer = await generateResumePdf({ resume, selfDescription, jobDescription, interviewReport });

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume_${interviewReportId}.pdf"`,
        'Content-Length': pdfBuffer.length
    })
    res.send(pdfBuffer);
}

module.exports = { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController };