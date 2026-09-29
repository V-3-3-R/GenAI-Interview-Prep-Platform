const { Router } = require('express')
const interviewController = require("../controllers/interview.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const { upload } = require("../middlewares/file.middleware")

const interviewRouter = Router()

/**
 * @route POST /api/interview/
 * @description Generate an interview report based on resume, self-description, and job description
 * @access private
 */
interviewRouter.post(
    "/",
    authMiddleware.authUser,
    upload.single("resume"),
    interviewController.generateInterviewReportController
)

/**
 * @route GET /api/interview/all
 * @description Get all interview reports for the logged in user
 * @access private
 */
interviewRouter.get(
    "/all",
    authMiddleware.authUser,
    interviewController.getAllInterviewReportsController
)

/**
 * @route GET /api/interview/report/:interviewId
 * @description Get an interview report by its ID
 * @access private
 */
interviewRouter.get(
    "/report/:interviewId",
    authMiddleware.authUser,
    interviewController.getInterviewReportByIdController
)

/**
 * @route GET /api/interview/generate-resume-pdf/:interviewReportId
 * @description Generate a tailored resume PDF for a given interview report
 * @access private
 */
interviewRouter.get(
    "/generate-resume-pdf/:interviewReportId",
    authMiddleware.authUser,
    interviewController.generateResumePdfController
)

module.exports = interviewRouter
