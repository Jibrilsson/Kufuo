-- Limit client updates to the exact mutable fields used by member workflows.
-- RLS still determines which rows may be changed; these column grants prevent
-- participants from rewriting ownership or notification content.

revoke update on table public.connection_requests from authenticated;
grant update (status, responded_at) on table public.connection_requests to authenticated;

revoke update on table public.messages from authenticated;
grant update (read_at) on table public.messages to authenticated;

revoke update on table public.notifications from authenticated;
grant update (read_at) on table public.notifications to authenticated;
