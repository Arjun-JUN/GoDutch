import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader } from '../App';
import { Users, Plus, X } from '@phosphor-icons/react';
import Header from '../components/Header';

function GroupsPage({ onLogout }) {
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberEmails, setMemberEmails] = useState(['']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const res = await axios.get(`${API}/groups`, {
        headers: getAuthHeader(),
      });
      setGroups(res.data);
    } catch (error) {
      toast.error('Failed to load groups');
    }
  };

  const addEmailField = () => {
    setMemberEmails([...memberEmails, '']);
  };

  const removeEmailField = (index) => {
    setMemberEmails(memberEmails.filter((_, i) => i !== index));
  };

  const updateEmail = (index, value) => {
    const updated = [...memberEmails];
    updated[index] = value;
    setMemberEmails(updated);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emails = memberEmails.filter((e) => e.trim());
      await axios.post(
        `${API}/groups`,
        { name: groupName, member_emails: emails },
        { headers: getAuthHeader() }
      );

      toast.success('Group created!');
      setShowCreateModal(false);
      setGroupName('');
      setMemberEmails(['']);
      loadGroups();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#FFFDF2' }}>
      <Header onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl tracking-tight font-bold" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Groups
          </h1>
          <button
            data-testid="create-group-btn"
            onClick={() => setShowCreateModal(true)}
            className="neo-btn-primary"
          >
            <Plus size={20} weight="bold" className="inline mr-2" />
            New Group
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="groups-list">
          {groups.map((group) => (
            <div key={group.id} className="neo-card p-6" data-testid={`group-${group.id}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#BDE6A3] border-2 border-[#0F0F0F] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users size={24} weight="bold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }} data-testid={`group-name-${group.id}`}>
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {group.members.length} members
                  </p>
                  <div className="space-y-1">
                    {group.members.map((member) => (
                      <div
                        key={member.id}
                        className="text-sm bg-white border-2 border-[#0F0F0F] rounded px-3 py-1 inline-block mr-2 mb-1"
                        data-testid={`member-${member.id}`}
                      >
                        {member.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <Users size={64} weight="bold" className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">No groups yet</p>
              <button
                data-testid="create-first-group-btn"
                onClick={() => setShowCreateModal(true)}
                className="neo-btn-primary"
              >
                Create Your First Group
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="create-group-modal">
          <div className="neo-card p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                Create Group
              </h2>
              <button
                data-testid="close-modal-btn"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-600 hover:text-black"
              >
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Group Name
                </label>
                <input
                  data-testid="group-name-input"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="neo-input w-full"
                  placeholder="Roommates, Trip to Paris, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Member Emails
                </label>
                <div className="space-y-2">
                  {memberEmails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        data-testid={`member-email-${index}`}
                        type="email"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        className="neo-input flex-1"
                        placeholder="friend@example.com"
                        required
                      />
                      {memberEmails.length > 1 && (
                        <button
                          data-testid={`remove-email-${index}`}
                          type="button"
                          onClick={() => removeEmailField(index)}
                          className="neo-btn-secondary px-4"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  data-testid="add-email-btn"
                  type="button"
                  onClick={addEmailField}
                  className="neo-btn-secondary mt-2 text-sm"
                >
                  + Add Member
                </button>
              </div>

              <button
                data-testid="submit-group-btn"
                type="submit"
                disabled={loading}
                className="neo-btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create Group'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupsPage;