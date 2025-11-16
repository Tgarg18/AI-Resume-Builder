import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ResumePreview from "../components/Home/ResumePreview";
import Loader from "../components/Loader";
import { ArrowLeftIcon } from "lucide-react";
import api from "../configs/api";

const Preview = () => {
  const { resumeId } = useParams();
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadResume = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/api/resumes/get/${resumeId}`);

      if (response.data?.resume) {
        setResumeData(response.data.resume);
      } else {
        setError("Resume Not Found");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Resume Not Found");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
  }, []);

  // ✅ Show loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  // ✅ Show error if not found
  if (error || !resumeData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-100">
        <p className="text-center text-6xl text-slate-400 mb-6">
          {error || "Resume Not Found"}
        </p>
        <Link
          to="/"
          className="mt-6 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 h-9 m-1 ring-offset-1 ring-1 ring-green-400 flex items-center transition-colors"
        >
          <ArrowLeftIcon className="mr-2 size-4" />
          Go to Home Page
        </Link>
      </div>
    );
  }

  // ✅ Show preview when found
  return (
    <div className="bg-slate-100">
      <div className="max-w-3xl mx-auto py-10">
        <ResumePreview
          data={resumeData}
          template={resumeData.template}
          accentColor={resumeData.accent_color}
          classes="py-4 bg-white"
        />
      </div>
    </div>
  );
};

export default Preview;
