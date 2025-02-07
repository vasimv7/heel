// // frontend/pages/projects.js
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import Layout from '../components/Layout';

// const ProjectsPage = () => {
//   const [projects, setProjects] = useState([]);
//   const [editProjectId, setEditProjectId] = useState(null);
//   const [editName, setEditName] = useState('');
//   const [editStartDate, setEditStartDate] = useState('');
//   const [editEndDate, setEditEndDate] = useState('');

//   const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

//   useEffect(() => {
//     if (!token) {
//       window.location.href = '/login';
//     } else {
//       axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/project`, {
//         headers: { Authorization: `Bearer ${token}` }
//       })
//       .then(res => setProjects(res.data))
//       .catch(err => console.error(err));
//     }
//   }, [token]);

//   const startEditing = (project) => {
//     setEditProjectId(project._id);
//     setEditName(project.name || '');
//     setEditStartDate(project.startDate ? project.startDate.substring(0,10) : '');
//     setEditEndDate(project.endDate ? project.endDate.substring(0,10) : '');
//   };

//   const cancelEditing = () => {
//     setEditProjectId(null);
//     setEditName('');
//     setEditStartDate('');
//     setEditEndDate('');
//   };

//   const saveEdit = async (projectId) => {
//     try {
//       const body = {
//         name: editName,
//         startDate: editStartDate ? new Date(editStartDate) : null,
//         endDate: editEndDate ? new Date(editEndDate) : null,
//       };

//       const res = await axios.put(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/project/${projectId}`,
//         body,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       // Update local array
//       setProjects(prev =>
//         prev.map(p => (p._id === projectId ? res.data : p))
//       );
//       cancelEditing();
//     } catch (error) {
//       console.error(error);
//       alert('Failed to update project');
//     }
//   };

//   return (
//     <Layout>
//       <h1>All Projects</h1>
//       <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
//         <thead>
//           <tr style={{ backgroundColor: '#f0f0f0' }}>
//             <th>Name</th>
//             <th>Start Date</th>
//             <th>End Date</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {projects.map(project => {
//             const isEditing = editProjectId === project._id;
//             return (
//               <tr key={project._id}>
//                 <td>
//                   {isEditing ? (
//                     <input
//                       type="text"
//                       value={editName}
//                       onChange={e => setEditName(e.target.value)}
//                     />
//                   ) : (
//                     project.name
//                   )}
//                 </td>
//                 <td>
//                   {isEditing ? (
//                     <input
//                       type="date"
//                       value={editStartDate}
//                       onChange={e => setEditStartDate(e.target.value)}
//                     />
//                   ) : (
//                     project.startDate ? project.startDate.substring(0,10) : ''
//                   )}
//                 </td>
//                 <td>
//                   {isEditing ? (
//                     <input
//                       type="date"
//                       value={editEndDate}
//                       onChange={e => setEditEndDate(e.target.value)}
//                     />
//                   ) : (
//                     project.endDate ? project.endDate.substring(0,10) : ''
//                   )}
//                 </td>
//                 <td>
//                   {isEditing ? (
//                     <>
//                       <button onClick={() => saveEdit(project._id)}>Save</button>
//                       <button onClick={cancelEditing}>Cancel</button>
//                     </>
//                   ) : (
//                     <button onClick={() => startEditing(project)}>Edit</button>
//                   )}
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </Layout>
//   );
// };

// export default ProjectsPage;
// frontend/pages/projects.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);

  // Existing editing state
  const [editProjectId, setEditProjectId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  // NEW: fields for creating a new project
  const [newProjectName, setNewProjectName] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
    } else {
      // Fetch all projects
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/project`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setProjects(res.data))
      .catch(err => console.error(err));
    }
  }, [token]);

  // Editing existing project
  const startEditing = (project) => {
    setEditProjectId(project._id);
    setEditName(project.name || '');
    setEditStartDate(project.startDate ? project.startDate.substring(0,10) : '');
    setEditEndDate(project.endDate ? project.endDate.substring(0,10) : '');
  };

  const cancelEditing = () => {
    setEditProjectId(null);
    setEditName('');
    setEditStartDate('');
    setEditEndDate('');
  };

  const saveEdit = async (projectId) => {
    try {
      const body = {
        name: editName,
        startDate: editStartDate ? new Date(editStartDate) : null,
        endDate: editEndDate ? new Date(editEndDate) : null,
      };

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/project/${projectId}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local array
      setProjects(prev =>
        prev.map(p => (p._id === projectId ? res.data : p))
      );
      cancelEditing();
    } catch (error) {
      console.error(error);
      alert('Failed to update project');
    }
  };

  // NEW: Handle creating a new project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name: newProjectName,
        startDate: newStartDate ? new Date(newStartDate) : null,
        endDate: newEndDate ? new Date(newEndDate) : null,
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/project`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add new project to the state
      setProjects((prev) => [...prev, res.data]);

      // Clear the form
      setNewProjectName('');
      setNewStartDate('');
      setNewEndDate('');
    } catch (error) {
      console.error(error);
      alert('Failed to create project');
    }
  };

  return (
    <Layout>
      <h1>All Projects</h1>

      {/* NEW: Form to add a project */}
      <div style={{ marginBottom: '2rem' }}>
        <h2>Create a New Project</h2>
        <form onSubmit={handleCreateProject} style={{ display: 'flex', gap: '1rem' }}>
          <div>
            <label>Project Name: </label>
            <input
              type="text"
              required
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label>Start Date: </label>
            <input
              type="date"
              value={newStartDate}
              onChange={e => setNewStartDate(e.target.value)}
            />
          </div>
          <div>
            <label>End Date: </label>
            <input
              type="date"
              value={newEndDate}
              onChange={e => setNewEndDate(e.target.value)}
            />
          </div>
          <button type="submit">Add Project</button>
        </form>
      </div>

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th>Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => {
            const isEditing = editProjectId === project._id;
            return (
              <tr key={project._id}>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  ) : (
                    project.name
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={e => setEditStartDate(e.target.value)}
                    />
                  ) : (
                    project.startDate ? project.startDate.substring(0,10) : ''
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={e => setEditEndDate(e.target.value)}
                    />
                  ) : (
                    project.endDate ? project.endDate.substring(0,10) : ''
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <>
                      <button onClick={() => saveEdit(project._id)}>Save</button>
                      <button onClick={cancelEditing}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => startEditing(project)}>Edit</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Layout>
  );
};

export default ProjectsPage;
