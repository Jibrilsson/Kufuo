create index if not exists blocks_blocked_idx on public.blocks(blocked_id);
create index if not exists comments_author_idx on public.comments(author_id);
create index if not exists comments_post_idx on public.comments(post_id, created_at);
create index if not exists messages_author_idx on public.messages(author_id);
create index if not exists notifications_actor_idx on public.notifications(actor_id);
create index if not exists post_reactions_user_idx on public.post_reactions(user_id);
create index if not exists posts_author_idx on public.posts(author_id, created_at desc);
create index if not exists reports_reporter_idx on public.reports(reporter_id);
create index if not exists reports_reported_user_idx on public.reports(reported_user_id);
create index if not exists reports_post_idx on public.reports(post_id);
create index if not exists saved_posts_user_idx on public.saved_posts(user_id);
create index if not exists saved_profiles_profile_idx on public.saved_profiles(profile_id);

drop policy if exists "Members manage their reactions" on public.post_reactions;
create policy "Members can create reactions" on public.post_reactions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Members can update their reactions" on public.post_reactions
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "Members can delete their reactions" on public.post_reactions
  for delete to authenticated using (user_id = (select auth.uid()));
