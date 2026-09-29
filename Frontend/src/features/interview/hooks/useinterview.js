import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api.js";
import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context.jsx";
import { useParams } from "react-router-dom";

export const useInterview = () => {
    const context = useContext(InterviewContext);
    const { interviewId } = useParams();

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context;

    const generateReport = async ({jobDescription, selfDescription, resumeFile}) => {
        setLoading(true);
        try {
            const response = await generateInterviewReport({jobDescription, selfDescription, resumeFile});
            setReport(response.interviewReport);
            return response.interviewReport;
        } catch (error) {
            console.error("Error generating interview report:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getReportById = async (interviewId) => {
        setLoading(true);
        try {
            const response = await getInterviewReportById(interviewId);
            setReport(response.interviewReport);
            return response.interviewReport;
        } catch (error) {
            console.error("Error fetching interview report by ID:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const getReports = async () => {
        setLoading(true);
        try {
            const response = await getAllInterviewReports();
            setReports(response.interviewReports);
            return response.interviewReports;
        } catch (error) {
            console.error("Error fetching interview reports:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getResumePdf = async (interviewReportId) => {
        setLoading(true);
        let response = null;
        try {
            response = await generateResumePdf(interviewReportId);
            const url = window.URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `resume_${interviewReportId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            return response; // This will be a Blob representing the PDF
        } catch (error) {
            console.error("Error generating resume PDF:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId);
        } else {
            getReports();
        }
    }, [interviewId]);

    return { loading, setLoading, report, setReport, reports, setReports, generateReport, getReportById, getReports, getResumePdf };
}