## Admin Support Chat - All Users Display Feature

### Summary
The admin support panel now displays **all regular users** instead of just those who have initiated a conversation. This allows admins to proactively message any user without waiting for them to contact support first.

### Changes Made

#### 1. **src/components/admin/SupportRequests.tsx**

**fetchRequests() Function (Lines 235-310)**
- Previously: Only showed users who had sent messages
- Now: Fetches ALL regular users from the database, then populates their message history
- Algorithm:
  1. Fetch all users with role='user' from database
  2. Initialize UserWithMessages map with all users (empty messages initially)
  3. Populate messages for users that have any (as before)
  4. Sort intelligently: unread users first, then by latest message time, then alphabetically

**Sorting Logic**
- Unread messages prioritized at top
- Then sorted by most recent message timestamp
- Finally sorted alphabetically by email for users with no messages
- This ensures users with pending support needs are visible at the top

**UI Updates (Lines 485-535)**
- User list items now show "No messages yet" in italicized text for users without conversations
- Users with no messages appear slightly dimmed (opacity-60) for visual distinction
- Hover tooltip on users with no messages: "No messages yet - click to start a conversation"
- Delete button (trash icon) only appears for users with existing messages (prevents accidental deletion of empty conversations)

**Chat Panel (Lines 563-571)**
- When a user with no messages is selected, shows an improved empty state:
  - Message icon
  - "No messages yet" heading
  - Helper text: "Start a conversation with [email] by sending a message below"
- Admin can immediately start typing to initiate contact

### User Experience Flow

#### For Admin:
1. Opens Admin Dashboard → Support Chat
2. Sees all users in left panel, sorted by:
   - Users with unread messages at top
   - Then users with message history (most recent first)
   - Then users with no messages (alphabetically)
3. Can click ANY user to open chat
4. Can send first message to users who haven't contacted yet
5. Users with no messages appear dimmed to distinguish them

#### For Regular Users:
- No change - users can still initiate support requests as before
- When admin sends first message, user will see it in their support chat

### Benefits

✅ **Proactive Support**: Admin can reach out to users before they ask
✅ **Better Visibility**: No users hidden from support panel
✅ **Engagement**: Can send announcements or check-ins to all users
✅ **Clear UI**: Users with no messages visually distinguished
✅ **Smart Sorting**: Important conversations (unread) stay at top

### Database Query Impact

**New Query**: Single fetch of all users
```sql
SELECT id, email, role FROM users WHERE role = 'user'
```

**No New Queries**: Existing message fetching remains unchanged

### Testing

1. **Load Admin Support Chat**
   - Should see all users listed
   - Users with no messages appear dimmed with "No messages yet" label

2. **Send Message to User with No History**
   - Select user with no messages
   - Type and send message
   - User should receive it in their support chat

3. **Verify Sorting**
   - Create a test user
   - Verify they appear in list sorted alphabetically (if no messages)
   - Send unread message to them
   - Verify they move to top of unread section

4. **Check Edge Cases**
   - No users: Shows "No users to display" message
   - All users unread: All appear at top, sorted by time
   - Mix of read/unread: Unread first, then read by time

### Rollback

To revert to showing only users with messages, restore the original `fetchRequests()` function that only processes users from the message fetch results.

### Future Enhancements (Optional)

1. **Search/Filter**: Add search box to find users by email
2. **User Status**: Show user's last login time or account status
3. **Bulk Actions**: Send announcement to all users at once
4. **User Grouping**: Group by account balance, last activity, etc.
