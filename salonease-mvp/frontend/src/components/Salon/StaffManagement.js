import React, { useState, useEffect } from 'react';
import { staffApi } from '../../utils/api';
import { useSalonContext } from '../../contexts/SalonContext';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStaff, setNewStaff] = useState({ email: '', fullName: '', role: '' });
  const { selectedSalon } = useSalonContext();

  useEffect(() => {
    if (selectedSalon) {
      fetchStaff();
    }
  }, [selectedSalon]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getStaff(selectedSalon.id);
      setStaff(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch staff');
      setLoading(false);
    }
  };

  const handleInviteStaff = async (e) => {
    e.preventDefault();
    try {
      await staffApi.inviteStaff(selectedSalon.id, newStaff);
      setNewStaff({ email: '', fullName: '', role: '' });
      fetchStaff();
    } catch (err) {
      setError('Failed to invite staff');
    }
  };

  const handleUpdateStaff = async (staffId, updatedData) => {
    try {
      await staffApi.updateStaff(selectedSalon.id, staffId, updatedData);
      fetchStaff();
    } catch (err) {
      setError('Failed to update staff');
    }
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      await staffApi.deleteStaff(selectedSalon.id, staffId);
      fetchStaff();
    } catch (err) {
      setError('Failed to delete staff');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="staff-management">
      <h2>Staff Management</h2>
      <form onSubmit={handleInviteStaff}>
        <input
          type="email"
          placeholder="Email"
          value={newStaff.email}
          onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Full Name"
          value={newStaff.fullName}
          onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
          required
        />
        <select
          value={newStaff.role}
          onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
          required
        >
          <option value="">Select Role</option>
          <option value="stylist">Stylist</option>
          <option value="manager">Manager</option>
        </select>
        <button type="submit">Invite Staff</button>
      </form>
      <ul>
        {staff.map((member) => (
          <li key={member.id}>
            {member.fullName} - {member.role}
            <button onClick={() => handleUpdateStaff(member.id, { role: 'manager' })}>
              Promote to Manager
            </button>
            <button onClick={() => handleDeleteStaff(member.id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StaffManagement;
