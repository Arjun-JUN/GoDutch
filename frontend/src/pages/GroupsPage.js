import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API, getAuthHeader } from '../App';
import { Users, Plus, X } from '@/slate/icons';
import { Header, AppButton, AppInput, AppModal, AppShell, EmptyState, Field, MemberBadge, ModalHeader, PageContent, PageHero } from '@/slate';

function GroupsPage({ onLogout }) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberEmails, setMemberEmails] = useState(['']);
  const [loading, setLoading] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/groups`, {
        headers: getAuthHeader(),
      });
      setGroups(res.data);
    } catch (error) {
      toast.error('Failed to load groups');
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

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
      const emails = memberEmails.filter((email) => email.trim());
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
      const errorMessage = error.response?.data?.detail || 'Failed to create group';

      if (errorMessage.includes('not found')) {
        toast.error('Some member emails are not registered. Please ask them to sign up first!', { duration: 5000 });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <Header onLogout={onLogout} />

      <PageContent className="max-w-5xl">
        <PageHero
          eyebrow="Shared Circles"
          title="Groups"
          description="Create reusable spaces for roommates, trips, teams, and any other shared tab you want to keep consistent."
          actions={(
            <AppButton
              data-testid="create-group-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={20} weight="bold" />
              <span className="hidden sm:inline">New Group</span>
              <span className="sm:hidden">New</span>
            </AppButton>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6" data-testid="groups-list">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)}
              className="app-surface-interactive w-full p-4 text-left md:p-6"
              data-testid={`group-${group.id}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[1.15rem] bg-[var(--app-soft-strong)] text-[var(--app-primary-strong)]">
                  <Users size={24} weight="bold" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-2 truncate text-lg font-extrabold tracking-[-0.03em] text-[var(--app-foreground)] md:text-xl" data-testid={`group-name-${group.id}`}>
                    {group.name}
                  </h3>
                  <p className="mb-3 text-sm text-[var(--app-muted)]">
                    {group.members.length} members
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {group.members.slice(0, 3).map((member) => (
                      <MemberBadge
                        key={member.id}
                        className="px-3 py-1.5 text-xs"
                        data-testid={`member-${member.id}`}
                      >
                        {member.name}
                      </MemberBadge>
                    ))}
                    {group.members.length > 3 && (
                      <MemberBadge className="px-3 py-1.5 text-xs">
                        +{group.members.length - 3}
                      </MemberBadge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {groups.length === 0 && (
            <div className="col-span-2">
              <EmptyState
                icon={Users}
                title="No groups yet"
                action={(
                  <AppButton
                    data-testid="create-first-group-btn"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create Your First Group
                  </AppButton>
                )}
              />
            </div>
          )}
        </div>
      </PageContent>

      <AppModal open={showCreateModal} data-testid="create-group-modal">
        <ModalHeader title="Create Group" onClose={() => setShowCreateModal(false)} />

        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Field label="Group Name">
            <AppInput
              data-testid="group-name-input"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Roommates, Trip to Paris, etc."
              required
            />
          </Field>

          <Field label="Member Emails">
            <div className="space-y-2">
              {memberEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <AppInput
                    data-testid={`member-email-${index}`}
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className="flex-1"
                    placeholder="friend@example.com"
                    required
                  />
                  {memberEmails.length > 1 && (
                    <AppButton
                      data-testid={`remove-email-${index}`}
                      onClick={() => removeEmailField(index)}
                      variant="secondary"
                      size="sm"
                      className="px-4"
                    >
                      <X size={16} weight="bold" />
                    </AppButton>
                  )}
                </div>
              ))}
            </div>
            <AppButton
              data-testid="add-email-btn"
              onClick={addEmailField}
              variant="secondary"
              size="sm"
              className="mt-2"
            >
              + Add Member
            </AppButton>
          </Field>

          <AppButton
            data-testid="submit-group-btn"
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Creating...</span>
              </>
            ) : (
              'Create Group'
            )}
          </AppButton>
        </form>
      </AppModal>
    </AppShell>
  );
}

export default GroupsPage;
