import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Bed,
  Mail,
  Phone,
  GraduationCap,
  CheckCircle,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.getAllStudents();
      setStudents(res.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesStatus = filterStatus === 'all' || s.allotmentStatus === filterStatus;
    const term = search.toLowerCase();
    const matchesSearch =
      s.fullName.toLowerCase().includes(term) ||
      s.rollNumber.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.course.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            Student Master Directory
          </div>
          <h2 className="text-2xl font-black">Registered Students & Residential Profiles</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Complete student database enrolled in campus hostel residential system.
          </p>
        </div>

        <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/15 text-xs text-slate-200">
          Total Students: <strong className="text-teal-300">{students.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 w-full sm:w-48"
          >
            <option value="all">All Students ({students.length})</option>
            <option value="allotted">Allotted ({students.filter((s) => s.allotmentStatus === 'allotted').length})</option>
            <option value="applied">Applied / Pending ({students.filter((s) => s.allotmentStatus === 'applied').length})</option>
            <option value="not_applied">Not Applied ({students.filter((s) => s.allotmentStatus === 'not_applied').length})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading student directory...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No students found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-extrabold">
                <tr>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Roll Number</th>
                  <th className="px-5 py-3.5">Course & Year</th>
                  <th className="px-5 py-3.5">Contact Details</th>
                  <th className="px-5 py-3.5">Gender</th>
                  <th className="px-5 py-3.5">Hostel Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.userId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">{student.fullName}</td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-800">{student.rollNumber}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{student.course}</p>
                      <p className="text-[11px] text-slate-400">{student.academicYear}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-slate-800">{student.email}</p>
                      <p className="text-[11px] text-slate-400">{student.phone}</p>
                    </td>
                    <td className="px-5 py-4 capitalize font-medium text-slate-700">{student.gender}</td>
                    <td className="px-5 py-4">
                      {student.allottedBlock ? (
                        <div>
                          <StatusBadge status="allotted" size="sm" />
                          <p className="text-[10px] text-slate-500 mt-0.5 font-bold">
                            {student.allottedBlock} (Bed #{student.allottedBedNumber})
                          </p>
                        </div>
                      ) : (
                        <StatusBadge status={student.allotmentStatus} size="sm" />
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setDetailsModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Student Profile: ${selectedStudent.fullName}`}
          subtitle={`Roll No: ${selectedStudent.rollNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Course</span>
                  <p className="font-bold text-slate-800">{selectedStudent.course}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Academic Year</span>
                  <p className="font-bold text-slate-800">{selectedStudent.academicYear}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Email</span>
                  <p className="font-bold text-slate-800">{selectedStudent.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Phone</span>
                  <p className="font-bold text-slate-800">{selectedStudent.phone}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-1">
              <span className="text-[10px] font-bold text-blue-900 uppercase">Parent / Emergency Guardian</span>
              <p className="font-bold text-slate-900">{selectedStudent.guardianName || 'Parent'}</p>
              <p className="text-slate-600">Contact: {selectedStudent.guardianPhone || selectedStudent.phone}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Allotment Status</span>
              <p className="font-bold text-slate-900">
                {selectedStudent.allottedBlock
                  ? `${selectedStudent.allottedBlock} (Bed #${selectedStudent.allottedBedNumber})`
                  : 'No active room assigned'}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
