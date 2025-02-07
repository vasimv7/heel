// // // frontend/pages/dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';

// Lazy-load the new, enhanced Chart component
const ChartComponent = dynamic(() => import('../components/ChartComponent'), { ssr: false });

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState([]);

  // For editing table rows
  const [editUserId, setEditUserId] = useState(null);
  const [editRole, setEditRole] = useState('employee');
  const [editProjectId, setEditProjectId] = useState('');
  const [editTimelines, setEditTimelines] = useState([]);

  // All projects for selection (used in the dropdown when editing a user)
  const [projects, setProjects] = useState([]);

  // For the chart:
  const [selectedUserId, setSelectedUserId] = useState(null);

  // For client-side search
  const [searchTerm, setSearchTerm] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // 1) Fetch current logged-in user
  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
    } else {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch((err) => {
          console.error(err);
          window.location.href = '/login';
        });
    }
  }, [token]);

  // 2) If manager/hr/director, fetch entire team & projects
  useEffect(() => {
    if (user && ['manager', 'director', 'hr'].includes(user.role)) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/team`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setTeam(res.data))
        .catch((err) => console.error(err));

      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/project`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setProjects(res.data))
        .catch((err) => console.error(err));
    }
  }, [user, token]);

  // 3) Decide which user’s timeline to show in the chart
  const isManager = user && ['manager', 'director', 'hr'].includes(user?.role);

  useEffect(() => {
    if (isManager && team.length > 0 && !selectedUserId) {
      setSelectedUserId(user._id);
    } else if (!isManager && user && !selectedUserId) {
      setSelectedUserId(user._id);
    }
  }, [isManager, team, user, selectedUserId]);

  // 4) Identify the chart user (which timeline do we display?)
  let chartUser = null;
  if (selectedUserId) {
    if (isManager) {
      chartUser = team.find((member) => member._id === selectedUserId) || user;
    } else {
      chartUser = user; // employees always see themselves
    }
  }

  // 5) If still loading user info, show placeholder
  if (!user) {
    return (
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  // 6) Build chart data from chartUser’s timeline
  let chartData = {
    labels: [],
    datasets: [
      {
        label: 'Allocation Duration (days)',
        data: [],
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  if (chartUser && chartUser.timeline && chartUser.timeline.length > 0) {
    chartData = {
      // 1. Project name + start date on the X-axis
      labels: chartUser.timeline.map((t) => {
        const projectName = t.project?.name || 'No project';
        const startDate = t.startDate
          ? new Date(t.startDate).toLocaleDateString()
          : 'N/A';
        // Example: "Project A (1/1/2023)" 
        return `${projectName} (${startDate})`;
      }),
      datasets: [
        {
          label: 'Allocation Duration (days)',
          // 2. Each bar’s value is (endDate - startDate) in days
          data: chartUser.timeline.map((t) => {
            const start = t.startDate ? new Date(t.startDate) : null;
            const end = t.endDate ? new Date(t.endDate) : null;
            if (!start || !end) return 0; // or handle missing dates
            const diffMs = end - start; 
            return Math.round(diffMs / (1000 * 60 * 60 * 24));
          }),
          backgroundColor: 'rgba(75,192,192,0.6)',
        },
      ],
    };
  }

  // Export team data (CSV)
  const handleExport = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/project/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'team.csv');
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => console.error(err));
  };

  // -------------------------------
  // EDITING LOGIC FOR TEAM MEMBERS
  // -------------------------------
  const startEditing = (member) => {
    setEditUserId(member._id);
    setEditRole(member.role || 'employee');
    setEditProjectId(member.project?._id || '');
    setEditTimelines(member.timeline ? [...member.timeline] : []);
  };

  const cancelEditing = () => {
    setEditUserId(null);
    setEditRole('employee');
    setEditProjectId('');
    setEditTimelines([]);
  };

  const handleTimelineChange = (index, field, value) => {
    const updatedTimelines = [...editTimelines];
    updatedTimelines[index] = {
      ...updatedTimelines[index],
      [field]: value,
    };

    // Automatically set startDate and endDate when project is selected
    if (field === 'project' && value) {
      const selectedProject = projects.find((proj) => proj._id === value);
      if (selectedProject) {
        updatedTimelines[index].startDate = selectedProject.startDate
          ? selectedProject.startDate.substring(0, 10)
          : '';
        updatedTimelines[index].endDate = selectedProject.endDate
          ? selectedProject.endDate.substring(0, 10)
          : '';
      } else {
        updatedTimelines[index].startDate = '';
        updatedTimelines[index].endDate = '';
      }
    }

    setEditTimelines(updatedTimelines);
  };

  const handleAddTimeline = () => {
    setEditTimelines([
      ...editTimelines,
      { project: '', startDate: '', endDate: '' },
    ]);
  };

  const handleDeleteTimeline = (index) => {
    const updatedTimelines = [...editTimelines];
    updatedTimelines.splice(index, 1);
    setEditTimelines(updatedTimelines);
  };

  const saveEdit = async (memberId) => {
    try {
      // Prepare timelines by converting strings to Date objects or null
      const preparedTimelines = editTimelines.map((t) => ({
        project: t.project || null,
        startDate: t.startDate ? new Date(t.startDate) : null,
        endDate: t.endDate ? new Date(t.endDate) : null,
      }));

      const body = {
        role: editRole,
        project: editProjectId || null,
        timeline: preparedTimelines,
      };

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/${memberId}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local team data
      setTeam((prevTeam) =>
        prevTeam.map((mem) => (mem._id === memberId ? res.data : mem))
      );
      cancelEditing();
    } catch (error) {
      console.error(error);
      alert('Failed to update user');
    }
  };

  // -------------------------------
  // SEARCH LOGIC
  // -------------------------------
  const filteredTeam = team.filter((member) => {
    if (!searchTerm.trim()) return true;
    const lower = searchTerm.toLowerCase();
    return (
      member.name.toLowerCase().includes(lower) ||
      member.email.toLowerCase().includes(lower)
    );
  });

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <Layout>
      <h1>Dashboard</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Welcome, {user.name}</h2>
        <p>
          <strong>Designation:</strong> {user.role}
        </p>
        <p>
          <strong>Current Project:</strong>{' '}
          {user.project ? user.project.name : 'None'}
        </p>
      </section>

      <section style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3>Project Timeline</h3>

        {/* If manager, hr, or director, show a dropdown to pick a user from the team */}
        {isManager && team.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ marginRight: '0.5rem' }}>
              Select a user timeline:
            </label>
            <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              {team.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Show the chart for the selected user (manager) or the logged-in user (employee) */}
        <ChartComponent 
          data={chartData} 
          // Example: pass extra options if you like
          options={{
            plugins: {
              title: { display: true, text: 'Custom Timeline Chart Title' }
            }
            // onClick, tooltips, etc. can also be customized
          }}
        />
      </section>

      {isManager && team.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h2>Team Details</h2>
          <input
            type="text"
            placeholder="Search team..."
            style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <table
            border="1"
            width="100%"
            cellPadding="8"
            style={{ borderCollapse: 'collapse' }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Project</th>
                <th>Timeline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeam.map((member) => {
                const isEditing = editUserId === member._id;
                return (
                  <tr key={member._id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      {isEditing ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                        >
                          <option value="employee">Employee</option>
                          <option value="manager">Manager</option>
                          <option value="hr">HR</option>
                          <option value="director">Director</option>
                        </select>
                      ) : (
                        member.role
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={editProjectId}
                          onChange={(e) => setEditProjectId(e.target.value)}
                        >
                          <option value="">None</option>
                          {projects.map((proj) => (
                            <option key={proj._id} value={proj._id}>
                              {proj.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        member.project ? member.project.name : 'None'
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div>
                          {editTimelines.map((t, idx) => (
                            <div key={idx} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '0.5rem' }}>
                              <label>
                                Project:
                                <select
                                  value={t.project || ''}
                                  onChange={(e) => handleTimelineChange(idx, 'project', e.target.value)}
                                  style={{ marginLeft: '0.5rem' }}
                                >
                                  <option value="">None</option>
                                  {projects.map((proj) => (
                                    <option key={proj._id} value={proj._id}>
                                      {proj.name}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <br />
                              <label>
                                Start Date:
                                <input
                                  type="date"
                                  value={t.startDate}
                                  onChange={(e) => handleTimelineChange(idx, 'startDate', e.target.value)}
                                  style={{ marginLeft: '0.5rem' }}
                                />
                              </label>
                              <br />
                              <label>
                                End Date:
                                <input
                                  type="date"
                                  value={t.endDate}
                                  onChange={(e) => handleTimelineChange(idx, 'endDate', e.target.value)}
                                  style={{ marginLeft: '0.5rem' }}
                                />
                              </label>
                              <br />
                              <button
                                onClick={() => handleDeleteTimeline(idx)}
                                style={{ marginTop: '0.5rem', backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', cursor: 'pointer' }}
                              >
                                Delete Timeline
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={handleAddTimeline}
                            style={{ backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}
                          >
                            Add New Timeline
                          </button>
                        </div>
                      ) : (
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                          {member.timeline?.map((entry, idx) => {
                            const sd = entry.startDate
                              ? entry.startDate.substring(0, 10)
                              : '';
                            const ed = entry.endDate
                              ? entry.endDate.substring(0, 10)
                              : '';
                            return (
                              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                                {entry.project?.name
                                  ? <strong>{entry.project.name}:</strong>
                                  : <strong>Project:</strong>
                                }{' '}
                                {sd} to {ed}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(member._id)} style={{ marginRight: '0.5rem' }}>
                            Save
                          </button>
                          <button onClick={cancelEditing}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => startEditing(member)}>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button onClick={handleExport} style={{ marginTop: '1rem' }}>
            Export Team Data
          </button>
        </section>
      )}
    </Layout>
  );
};

export default Dashboard;
