// Groups page - displays groups the user is part of and allows creating new groups
import React, { useState, useEffect } from 'react';

// FIX: Moved mock data outside the component to prevent reallocation on every render 
// and resolve the VS Code / ESLint dependency warning.
const MOCK_GROUPS = [
  {
    id: 1,
    name: 'Faith Buddies Youth Group',
    description: 'A group for young adults to grow in faith together',
    memberCount: 45,
    image: 'https://cf.ltkcdn.net/www/images/std/355721-800x534-young-group-having-fun-together-2210336135.jpg'
  },
  {
    id: 2,
    name: 'Prayer Warriors',
    description: 'Dedicated to intercessory prayer and spiritual warfare',
    memberCount: 23,
    image: 'https://churchanswers.com/wp-content/uploads/2024/09/Group-of-different-people-praying-together.png'
  },
  {
    id: 3,
    name: 'Bible Study Fellowship',
    description: 'Weekly deep dives into Gods word',
    memberCount: 32,
    image: 'https://www.icirnigeria.org/wp-content/uploads/2021/11/Fellowship.jpg'
  },
  {
    id: 4,
    name: 'Worship Team',
    description: 'Musicians and singers leading worship',
    memberCount: 12,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTL5l0vk3H6zhwKgQPtpUEnlrxZz6qDGbPr8Q&s'
  }
];

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch groups from the API
    setGroups(MOCK_GROUPS);
    setLoading(false);
  }, []); // [] is now completely valid since MOCK_GROUPS is in global scope

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    setIsCreating(true);
    try {
      // In a real app, we would call an API to create the group
      const newGroup = {
        id: Date.now(), // Temporary ID
        name: groupName,
        description: groupDescription || '',
        memberCount: 1, // Creator is first member
        image: 'https://via.placeholder.com/100'
      };
      
      setGroups([newGroup, ...groups]);
      setGroupName('');
      setGroupDescription('');
      setCreateGroupModal(false);
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h1>Groups</h1>
        <button 
          className="create-group-btn" 
          onClick={() => setCreateGroupModal(true)}
        >
          + Create Group
        </button>
      </div>
      
      <div className="groups-content">
        {loading ? (
          <p>Loading groups...</p>
        ) : (
          groups.length === 0 ? (
            <p className="empty-groups">Youre not part of any groups yet. Create your first group!</p>
          ) : (
            <div className="groups-list">
              {groups.map(group => (
                <div key={group.id} className="group-card">
                  <img src={group.image} alt={`${group.name} image`} className="group-image" />
                  <div className="group-info">
                    <h3>{group.name}</h3>
                    <p className="group-description">{group.description}</p>
                    <div className="group-stats">
                      <span>{group.memberCount} members</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
      
      {/* Create Group Modal */}
      {createGroupModal && (
        <div className="modal-backdrop" onClick={() => setCreateGroupModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Group</h3>
              <button className="modal-close-btn" onClick={() => setCreateGroupModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                maxLength="50"
              />
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Group description (optional)"
                maxLength="200"
              />
            </div>
            <div className="modal-footer">
              <button 
                className="modal-cancel-btn" 
                onClick={() => {
                  setGroupName('');
                  setGroupDescription('');
                  setCreateGroupModal(false);
                }}
              >
                Cancel
              </button>
              <button 
                className="modal-create-btn"
                onClick={handleCreateGroup}
                disabled={isCreating || !groupName.trim()}
              >
                {isCreating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;