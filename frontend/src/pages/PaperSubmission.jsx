import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  CheckCircle2,
  UploadCloud,
  Link as LinkIcon,
  Users,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Mail,
  Check,
} from "lucide-react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ThreeBackground from "../components/ThreeBackground";

const OFFICIAL_DRIVE_URL =
  "https://drive.google.com/drive/folders/14Gj5s7asChOCzOuOoHwU05oFxZaxgi-k";

export default function PaperSubmission() {
  const toast = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    college: "",
    department: "",
    year: "3rd Year",
    teamName: "",
    teamCode: "",
    paperTitle: "",
    abstract: "",
    driveUrl: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Author / Submitter name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Valid email address is required";
    if (!form.mobile.trim() || !/^[6-9]\d{9}$/.test(form.mobile))
      err.mobile = "Valid 10-digit mobile number is required";
    if (!form.college.trim()) err.college = "College name is required";
    if (!form.paperTitle.trim())
      err.paperTitle = "Paper topic / title is required";
    if (!form.abstract.trim() || form.abstract.trim().length < 100) {
      err.abstract = "Abstract must be at least 100 characters";
    }
    if (!file && !form.driveUrl.trim()) {
      err.submission =
        "Please attach a document file OR provide a Google Drive link";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please complete all required fields properly.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          formData.append(k, v);
        }
      });
      if (file) {
        formData.append("paper", file);
      }

      const res = await api.post("/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmittedData(res.data.data);
      setSubmitted(true);
      toast.success(
        "Paper submitted successfully! A confirmation email has been sent.",
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Submission failed. Please check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted && submittedData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-[#050505] relative overflow-hidden">
        <ThreeBackground />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg w-full relative z-10 card bg-black/70 border border-white/10 p-8 sm:p-10 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.2)]"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-red-500/10 border border-red-500/30 glow-red">
            <CheckCircle2 size={40} className="text-red-500" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
            Submission Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-display font-black text-white mt-3 mb-2 tracking-wide">
            Paper Submitted Successfully!
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-light leading-relaxed mb-6">
            Your paper has been recorded. A confirmation email with full details
            has been sent to{" "}
            <strong className="text-white font-mono">
              {submittedData.email}
            </strong>
            .
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3 mb-6">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                Paper Topic / Title
              </p>
              <p className="text-white font-bold text-sm mt-0.5">
                {submittedData.paperTitle || submittedData.topic}
              </p>
            </div>
            {submittedData.teamName && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  Team Name
                </p>
                <p className="text-red-400 font-bold text-xs mt-0.5">
                  {submittedData.teamName}{" "}
                  {submittedData.teamCode ? `(${submittedData.teamCode})` : ""}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5 text-xs">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  Author
                </p>
                <p className="text-gray-300 font-medium">
                  {submittedData.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  Status
                </p>
                <p className="text-yellow-400 font-bold uppercase text-[10px]">
                  Under Review
                </p>
              </div>
            </div>
            {submittedData.driveUrl && (
              <div className="pt-2 border-t border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                  Google Drive Link
                </p>
                <a
                  href={submittedData.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 truncate"
                >
                  <ExternalLink size={13} />
                  <span className="truncate">{submittedData.driveUrl}</span>
                </a>
              </div>
            )}
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-gray-300 text-left space-y-1 mb-6">
            <p className="font-bold text-red-400 uppercase tracking-wider text-[10px]">
              What happens next?
            </p>
            <p className="text-xs leading-relaxed text-gray-300">
              A maximum of <strong>7 shortlisted teams</strong> will present
              their paper before the judging panel on event day. You will
              receive shortlisting notifications via email.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/"
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2"
            >
              Back to Home
            </a>
            <a
              href={OFFICIAL_DRIVE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink size={14} /> Official Drive
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white relative overflow-hidden">
      <ThreeBackground />
      <div className="relative z-10">
        {/* Header */}
        <div className="relative border-b border-white/5 py-20 md:py-24">
          <div className="absolute inset-0 circuit-bg opacity-30"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="badge badge-technical mb-5">
                Paper Presentation • Technical Event
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-black mb-4 text-white">
                Paper <span className="text-gradient-red">Submission</span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base font-light max-w-2xl mx-auto mb-6">
                Submit your research, technical ideas, and innovative solutions
                for TECH FEST '26. Any team member can upload on behalf of the
                team.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3.5 py-1.5 bg-white/5 rounded-lg border border-white/10">
                  Team Size:{" "}
                  <strong className="text-white">1 - 3 Members</strong>
                </span>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider px-3.5 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20 glow-red">
                  Deadline: <strong className="text-white">04/09/2026</strong>
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none"></div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8 relative z-10"
            noValidate
          >
            {/* Team Information */}
            <div className="card bg-black/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl rounded-2xl relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 glow-red"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <h2 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-3 text-white">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 glow-red">
                    <Users size={18} />
                  </div>
                  Team Information
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-white/5 px-3 py-1 rounded-md border border-white/10">
                  1 Paper per Team
                </span>
              </div>

              <div className="rounded-xl px-4 py-3 mb-6 bg-red-500/5 border border-red-500/20 flex items-start gap-2.5">
                <AlertCircle
                  size={16}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <p className="text-xs text-gray-300 font-light leading-relaxed">
                  <strong className="text-white">Note:</strong> Any member of
                  your registered team can submit this paper. Once submitted,
                  duplicate submissions from the same team or email will be
                  restricted.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Team Name (Optional for individual, Required for teams)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm font-medium"
                    placeholder="e.g. Quantum Pioneers"
                    value={form.teamName}
                    onChange={(e) => handleChange("teamName", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Team Code (If already registered)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all font-mono uppercase text-sm"
                    placeholder="e.g. RE3KSO"
                    value={form.teamCode}
                    onChange={(e) => handleChange("teamCode", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Author / Submitter Details */}
            <div className="card bg-black/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl rounded-2xl">
              <h2 className="text-xl sm:text-2xl font-display font-bold mb-6 flex items-center gap-3 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 glow-red"></span>
                Author / Submitter Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Author / Submitter Full Name *
                  </label>
                  <input
                    type="text"
                    className={`w-full bg-white/5 border ${errors.name ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-red-500"} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm`}
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className={`w-full bg-white/5 border ${errors.email ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-red-500"} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm`}
                    placeholder="yourname@gmail.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    className={`w-full bg-white/5 border ${errors.mobile ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-red-500"} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm font-mono`}
                    placeholder="10-digit mobile number"
                    value={form.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                  />
                  {errors.mobile && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">
                      {errors.mobile}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    College Name *
                  </label>
                  <input
                    type="text"
                    className={`w-full bg-white/5 border ${errors.college ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-red-500"} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm`}
                    placeholder="Enter your college name"
                    value={form.college}
                    onChange={(e) => handleChange("college", e.target.value)}
                  />
                  {errors.college && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">
                      {errors.college}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 focus:border-red-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm"
                    placeholder="e.g. Computer Science and Engineering"
                    value={form.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Year of Study
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/10 focus:border-red-500 rounded-xl px-4 py-3 text-white focus:outline-none transition-all text-sm appearance-none bg-black"
                    value={form.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Paper Details */}
            <div className="card bg-black/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl rounded-2xl relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 glow-red"></div>

              <h2 className="text-xl sm:text-2xl font-display font-bold mb-6 flex items-center gap-3 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 glow-red"></span>
                Paper Topic & Abstract
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Paper Topic / Title *
                  </label>
                  <input
                    type="text"
                    className={`w-full bg-white/5 border ${errors.paperTitle ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-red-500"} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm font-medium`}
                    placeholder="e.g. Autonomous Drone Navigation Using Computer Vision & Edge AI"
                    value={form.paperTitle}
                    onChange={(e) => handleChange("paperTitle", e.target.value)}
                  />
                  {errors.paperTitle && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">
                      {errors.paperTitle}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Abstract *
                    </label>
                    <span
                      className={`text-[10px] font-mono font-bold ${form.abstract.length < 100 ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {form.abstract.length} / 100 min characters
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    className={`w-full bg-white/5 border ${errors.abstract ? "border-red-500 focus:border-red-500" : "border-white/10 focus:border-red-500"} rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all resize-none text-sm font-light leading-relaxed`}
                    placeholder="Write a clear and comprehensive abstract describing your research, methodology, key findings, and practical applications..."
                    value={form.abstract}
                    onChange={(e) => handleChange("abstract", e.target.value)}
                  />
                  {errors.abstract && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">
                      {errors.abstract}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submission Upload / Drive Link */}
            <div className="card bg-black/60 border border-white/10 p-6 sm:p-8 backdrop-blur-xl rounded-2xl">
              <h2 className="text-xl sm:text-2xl font-display font-bold mb-3 flex items-center gap-3 text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 glow-red"></span>
                Paper File / Google Drive Link
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                You can upload your paper file (PDF/DOCX) or provide a Google
                Drive link (or both).
              </p>

              {errors.submission && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-bold flex items-center gap-2">
                  <AlertCircle size={15} /> {errors.submission}
                </div>
              )}

              <div className="space-y-6">
                {/* Google Drive Link Input */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                      <LinkIcon size={14} className="text-red-500" />
                      Google Drive Link (Recommended)
                    </label>
                    <a
                      href={OFFICIAL_DRIVE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink size={12} /> Open Official Google Drive
                      Folder
                    </a>
                  </div>
                  <input
                    type="url"
                    className="w-full bg-black/60 border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm font-mono"
                    placeholder="https://drive.google.com/file/d/... or folder link"
                    value={form.driveUrl}
                    onChange={(e) => handleChange("driveUrl", e.target.value)}
                  />
                  <p className="text-[10px] text-gray-500 mt-2">
                    💡 Please ensure link access is set to{" "}
                    <strong className="text-gray-300">
                      "Anyone with the link can view"
                    </strong>
                    .
                  </p>
                </div>

                {/* File Attachment */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Upload Document File</span>
                    <span className="text-gray-500">
                      PDF / DOC / DOCX (Max 15MB)
                    </span>
                  </label>
                  <label className="flex flex-col items-center justify-center border border-dashed border-white/20 bg-white/5 rounded-2xl p-8 cursor-pointer hover:border-red-500/50 hover:bg-red-500/5 transition-all group">
                    <div className="w-14 h-14 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center mb-3 group-hover:border-red-500/50 group-hover:bg-red-500/10 transition-colors">
                      <UploadCloud
                        size={28}
                        className="text-gray-400 group-hover:text-red-500 transition-colors"
                      />
                    </div>
                    <p className="text-sm font-bold text-white mb-1">
                      {file ? file.name : "Choose PDF/Word File to Upload"}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      {file
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB Attached`
                        : "Click to browse or drag & drop file"}
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setFile(e.target.files[0]);
                          if (errors.submission)
                            setErrors((err) => ({ ...err, submission: "" }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-2xl p-[1px] disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-[0.99]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></span>
              <div className="relative bg-black px-8 py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-black/30">
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="text-white font-bold tracking-wider uppercase">
                      Submitting Paper...
                    </span>
                  </>
                ) : (
                  <>
                    <FileText size={20} className="text-white" />
                    <span className="text-white font-bold tracking-wider uppercase text-base">
                      Submit Paper Presentation
                    </span>
                  </>
                )}
              </div>
            </button>

            {/* Alternative Email Footer */}
            <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                Assistance & Queries:{" "}
                <a
                  href="mailto:techfest.official2026@gmail.com"
                  className="text-red-400 hover:text-red-300 hover:underline transition-colors ml-1 font-mono"
                >
                  techfest.official2026@gmail.com
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
