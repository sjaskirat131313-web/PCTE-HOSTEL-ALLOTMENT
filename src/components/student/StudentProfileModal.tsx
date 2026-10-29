import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Heart,
  Save,
  AlertCircle,
  CheckCircle2,
  Home,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfileState, refreshUser } = useAuth();

  const [phone, setPhone] = useState(user?.phone || '');
  const [guardianName, setGuardianName] = useState(profile?.guardianName || '');
  const [guardianPhone, setGuardianPhone] = useState(profile?.guardianPhone || '');
  const [guardianRelation, setGuardianRelation] = useState(profile?.guardianRelation || 'Father');
  const [permanentAddress, setPermanentAddress] = useState(profile?.permanentAddress || '');
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || 'B+');
  const [medicalConditions, setMedicalConditions] = useState(profile?.medicalConditions || '');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const res = await api.updateStudentProfile({
        guardianName,
        guardianPhone,
        guardianRelation,
        permanentAddress,
        bloodGroup,
        medicalConditions,
      });
      updateProfileState(res.profile);
      await refreshUser();
      setMessage({ type: 'success', text: 'Student profile details updated successfully.' });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Profile & Residential Records"
      subtitle="View enrolled student credentials and update emergency contacts"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Locked Academic Credentials */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Enrolled Academic Credentials (Locked)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              Verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 text-[10px]">Student Full Name</p>
              <p className="font-bold text-slate-800">{user?.fullName}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">Roll Number</p>
              <p className="font-mono font-bold text-slate-800">{profile?.rollNumber}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">Academic Degree</p>
              <p className="font-bold text-slate-800">{profile?.course}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">Academic Year & Sem</p>
              <p className="font-bold text-slate-800">
                {profile?.academicYear} (Sem {profile?.semester})
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">College Email</p>
              <p className="font-bold text-slate-800">{user?.email}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px]">Allotted Room</p>
              <p className="font-bold text-slate-800">
                {profile?.allottedBlock ? `${profile.allottedBlock} (Bed #${profile.allottedBedNumber})` : 'Not Allotted'}
              </p>
            </div>
          </div>
        </div>

        {/* Editable Contacts */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Emergency Contact & Guardian Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name</label>
              <input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Guardian Relation</label>
              <select
                value={guardianRelation}
                onChange={(e) => setGuardianRelation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Local Guardian</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
              <input
                type="tel"
                required
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Medical Notes / Allergies</label>
              <input
                type="text"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="e.g. None or Asthma"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
