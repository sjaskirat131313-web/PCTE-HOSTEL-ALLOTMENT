import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle,
  Building2,
  Bed,
  Phone,
  Shield,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { HostelBlock, HostelApplication, RoomType } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';

interface HostelApplicationWizardProps {
  onApplicationSubmitted?: () => void;
}

export const HostelApplicationWizard: React.FC<HostelApplicationWizardProps> = ({ onApplicationSubmitted }) => {
  const { user, profile, refreshUser } = useAuth();
  const [existingApp, setExistingApp] = useState<HostelApplication | null>(null);
  const [blocks, setBlocks] = useState<HostelBlock[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [preferredBlockId, setPreferredBlockId] = useState('');
  const [preferredRoomType, setPreferredRoomType] = useState<RoomType>('double');
  const [preferredFloor, setPreferredFloor] = useState<number>(1);
  const [isACPreferred, setIsACPreferred] = useState<boolean>(false);

  // Guardian details
  const [guardianName, setGuardianName] = useState(profile?.guardianName || '');
  const [guardianPhone, setGuardianPhone] = useState(profile?.guardianPhone || '');
  const [guardianRelation, setGuardianRelation] = useState(profile?.guardianRelation || 'Father');
  const [permanentAddress, setPermanentAddress] = useState(profile?.permanentAddress || '');
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || 'B+');
  const [medicalConditions, setMedicalConditions] = useState(profile?.medicalConditions || '');

  // Declarations
  const [declaredAntiRagging, setDeclaredAntiRagging] = useState(false);
  const [acceptedHostelRules, setAcceptedHostelRules] = useState(false);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const [appRes, blocksRes] = await Promise.all([api.getApplications(), api.getBlocks()]);
      if (appRes.applications.length > 0) {
        setExistingApp(appRes.applications[0]);
      }
      setBlocks(blocksRes.blocks);
      if (blocksRes.blocks.length > 0 && !preferredBlockId) {
        // Default to block matching gender if possible
        const matching = blocksRes.blocks.find((b) => b.gender === profile?.gender);
        setPreferredBlockId(matching ? matching.id : blocksRes.blocks[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, []);

  const handleNextStep = () => {
    setError(null);
    if (step === 2 && !preferredBlockId) {
      setError('Please choose a preferred hostel block.');
      return;
    }
    if (step === 3 && (!guardianName || !guardianPhone || !permanentAddress)) {
      setError('Please fill in parent name, emergency contact phone, and permanent address.');
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declaredAntiRagging || !acceptedHostelRules) {
      setError('You must accept both the Anti-Ragging undertaking and hostel rules declaration.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await api.submitApplication({
        preferredBlockId,
        preferredRoomType,
        preferredFloor,
        isACPreferred,
        guardianName,
        guardianPhone,
        guardianRelation,
        permanentAddress,
        bloodGroup,
        medicalConditions,
        declaredAntiRagging,
        acceptedHostelRules,
      });

      setExistingApp(res.application);
      await refreshUser();
      if (onApplicationSubmitted) onApplicationSubmitted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Checking application records...</div>;
  }

  // If student already has an active application, show the status timeline and details!
  if (existingApp) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Active College Hostel Application
              </div>
              <h2 className="text-2xl font-black">Application Ref: {existingApp.referenceNumber}</h2>
              <p className="text-xs text-slate-300 mt-1">
                Submitted on {new Date(existingApp.submittedAt).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <StatusBadge status={existingApp.status} size="lg" />
            </div>
          </div>
        </div>

        {/* Progress Step Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-extrabold text-slate-900">Application Lifecycle</h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-xs">1. Submitted</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Application logged in university ERP.
              </p>
            </div>

            {/* Step 2 */}
            <div
              className={`p-4 rounded-2xl border space-y-1 ${
                ['under_review', 'approved', 'waitlisted'].includes(existingApp.status)
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-xs">2. Warden Review</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Document and eligibility verification.
              </p>
            </div>

            {/* Step 3 */}
            <div
              className={`p-4 rounded-2xl border space-y-1 ${
                existingApp.status === 'approved'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : existingApp.status === 'rejected'
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : existingApp.status === 'waitlisted'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="font-bold text-xs">3. Decision</span>
              </div>
              <p className="text-[11px]">
                {existingApp.status === 'approved'
                  ? 'Approved by Chief Warden.'
                  : existingApp.status === 'rejected'
                  ? 'Declined by Administration.'
                  : existingApp.status === 'waitlisted'
                  ? 'On Priority Waitlist.'
                  : 'Pending Decision.'}
              </p>
            </div>

            {/* Step 4 */}
            <div
              className={`p-4 rounded-2xl border space-y-1 ${
                profile?.allottedRoomId
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5" />
                <span className="font-bold text-xs">4. Room Allotted</span>
              </div>
              <p className="text-[11px]">
                {profile?.allottedRoomId ? `Assigned to ${profile.allottedBlock}` : 'Awaiting bed allocation'}
              </p>
            </div>
          </div>

          {/* Review Remarks */}
          {existingApp.adminRemarks && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900">
              <span className="font-bold">Administrative Remarks: </span>
              <span>{existingApp.adminRemarks}</span>
              {existingApp.reviewedBy && (
                <span className="block mt-1 text-[11px] text-blue-700">
                  Reviewed by: {existingApp.reviewedBy}
                </span>
              )}
            </div>
          )}

          {/* Summary Details Table */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider mb-3">
              Application Details Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50">
                <p className="text-[11px] text-slate-400">Student Name & Roll</p>
                <p className="font-bold text-slate-800 mt-0.5">{existingApp.studentName} ({existingApp.studentRollNo})</p>
                <p className="text-[11px] text-slate-500">{existingApp.course} • {existingApp.academicYear}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50">
                <p className="text-[11px] text-slate-400">Hostel Preference</p>
                <p className="font-bold text-slate-800 mt-0.5 capitalize">
                  {existingApp.preferredRoomType} Sharing Room {existingApp.isACPreferred ? '(AC)' : '(Non-AC)'}
                </p>
                <p className="text-[11px] text-slate-500">Floor Preference: Floor {existingApp.preferredFloor || 1}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50">
                <p className="text-[11px] text-slate-400">Emergency Contact</p>
                <p className="font-bold text-slate-800 mt-0.5">{existingApp.guardianName} ({existingApp.guardianRelation})</p>
                <p className="text-[11px] text-slate-500">{existingApp.guardianPhone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student does not have active application -> Show Multi-Step Application Form
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
          <FileText className="w-3.5 h-3.5" />
          Academic Year 2025-2026 Admissions
        </div>
        <h2 className="text-2xl font-black">PCTE Hostel Accommodation Application</h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
          Complete the 4-step verified hostel application form to apply for residential quarters on campus.
        </p>

        {/* Wizard Steps Header */}
        <div className="flex items-center justify-between max-w-xl mt-6 pt-4 border-t border-slate-800 text-xs font-bold">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-teal-400' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">1</span>
            <span>Academic</span>
          </div>
          <div className="w-8 h-px bg-slate-700"></div>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-teal-400' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">2</span>
            <span>Preferences</span>
          </div>
          <div className="w-8 h-px bg-slate-700"></div>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-teal-400' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">3</span>
            <span>Emergency</span>
          </div>
          <div className="w-8 h-px bg-slate-700"></div>
          <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-teal-400' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">4</span>
            <span>Undertaking</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Academic & Profile Verification */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Step 1: Student & Academic Profile</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify your enrolled academic program records from student database.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Student Name</span>
                <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">College Roll Number</span>
                <p className="text-sm font-bold text-slate-900">{profile?.rollNumber || 'N/A'}</p>
                <p className="text-xs text-slate-500">Gender: {profile?.gender?.toUpperCase()}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Academic Degree</span>
                <p className="text-sm font-bold text-slate-900">{profile?.course || 'BCA'}</p>
                <p className="text-xs text-slate-500">Year: {profile?.academicYear} • Semester: {profile?.semester}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Phone & Contact</span>
                <p className="text-sm font-bold text-slate-900">{user?.phone || 'N/A'}</p>
                <p className="text-xs text-slate-500">Permanent Address: {profile?.permanentAddress}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-blue-900 text-white hover:bg-blue-800 flex items-center gap-2"
              >
                <span>Continue to Preferences</span>
                <ArrowRight className="w-4 h-4 text-teal-300" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Hostel Preferences */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Step 2: Room & Hostel Block Preferences</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your preferred residential block, sharing type, and climate control options.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Block Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Preferred Hostel Wing</label>
                <div className="space-y-2">
                  {blocks.map((block) => (
                    <label
                      key={block.id}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        preferredBlockId === block.id
                          ? 'border-blue-900 bg-blue-50/50 ring-1 ring-blue-900'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="preferredBlock"
                        value={block.id}
                        checked={preferredBlockId === block.id}
                        onChange={() => setPreferredBlockId(block.id)}
                        className="mt-1 text-blue-900"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{block.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{block.description}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          Curfew: {block.rulesOverview.split('.')[0]}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Room Sharing & AC Options */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Room Sharing Preference</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'single', label: 'Single', sub: '1 Bed' },
                      { type: 'double', label: 'Double', sub: '2 Beds' },
                      { type: 'triple', label: 'Triple', sub: '3 Beds' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.type}
                        onClick={() => setPreferredRoomType(item.type as RoomType)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          preferredRoomType === item.type
                            ? 'border-blue-900 bg-blue-900 text-white shadow-sm'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs font-bold">{item.label}</p>
                        <p className={`text-[10px] ${preferredRoomType === item.type ? 'text-teal-300' : 'text-slate-400'}`}>
                          {item.sub}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Floor Level</label>
                  <select
                    value={preferredFloor}
                    onChange={(e) => setPreferredFloor(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                  >
                    <option value={1}>1st Floor</option>
                    <option value={2}>2nd Floor</option>
                    <option value={3}>3rd Floor</option>
                    <option value={4}>4th Floor</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={isACPreferred}
                      onChange={(e) => setIsACPreferred(e.target.checked)}
                      className="rounded-sm text-blue-900 focus:ring-blue-900"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Air Conditioned (AC) Room Preference</p>
                      <p className="text-[11px] text-slate-500">Subject to AC wing availability and seasonal surcharge.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-blue-900 text-white hover:bg-blue-800 flex items-center gap-2"
              >
                <span>Continue to Emergency Contact</span>
                <ArrowRight className="w-4 h-4 text-teal-300" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Emergency Contact & Health */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Step 3: Emergency Contact & Medical Info</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Required university residential safety records and guardian authorization.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name</label>
                <input
                  type="text"
                  required
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="e.g. Sh. Rajesh Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relationship to Student</label>
                <select
                  value={guardianRelation}
                  onChange={(e) => setGuardianRelation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Local Guardian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Parent Emergency Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="+91 94170 12345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Home Address</label>
                <textarea
                  rows={2}
                  required
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  placeholder="Street, City, District, State, PIN"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Medical Conditions / Chronic Allergies (Optional)
                </label>
                <input
                  type="text"
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Asthma, Dust Allergy, None"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-blue-900 text-white hover:bg-blue-800 flex items-center gap-2"
              >
                <span>Continue to Undertakings</span>
                <ArrowRight className="w-4 h-4 text-teal-300" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Declarations & Submit */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Step 4: Student Undertaking & Code of Conduct</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review your application and accept mandatory university disciplinary declarations.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  required
                  checked={declaredAntiRagging}
                  onChange={(e) => setDeclaredAntiRagging(e.target.checked)}
                  className="mt-0.5 rounded-sm text-blue-900 focus:ring-blue-900"
                />
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Anti-Ragging Undertaking (UGC / AICTE Compliant): </span>
                  I hereby solemnly pledge that I will not indulge in or abet any ragging activities on or off the PCTE campus premises. I understand that violation will lead to immediate expulsion and police action.
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  required
                  checked={acceptedHostelRules}
                  onChange={(e) => setAcceptedHostelRules(e.target.checked)}
                  className="mt-0.5 rounded-sm text-blue-900 focus:ring-blue-900"
                />
                <div className="text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Hostel Rules & Curfew Adherence: </span>
                  I agree to abide by the official curfew timings, biometric attendance, quiet study hours, and warden instructions. No unauthorized guests or electrical heating appliances are permitted in student rooms.
                </div>
              </label>
            </div>

            {/* Application Overview Box */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-blue-950">Summary Before Submission:</p>
              <p>• Student: {user?.fullName} ({profile?.rollNumber})</p>
              <p>• Preference: {preferredRoomType.toUpperCase()} Sharing Room ({isACPreferred ? 'AC' : 'Non-AC'}) in {blocks.find(b => b.id === preferredBlockId)?.name || 'Selected Block'}</p>
              <p>• Emergency Contact: {guardianName} ({guardianPhone})</p>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 rounded-xl font-bold text-xs bg-linear-to-r from-blue-900 to-indigo-900 text-white hover:from-blue-800 hover:to-indigo-800 shadow-lg shadow-blue-950/20 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Generating Reference & Submitting...</span>
                ) : (
                  <>
                    <span>Submit Hostel Application</span>
                    <ArrowRight className="w-4 h-4 text-teal-300" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
