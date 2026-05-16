import React, { useState, useEffect } from 'react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // TODO: Fetch users from API
  }, []);

  return (
    <div className="manage-users">
      <h2>Quản lý người dùng</h2>
      {/* TODO: User management table */}
    </div>
  );
};

export default ManageUsers;
