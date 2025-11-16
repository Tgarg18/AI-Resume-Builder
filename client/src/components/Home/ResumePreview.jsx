import { forwardRef } from "react";
import ModernTemplate from "../templates/ModernTemplate";
import ClassicTemplate from "../templates/ClassicTemplate";
import MinimalImageTemplate from "../templates/MinimalImageTemplate";
import MinimalTemplate from "../templates/MinimalTemplate";

const ResumePreview = forwardRef(({ data, template, accentColor, classes = "" }, ref) => {
  const renderTemplate = () => {
    switch (template) {
      case "modern":
        return <ModernTemplate data={data} accentColor={accentColor} />;

      case "minimal":
        return <MinimalTemplate data={data} accentColor={accentColor} />;

      case "minimal-image":
        return <MinimalImageTemplate data={data} accentColor={accentColor} />;

      default:
        return <ClassicTemplate data={data} accentColor={accentColor} />;
    }
  };

  return (
    <div className={`w-full ${classes}`}>
      <div
        id="resume-preview"
        ref={ref}
        className="mx-auto bg-white"
        style={{
          width: 794, // px — maps predictably to A4 at ~96dpi
          boxSizing: "border-box",
          padding: 24, // optional: tweak to match visual spacing
          boxShadow: "none", // ensure no shadows when captured
          border: "none",
          transform: "none",
        }}
      >
        {renderTemplate()}
      </div>

      {/* Minimal print styles — we don't rely on browser print; html2canvas captures on-screen */}
      <style jsx="true">{`
        /* Ensure fonts and layout don't shift during capture */
        #resume-preview {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Prevent outside page chrome from being visible if user prints directly */
        @media print {
          body * {
            visibility: hidden !important;
          }
          #resume-preview,
          #resume-preview * {
            visibility: visible !important;
          }
          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
});

export default ResumePreview;
