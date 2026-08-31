import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Search,
  ArrowRight,
  UserCheck,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Clock,
  Edit3,
  Check,
  FileCheck,
  Save,
  HelpCircle,
  Info
} from "lucide-react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ThreeBackground from "../components/ThreeBackground";

const PAPER_TRACKS = [
  "Artificial Intelligence & Machine Learning",
  "Cloud Computing & DevOps",
  "Cybersecurity & Cryptography",
  "Web3, Blockchain & Decentralized Tech",
  "Internet of Things (IoT) & Robotics",
  "Data Science & Big Data Analytics",
  "Computer Vision & NLP",
  "Open Track / Emerging Technologies"
];

const GUIDELINES = [
  "Each participant/team will be given 10 minutes to present their paper.",
  "The presentation will be followed by a Q&A session with the judges.",
  "Participants should clearly explain the problem statement, proposed solution, methodology, results, and conclusion.",
  "Presentation slides should be clear, concise, and relevant to the submitted paper.",
  "Participants may upload or update their presentation slides before the submission deadline.",
  "The presentation should be delivered by the registered participant/team members."
];

export default function PaperSubmission() {
  const toast = useToast();
  const [searchParams] = useSearchParams();

  // Step flow: 'verify' -> 'form' -> 'success'
  const [step, setStep] = useState("verify");
  const [regIdInput, setRegIdInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null); // { eligible, reason, message, participant, team, submission }

  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(PAPER_TRACKS[0]);

  const [file, setFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [form, setForm] = useState({
    submissionId: "",
    registrationId: "",
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

  // Auto-verify if ?regId= is present in URL
  useEffect(() => {
    const urlRegId = searchParams.get("regId") || searchParams.get("id");
    if (urlRegId) {
      setRegIdInput(urlRegId.trim().toUpperCase());
      handleVerify(urlRegId.trim().toUpperCase());
    }
  }, [searchParams]);

  const handleVerify = async (idToVerify) => {
    const targetId = (idToVerify || regIdInput).trim();
    if (!targetId) {
      toast.error("Please enter your Registration ID");
      return;
    }

    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await api.get(`/submissions/verify/${encodeURIComponent(targetId)}`);
      const data = res.data;
      setVerifyResult(data);

      if (data.eligible && !data.alreadySubmitted) {
        setIsEditing(false);
        setExistingFileName("");
        setForm((prev) => ({
          ...prev,
          submissionId: "",
          registrationId: data.registrationId || targetId.toUpperCase(),
          name: data.participant?.name || "",
          email: data.participant?.email || "",
          mobile: data.participant?.mobile || "",
          college: data.participant?.college || "",
          department: data.participant?.department || "",
          year: data.participant?.year || "3rd Year",
          teamName: data.team?.teamName || "",
          teamCode: data.team?.teamCode || "",
          paperTitle: "",
          abstract: "",
          driveUrl: "",
        }));
        setStep("form");
        toast.success("Registration verified! You are eligible for Paper Presentation.");
      } else if (data.alreadySubmitted) {
        toast.info("A paper has already been submitted for this registration. You can view or update it.");
      }
    } catch (err) {
      const errData = err.response?.data;
      setVerifyResult(errData || {
        eligible: false,
        reason: "REGISTRATION_NOT_FOUND",
        message: "Registration ID not found. Please verify your Registration ID or register for the event."
      });
      toast.error(errData?.message || "Registration verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const startEditSubmission = () => {
    if (!verifyResult?.submission) return;
    const sub = verifyResult.submission;
    setIsEditing(true);
    setExistingFileName(sub.fileName || "");
    if (sub.topic && PAPER_TRACKS.includes(sub.topic)) {
      setSelectedTrack(sub.topic);
    }
    setForm({
      submissionId: sub._id || "",
      registrationId: sub.registrationId || verifyResult.registrationId || regIdInput.toUpperCase(),
      name: sub.name || verifyResult.participant?.name || "",
      email: sub.email || verifyResult.participant?.email || "",
      mobile: sub.mobile || verifyResult.participant?.mobile || "",
      college: sub.college || verifyResult.participant?.college || "",
      department: sub.department || verifyResult.participant?.department || "",
      year: sub.year || verifyResult.participant?.year || "3rd Year",
      teamName: sub.teamName || verifyResult.team?.teamName || "",
      teamCode: sub.teamCode || verifyResult.team?.teamCode || "",
      paperTitle: sub.paperTitle || sub.topic || "",
      abstract: sub.abstract || "",
      driveUrl: sub.driveUrl || "",
    });
    setStep("form");
    toast.info("Editing mode enabled. You can update your presentation details or replace slides.");
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10MB limit. Please upload a smaller file or provide a Drive link.");
        return;
      }
      setFile(selected);
      if (errors.submission) setErrors((prev) => ({ ...prev, submission: "" }));
    }
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Author / Submitter name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Valid email address is required";
    if (!form.college.trim()) err.college = "College name is required";
    if (!form.paperTitle.trim())
      err.paperTitle = "Paper topic / title is required";
    if (!form.abstract.trim()) {
      err.abstract = "Paper abstract / summary is required";
    } else {
      const words = form.abstract.trim().split(/\s+/).filter(Boolean);
      if (words.length < 40) {
        err.abstract = `Abstract must be at least 40 words (currently ${words.length} words)`;
      } else if (words.length > 150) {
        err.abstract = `Abstract must not exceed 150 words (currently ${words.length} words)`;
      }
    }
    // If not editing, either file or drive link is required. If editing and existing file or link is present, it's valid.
    if (!file && !form.driveUrl.trim() && !existingFileName) {
      err.submission =
        "Please attach a document file (PDF/PPT/DOCX) OR provide a Google Drive/cloud link";
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
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          formData.append(k, v);
        }
      });
      if (isEditing) {
        formData.append("isUpdate", "true");
      }
      if (selectedTrack) {
        formData.append("track", selectedTrack);
      }
      if (file) {
        formData.append("paper", file);
      }

      const res = await api.post("/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmittedData(res.data.data);
      setStep("success");
      toast.success(
        isEditing
          ? "Paper presentation updated successfully! A confirmation email has been dispatched."
          : "Paper submitted successfully! A confirmation email has been dispatched."
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Submission failed. Please check your details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // SUCCESS VIEW
  // ─────────────────────────────────────────────────────────────
  if (step === "success" && submittedData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-[#050505] selection:bg-red-500/30 selection:text-white relative overflow-hidden">
        <ThreeBackground />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg w-full relative z-10 card bg-black/70 border border-white/10 p-8 sm:p-10 backdrop-blur-2xl rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.25)]"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-red-500/10 border border-red-500/30 glow-red">
            <CheckCircle2 size={40} className="text-red-500" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/30 inline-flex items-center gap-1.5">
            <ShieldCheck size={13} />
            {isEditing ? "Submission Updated" : "Submission Confirmed"}
          </span>

          <h1 className="text-2xl sm:text-3xl font-display font-black text-white mt-4 mb-2 tracking-wide">
            {isEditing ? "Paper Updated Successfully!" : "Paper Submitted Successfully!"}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-light leading-relaxed mb-6">
            Your paper has been recorded under Registration ID{" "}
            <strong className="text-red-400 font-mono font-bold">
              {submittedData.registrationId || form.registrationId}
            </strong>
            . A confirmation email with presentation guidelines has been dispatched to{" "}
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
                  Team Designation
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
                <p className="text-gray-300 font-medium truncate">
                  {submittedData.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  Review Status
                </p>
                <p className="text-yellow-400 font-bold uppercase text-[10px] flex items-center gap-1">
                  <Clock size={11} /> Under Review
                </p>
              </div>
            </div>

            {submittedData.driveUrl && (
              <div className="pt-2 border-t border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">
                  Provided Drive Link
                </p>
                <a
                  href={submittedData.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 truncate font-mono"
                >
                  <ExternalLink size={13} className="flex-shrink-0" />
                  <span className="truncate">{submittedData.driveUrl}</span>
                </a>
              </div>
            )}
          </div>

          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-gray-300 text-left space-y-1.5 mb-6">
            <p className="font-bold text-red-400 uppercase tracking-wider text-[10px]">
              Presentation Schedule & Format
            </p>
            <p className="text-xs leading-relaxed text-gray-300">
              Each participant/team will be given <strong>10 minutes</strong> to present their paper, followed by a Q&A session with faculty judges.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2"
            >
              Back to Home
            </Link>
            <Link
              to="/events"
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              View All Events
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN PORTAL VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-500/30 selection:text-white relative overflow-hidden">
      <ThreeBackground />
      <div className="relative z-10">
        {/* Header */}
        <div className="relative border-b border-white/5 py-16 md:py-20">
          <div className="absolute inset-0 circuit-bg opacity-30"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              <span className="badge badge-technical mb-5">
                Paper Presentation • Technical Event
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-black mb-4 text-white tracking-tight">
                Paper <span className="text-gradient-red">Submission</span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base font-light max-w-2xl mx-auto">
                Submit and manage your research, slides, and abstract for TECH FEST '26.
                Only participants registered for the Paper Presentation event are eligible to submit and update papers.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          {/* STEP 1: VERIFICATION GATE */}
          {step === "verify" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Verification Card */}
              <div className="card bg-black/60 border border-white/10 hover:border-red-500/30 transition-all p-6 sm:p-10 rounded-3xl backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center glow-red flex-shrink-0">
                    <UserCheck size={24} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
                      Step 1: Verify Registration
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 font-light mt-0.5">
                      Enter the Registration ID you received upon registering for TECH FEST '26
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleVerify();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      TECH FEST Registration ID
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. TF26-ABCD12 or your Registered Email / Mobile"
                        value={regIdInput}
                        onChange={(e) => setRegIdInput(e.target.value.toUpperCase())}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono text-base tracking-wider"
                      />
                      <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={verifying || !regIdInput.trim()}
                    className="w-full btn-primary py-4 justify-center text-sm uppercase tracking-widest font-bold flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifying ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Verifying Registration...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Eligibility & Continue</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                {/* Verification Result Feedback: NOT ELIGIBLE */}
                {verifyResult && !verifyResult.eligible && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 p-5 rounded-2xl border ${
                      verifyResult.reason === "NOT_REGISTERED_FOR_EVENT"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                        : "bg-red-500/10 border-red-500/30 text-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {verifyResult.reason === "NOT_REGISTERED_FOR_EVENT" ? (
                        <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 text-sm">
                        <p className="font-bold mb-1 text-white">
                          {verifyResult.reason === "NOT_REGISTERED_FOR_EVENT"
                            ? "Not Registered for Paper Presentation"
                            : "Registration Not Found"}
                        </p>
                        <p className="text-xs leading-relaxed text-gray-300 mb-3">
                          {verifyResult.message}
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          <Link
                            to="/register?event=paper-presentation"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all"
                          >
                            <span>Register for Paper Presentation</span>
                            <ArrowRight size={13} />
                          </Link>
                          <Link
                            to="/events"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all"
                          >
                            <span>Explore All Events</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Already Submitted Feedback + UPDATE OPTION */}
                {verifyResult && verifyResult.alreadySubmitted && verifyResult.submission && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-left"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3">
                        <FileCheck size={22} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white text-sm">
                            Paper Presentation Already Submitted!
                          </p>
                          <p className="text-xs text-gray-300 mt-0.5">
                            You may edit your title, abstract, or re-upload new presentation slides before the deadline (04/09/2026).
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2.5 py-1 rounded-full flex-shrink-0">
                        {verifyResult.submission.status || 'Under Review'}
                      </span>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2 text-xs text-gray-300 mb-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-500 block">Paper Title</span>
                        <span className="font-bold text-white text-sm">{verifyResult.submission.paperTitle || verifyResult.submission.topic}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-500 block">Author / Submitter</span>
                          <span className="text-white font-medium">{verifyResult.submission.name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-500 block">Attached File / Link</span>
                          <span className="text-gray-300 truncate block">
                            {verifyResult.submission.fileName || verifyResult.submission.driveUrl || "Document Attached"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={startEditSubmission}
                        className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2"
                      >
                        <Edit3 size={15} />
                        <span>Edit / Update My Submission</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyResult(null);
                          setRegIdInput("");
                        }}
                        className="py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 font-bold uppercase tracking-wider text-xs transition-all"
                      >
                        Check Another ID
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
                  <p>Haven't registered for TECH FEST '26 yet?</p>
                  <Link
                    to="/register?event=paper-presentation"
                    className="text-red-400 hover:text-red-300 font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                  >
                    <span>Register for Event</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Event Guidelines Card List */}
              <div className="card bg-black/60 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                    <Info size={18} />
                  </div>
                  <h3 className="text-base font-display font-bold text-white">
                    Paper Presentation Guidelines &amp; Rules
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  {GUIDELINES.map((rule, idx) => (
                    <div
                      key={idx}
                      className="bg-white/5 border border-white/5 p-3.5 rounded-xl flex items-start gap-3 text-xs text-gray-300"
                    >
                      <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SUBMISSION FORM */}
          {step === "form" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Editing Mode Notice */}
              {isEditing && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-200">
                  <AlertTriangle size={22} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-white text-sm mb-0.5">
                      Editing Mode Active
                    </p>
                    <p className="text-amber-200/90 leading-relaxed">
                      You are updating your previously submitted paper. Saving your changes will overwrite your previous submission details and send an updated confirmation email.
                    </p>
                  </div>
                </div>
              )}

              {/* Verified Status Banner */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 glow-green">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        {isEditing ? "Updating Submission for" : "Verified Participant"}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono font-bold text-white">
                        {form.registrationId}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {form.name} • <span className="text-gray-300 font-light">{form.college}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep("verify");
                    setIsEditing(false);
                    setVerifyResult(null);
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <RotateCcw size={12} />
                  Change ID
                </button>
              </div>

              {/* Submission Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Track Selection */}
                <div className="card bg-black/60 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl">
                  <h3 className="text-base font-display font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 glow-red"></span>
                    Select Paper Domain / Track
                  </h3>
                  <p className="text-xs text-gray-400 font-light mb-5">
                    Choose the primary category that best aligns with your research topic
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAPER_TRACKS.map((track) => (
                      <button
                        key={track}
                        type="button"
                        onClick={() => setSelectedTrack(track)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all duration-300 flex items-center justify-between gap-2 ${
                          selectedTrack === track
                            ? "bg-red-500/20 text-white border-red-500/60 glow-red"
                            : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <span>{track}</span>
                        {selectedTrack === track && (
                          <Check size={14} className="text-red-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Paper Title & Abstract */}
                <div className="card bg-black/60 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl space-y-6">
                  <h3 className="text-base font-display font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 glow-red"></span>
                    Paper Title & Abstract
                  </h3>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Paper Title / Topic <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Next-Generation AI Architectures for Autonomous Systems"
                      value={form.paperTitle}
                      onChange={(e) => handleChange("paperTitle", e.target.value)}
                      className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all ${
                        errors.paperTitle
                          ? "border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      }`}
                    />
                    {errors.paperTitle && (
                      <p className="text-red-400 text-xs mt-1.5">{errors.paperTitle}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                        Paper Abstract / Summary <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-[11px] font-mono ${
                        form.abstract.trim() && (form.abstract.trim().split(/\s+/).filter(Boolean).length < 40 || form.abstract.trim().split(/\s+/).filter(Boolean).length > 150)
                          ? "text-red-400 font-bold"
                          : "text-gray-400"
                      }`}>
                        {form.abstract.trim() ? form.abstract.trim().split(/\s+/).filter(Boolean).length : 0} words (min 40, max 150 words)
                      </span>
                    </div>
                    <textarea
                      required
                      rows={6}
                      placeholder="Clearly explain the problem statement, proposed solution, methodology, results, and conclusion (min 40 words, max 150 words)..."
                      value={form.abstract}
                      onChange={(e) => handleChange("abstract", e.target.value)}
                      className={`w-full bg-white/5 border rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none transition-all text-sm leading-relaxed ${
                        errors.abstract
                          ? "border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      }`}
                    />
                    {errors.abstract && (
                      <p className="text-red-400 text-xs mt-1.5">{errors.abstract}</p>
                    )}
                  </div>
                </div>

                {/* 3. Document Upload / Drive Link */}
                <div className="card bg-black/60 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-xl space-y-6">
                  <div>
                    <h3 className="text-base font-display font-bold text-white mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 glow-red"></span>
                      Upload Presentation Document
                    </h3>
                    <p className="text-xs text-gray-400 font-light">
                      Attach your presentation slides (PPT/PDF/DOCX) or provide a shareable cloud link. You can re-upload or update anytime before the deadline.
                    </p>
                  </div>

                  {/* File Upload Box */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Option A: Direct File Upload (PDF, PPT, PPTX, DOCX - max 10MB)
                    </label>
                    <label className="border-2 border-dashed border-white/15 hover:border-red-500/50 bg-white/5 hover:bg-white/10 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-300 block relative">
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {file ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileCheck size={28} className="text-emerald-400 flex-shrink-0" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white">{file.name}</p>
                            <p className="text-xs text-gray-400 font-mono">
                              {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for upload
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setFile(null);
                            }}
                            className="ml-4 text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider"
                          >
                            Remove
                          </button>
                        </div>
                      ) : existingFileName ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileCheck size={28} className="text-blue-400 flex-shrink-0" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white">{existingFileName}</p>
                            <p className="text-xs text-gray-400">
                              Currently uploaded file. Click or drop new file to replace it.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-400">
                            <UploadCloud size={24} />
                          </div>
                          <p className="text-sm font-bold text-white">
                            Click to browse or drag and drop presentation file
                          </p>
                          <p className="text-xs text-gray-500">
                            Supports PDF, PPT, PPTX, DOCX up to 10MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Google Drive / Cloud Link Box */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Option B: Google Drive / Cloud Storage Link
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                        value={form.driveUrl}
                        onChange={(e) => handleChange("driveUrl", e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm font-mono"
                      />
                      <LinkIcon
                        size={16}
                        className="absolute left-3.5 top-3.5 text-gray-500"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1.5">
                      Ensure share settings are set to <strong>"Anyone with the link can view"</strong>
                    </p>
                  </div>

                  {errors.submission && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                      {errors.submission}
                    </div>
                  )}
                </div>

                {/* 4. Submitter Profile Preview */}
                <div className="card bg-black/60 border border-white/10 p-6 rounded-3xl backdrop-blur-xl space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <UserCheck size={14} className="text-red-400" />
                    Author & Institution Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">Author Name</span>
                      <span className="font-bold text-white">{form.name}</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">Email</span>
                      <span className="font-mono text-gray-300 truncate block">{form.email}</span>
                    </div>
                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block mb-0.5">College</span>
                      <span className="text-gray-300 truncate block">{form.college}</span>
                    </div>
                  </div>

                  {form.teamName && (
                    <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-xs flex items-center gap-2 text-red-300">
                      <Users size={14} className="text-red-400 flex-shrink-0" />
                      <span>
                        Submitting on behalf of Team: <strong className="text-white">{form.teamName}</strong> {form.teamCode ? `(${form.teamCode})` : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-4 justify-center text-sm uppercase tracking-widest font-bold flex items-center gap-3 rounded-xl transition-all disabled:opacity-50 ${
                      isEditing
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                        : "btn-primary shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Processing &amp; Uploading Submission...</span>
                      </>
                    ) : isEditing ? (
                      <>
                        <Save size={18} />
                        <span>Update Paper Presentation</span>
                        <ArrowRight size={18} />
                      </>
                    ) : (
                      <>
                        <FileText size={18} />
                        <span>Submit Paper Presentation</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Assistance & Official Queries:{" "}
                      <a
                        href="mailto:techfest.official2026@gmail.com"
                        className="text-red-400 hover:underline font-mono"
                      >
                        techfest.official2026@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
