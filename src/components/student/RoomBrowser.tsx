import React, { useState, useEffect } from 'react';
import {
  Bed,
  Search,
  Filter,
  CheckCircle,
  Wind,
  Bath,
  Building2,
  Users,
  Layers,
  Sparkles,
} from 'lucide-react';
import { HostelRoom, HostelBlock, RoomType } from '../../types';
import { api } from '../../services/api';

interface RoomBrowserProps {
  onSelectRoomForChange?: (room: HostelRoom) => void;
  selectable?: boolean;
}

export const RoomBrowser: React.FC<RoomBrowserProps> = ({ onSelectRoomForChange, selectable = false }) => {
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [blocks, setBlocks] = useState<HostelBlock[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [acOnly, setAcOnly] = useState<boolean | ''>('');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const [roomsRes, blocksRes] = await Promise.all([
        api.getRooms({
          search,
          blockId: selectedBlock,
          roomType: selectedType,
          floor: selectedFloor,
          isAC: acOnly === '' ? undefined : acOnly,
          availableOnly: availableOnly ? 'true' : undefined,
        }),
        api.getBlocks(),
      ]);
      setRooms(roomsRes.rooms);
      setBlocks(blocksRes.blocks);
    } catch (err) {
      console.error('Failed to fetch room inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedBlock, selectedType, selectedFloor, acOnly, availableOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRooms();
  };

  const getRoomTypeLabel = (type: RoomType) => {
    switch (type) {
      case 'single':
        return 'Single Occupancy (1 Bed)';
      case 'double':
        return 'Double Sharing (2 Beds)';
      case 'triple':
        return 'Triple Sharing (3 Beds)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Live Bed Inventory System
          </div>
          <h2 className="text-2xl font-black tracking-tight">Hostel Rooms & Bed Availability</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time occupancy status across all campus residential blocks. Transparent capacity tracking with anti-overbooking safeguards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 px-4 border border-white/15 text-center">
            <p className="text-xs text-slate-300">Total Rooms</p>
            <p className="text-xl font-black text-white">{rooms.length}</p>
          </div>
          <div className="bg-teal-500/20 backdrop-blur-md rounded-2xl p-3 px-4 border border-teal-400/30 text-center">
            <p className="text-xs text-teal-200">Available Beds</p>
            <p className="text-xl font-black text-teal-300">
              {rooms.reduce((acc, r) => acc + (r.capacity - r.occupiedBeds), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Room Number (e.g. A-101, C-202) or Block..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-800 transition-all shrink-0"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Block Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Hostel Block</label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
            >
              <option value="">All Blocks</option>
              {blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Room Sharing</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
            >
              <option value="">All Types</option>
              <option value="single">Single (1 Bed)</option>
              <option value="double">Double (2 Beds)</option>
              <option value="triple">Triple (3 Beds)</option>
            </select>
          </div>

          {/* Floor */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Floor Level</label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
            >
              <option value="">All Floors</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
              <option value="4">4th Floor</option>
            </select>
          </div>

          {/* AC Preference */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Air Conditioning</label>
            <select
              value={acOnly === '' ? '' : acOnly ? 'true' : 'false'}
              onChange={(e) => setAcOnly(e.target.value === '' ? '' : e.target.value === 'true')}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800"
            >
              <option value="">AC & Non-AC</option>
              <option value="true">AC Rooms Only</option>
              <option value="false">Non-AC Only</option>
            </select>
          </div>

          {/* Available Vacancies toggle */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-300 w-full cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded-sm text-blue-900 focus:ring-blue-900"
              />
              <span className="text-[11px] font-bold text-slate-700">Vacant Beds Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500">Loading live room inventory...</div>
      ) : rooms.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <Bed className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No matching rooms found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => {
            const availableBeds = room.capacity - room.occupiedBeds;
            const isFull = availableBeds === 0;

            return (
              <div
                key={room.id}
                className={`rounded-2xl border bg-white p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isFull ? 'border-slate-200 opacity-90' : 'border-slate-300 hover:shadow-lg hover:border-blue-400'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-base font-black text-slate-950 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                        {room.roomNumber}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Floor {room.floor}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isFull
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isFull ? 'Fully Occupied' : `${availableBeds} Bed${availableBeds > 1 ? 's' : ''} Available`}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-800" />
                    {room.blockName}
                  </p>

                  <p className="text-xs text-slate-500 font-medium mb-3">
                    {getRoomTypeLabel(room.roomType)}
                  </p>

                  {/* Amenities Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {room.isAC && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                        <Wind className="w-3 h-3" /> AC
                      </span>
                    )}
                    {room.hasAttachedWashroom ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                        <Bath className="w-3 h-3" /> Attached Bath
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        Common Bath
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      ₹{room.monthlyFee}/mo
                    </span>
                  </div>

                  {/* Bed Breakdown Visualization */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2 mb-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Bed Assignments ({room.occupiedBeds}/{room.capacity})
                    </p>
                    <div className="space-y-1.5">
                      {room.beds.map((bed) => (
                        <div
                          key={bed.bedNumber}
                          className="flex items-center justify-between text-xs py-0.5"
                        >
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Bed
                              className={`w-3.5 h-3.5 ${
                                bed.isOccupied ? 'text-rose-500' : 'text-emerald-500'
                              }`}
                            />
                            Bed #{bed.bedNumber}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              bed.isOccupied ? 'text-slate-700' : 'text-emerald-700'
                            }`}
                          >
                            {bed.isOccupied ? bed.studentName || 'Occupied' : 'Vacant (Available)'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action if selectable for room change */}
                {selectable && onSelectRoomForChange && (
                  <button
                    disabled={isFull}
                    onClick={() => onSelectRoomForChange(room)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{isFull ? 'Room Full' : 'Select for Room Switch'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
