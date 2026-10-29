import React, { useState, useEffect } from 'react';
import {
  Bed,
  Search,
  Plus,
  Filter,
  Building2,
  Wind,
  Bath,
  Users,
  AlertCircle,
  CheckCircle,
  Download,
  Wrench,
  X,
} from 'lucide-react';
import { HostelRoom, HostelBlock, RoomType, RoomGender } from '../../types';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';

export const AdminRooms: React.FC = () => {
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [blocks, setBlocks] = useState<HostelBlock[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [occupantsModalOpen, setOccupantsModalOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<HostelRoom | null>(null);

  // Add Room Form
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newBlockId, setNewBlockId] = useState('');
  const [newFloor, setNewFloor] = useState(1);
  const [newRoomType, setNewRoomType] = useState<RoomType>('double');
  const [newGender, setNewGender] = useState<RoomGender>('male');
  const [newIsAC, setNewIsAC] = useState(false);
  const [newAttachedWashroom, setNewAttachedWashroom] = useState(true);
  const [newMonthlyFee, setNewMonthlyFee] = useState(5500);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, blocksRes] = await Promise.all([api.getRooms(), api.getBlocks()]);
      setRooms(roomsRes.rooms);
      setBlocks(blocksRes.blocks);
      if (blocksRes.blocks.length > 0 && !newBlockId) {
        setNewBlockId(blocksRes.blocks[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.blockName.toLowerCase().includes(search.toLowerCase());
    const matchesBlock = !selectedBlock || r.blockId === selectedBlock;
    const matchesType = !selectedType || r.roomType === selectedType;
    const matchesStatus = !selectedStatus || r.status === selectedStatus;
    return matchesSearch && matchesBlock && matchesType && matchesStatus;
  });

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await api.createRoom({
        roomNumber: newRoomNumber,
        blockId: newBlockId,
        floor: newFloor,
        roomType: newRoomType,
        gender: newGender,
        isAC: newIsAC,
        hasAttachedWashroom: newAttachedWashroom,
        monthlyFee: newMonthlyFee,
        amenities: ['Ceiling Fan', 'Study Desk', 'Wardrobe', newIsAC ? 'Air Conditioner' : 'Air Cooler'],
      });

      setAddModalOpen(false);
      setNewRoomNumber('');
      await fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create room.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMaintenance = async (room: HostelRoom) => {
    const nextStatus = room.status === 'active' ? 'maintenance' : 'active';
    if (!confirm(`Switch Room ${room.roomNumber} to ${nextStatus.toUpperCase()} mode?`)) return;
    try {
      await api.updateRoom(room.id, { status: nextStatus });
      await fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
            <Bed className="w-3.5 h-3.5" />
            Hostel Residential Inventory
          </div>
          <h2 className="text-2xl font-black">Room Inventory & Capacity Management</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Maintain room capacities, bed allocations, amenities, and floor allocations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setError(null);
              setAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-400 text-slate-950 hover:bg-teal-300 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Room</span>
          </button>
          <a
            href={api.getExportCsvUrl('rooms')}
            download
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-blue-900" />
            <span>Rooms CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search room number..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 w-full sm:w-auto text-xs">
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
          >
            <option value="">All Blocks</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
          >
            <option value="">All Types</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading rooms...</div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-12 text-center">
            <Bed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No rooms found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting filter parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[10px] font-extrabold">
                <tr>
                  <th className="px-5 py-3.5">Room Number</th>
                  <th className="px-5 py-3.5">Hostel Block</th>
                  <th className="px-5 py-3.5">Floor</th>
                  <th className="px-5 py-3.5">Type & Gender</th>
                  <th className="px-5 py-3.5">Occupancy</th>
                  <th className="px-5 py-3.5">Climate / Bath</th>
                  <th className="px-5 py-3.5">Fee</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRooms.map((room) => {
                  const availableBeds = room.capacity - room.occupiedBeds;
                  return (
                    <tr key={room.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 text-sm">{room.roomNumber}</td>
                      <td className="px-5 py-4 font-bold text-slate-800">{room.blockName}</td>
                      <td className="px-5 py-4 text-slate-600">Floor {room.floor}</td>
                      <td className="px-5 py-4">
                        <span className="capitalize font-semibold text-slate-800">{room.roomType}</span>
                        <span className="block text-[11px] text-slate-400 capitalize">{room.gender} Wing</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900">
                          {room.occupiedBeds} / {room.capacity} Beds
                        </span>
                        <span
                          className={`block text-[10px] font-semibold ${
                            availableBeds > 0 ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {availableBeds > 0 ? `${availableBeds} Vacant` : 'Full'}
                        </span>
                      </td>
                      <td className="px-5 py-4 space-y-0.5">
                        <span className="text-[11px] font-medium text-slate-700 block">
                          {room.isAC ? 'AC Room' : 'Non-AC'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {room.hasAttachedWashroom ? 'Attached Bath' : 'Common Bath'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">₹{room.monthlyFee}/mo</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            room.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {room.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setActiveRoom(room);
                            setOccupantsModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                        >
                          Occupants ({room.occupiedBeds})
                        </button>
                        <button
                          onClick={() => handleToggleMaintenance(room)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          title="Toggle Maintenance Mode"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Hostel Room"
        subtitle="Provision a new room to residential block inventory"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRoom} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                required
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                placeholder="e.g. A-305"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hostel Block</label>
              <select
                value={newBlockId}
                onChange={(e) => setNewBlockId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
              >
                {blocks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Floor Level</label>
              <input
                type="number"
                min={0}
                max={5}
                required
                value={newFloor}
                onChange={(e) => setNewFloor(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Sharing Type</label>
              <select
                value={newRoomType}
                onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
              >
                <option value="single">Single (1 Bed)</option>
                <option value="double">Double (2 Beds)</option>
                <option value="triple">Triple (3 Beds)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender Wing</label>
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value as RoomGender)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
              >
                <option value="male">Boys Wing</option>
                <option value="female">Girls Wing</option>
                <option value="any">Any</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Hostel Fee (₹)</label>
              <input
                type="number"
                step={100}
                required
                value={newMonthlyFee}
                onChange={(e) => setNewMonthlyFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newIsAC}
                onChange={(e) => setNewIsAC(e.target.checked)}
                className="rounded-sm text-blue-900"
              />
              <span>Air Conditioned (Split AC installed)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newAttachedWashroom}
                onChange={(e) => setNewAttachedWashroom(e.target.checked)}
                className="rounded-sm text-blue-900"
              />
              <span>Ensuite Attached Washroom</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Occupants Modal */}
      {activeRoom && (
        <Modal
          isOpen={occupantsModalOpen}
          onClose={() => setOccupantsModalOpen(false)}
          title={`Room ${activeRoom.roomNumber} - Bed Occupancy`}
          subtitle={`${activeRoom.blockName} • Floor ${activeRoom.floor}`}
          maxWidth="md"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
              <span className="text-slate-500">Capacity: {activeRoom.capacity} Beds</span>
              <span className="font-bold text-slate-900">
                {activeRoom.occupiedBeds} Occupied / {activeRoom.capacity - activeRoom.occupiedBeds} Vacant
              </span>
            </div>

            <div className="space-y-2">
              {activeRoom.beds.map((bed) => (
                <div
                  key={bed.bedNumber}
                  className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                    bed.isOccupied ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50/50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bed
                      className={`w-4 h-4 ${bed.isOccupied ? 'text-blue-900' : 'text-emerald-600'}`}
                    />
                    <div>
                      <p className="font-bold text-slate-900">Bed #{bed.bedNumber}</p>
                      {bed.isOccupied ? (
                        <p className="text-[11px] text-slate-500">
                          {bed.studentName} (Roll: {bed.studentRollNo || 'N/A'})
                        </p>
                      ) : (
                        <p className="text-[11px] text-emerald-700 italic">Available for allotment</p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      bed.isOccupied ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {bed.isOccupied ? 'Occupied' : 'Vacant'}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setOccupantsModalOpen(false)}
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
