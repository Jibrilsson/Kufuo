"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Bell,
  Bookmark,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Compass,
  Filter,
  KeyRound,
  Lightbulb,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  UserCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { MemberHeader } from "./MemberHeader";
import {
  loadConnections,
  loadConversations,
  loadDiscovery,
  loadNotifications,
  loadOwnProfile,
  loadSettings,
  markNotificationsRead,
  respondToIntroduction,
  saveSettings,
  sendConversationMessage,
  toggleSavedProfile,
  updatePassword,
} from "../lib/kufuo/client";
import { getLanguageSnapshot, getServerLanguageSnapshot, setStoredLanguage, subscribeToLanguage } from "../lib/kufuo/language";
import type { ConnectionRequest, Conversation, FounderProfile, Idea, Language, MemberSettings, Message, Notification } from "../lib/kufuo/types";

type Mode = "discover" | "messages" | "connections" | "notifications" | "settings";

const nav = [
  ["Opportunities", "الفرص", "/dashboard", Compass],
  ["Discover", "استكشف", "/discover", Search],
  ["Messages", "الرسائل", "/messages", Mail],
  ["Connections", "العلاقات", "/connections", UsersRound],
  ["Notifications", "التنبيهات", "/notifications", Bell],
  ["Profile", "الملف الشخصي", "/account", CircleUserRound],
  ["Settings", "الإعدادات", "/settings", Settings],
] as const;

const pageCopy = {
  en: {
    discover: ["Discover", "Find people and ideas worth building with.", "Search by skills, sector, city, commitment, or startup stage."],
    messages: ["Messages", "Move promising connections forward.", "Private conversations become available after an introduction is accepted."],
    connections: ["Connections", "Keep every introduction in context.", "Manage incoming, outgoing, and accepted introduction requests."],
    notifications: ["Notifications", "Stay on top of the conversations that matter.", "See new introductions and messages without unnecessary alerts."],
    settings: ["Settings", "Control your Kufuo experience.", "Manage matching, privacy, notifications, and your connected account."],
    search: "Search Kufuo",
    signOut: "Sign out",
  },
  ar: {
    discover: ["استكشف", "اعثر على أشخاص وأفكار تستحق أن تبني معها.", "ابحث حسب المهارات أو القطاع أو المدينة أو الالتزام أو مرحلة المشروع."],
    messages: ["الرسائل", "حوّل العلاقات الواعدة إلى خطوات عملية.", "تتوفر المحادثة الخاصة بعد قبول طلب التعارف."],
    connections: ["العلاقات", "خلّ كل طلب تعارف في سياقه.", "أدر طلبات التعارف الواردة والصادرة والعلاقات المقبولة."],
    notifications: ["التنبيهات", "تابع المحادثات اللي تهمك.", "شوف طلبات التعارف والرسائل الجديدة بدون تنبيهات ما لها داعي."],
    settings: ["الإعدادات", "تحكم في تجربتك على كفو.", "أدر المطابقة والخصوصية والتنبيهات والحساب المتصل."],
    search: "ابحث في كفو",
    signOut: "تسجيل الخروج",
  },
} as const;

function EmptyState({ title, body, href, action }: { title: string; body: string; href?: string; action?: string }) {
  return <div className="workspace-empty"><span className="side-icon"><Sparkles size={21} /></span><h2>{title}</h2><p>{body}</p>{href && action && <a className="button button-small" href={href}>{action}<ChevronRight size={16} /></a>}</div>;
}

type MemberWorkspaceProps = {
  mode: Mode;
  userId: string;
  user: { displayName: string; email: string };
  signOutHref: string;
  previewProfile?: FounderProfile;
  previewSettings?: MemberSettings;
};

export function MemberWorkspace({ mode, userId, user, signOutHref, previewProfile, previewSettings }: MemberWorkspaceProps) {
  const language = useSyncExternalStore(subscribeToLanguage, getLanguageSnapshot, getServerLanguageSnapshot);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(!previewProfile);
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<FounderProfile[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [savedProfileIds, setSavedProfileIds] = useState<string[]>([]);
  const [discoverType, setDiscoverType] = useState<"people" | "ideas">("people");
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [connectionProfiles, setConnectionProfiles] = useState<FounderProfile[]>([]);
  const [connectionTab, setConnectionTab] = useState<"accepted" | "pending">("accepted");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationProfiles, setConversationProfiles] = useState<FounderProfile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState(0);
  const [draft, setDraft] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settingsState, setSettingsState] = useState<MemberSettings>(previewSettings ?? { user_id: userId, match_notifications: true, introduction_notifications: true, community_notifications: false, profile_visible: true, city_visible: true, preferred_language: "en" });
  const [ownProfile, setOwnProfile] = useState<FounderProfile | null>(previewProfile ?? null);
  const arabic = language === "ar";
  const t = pageCopy[language];
  const [label, title, body] = t[mode];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = arabic ? "rtl" : "ltr";
  }, [language, arabic]);

  useEffect(() => {
    if (previewProfile) return;
    let alive = true;
    const run = async () => {
      try {
        if (mode === "discover") {
          const data = await loadDiscovery(userId);
          if (alive) { setProfiles(data.profiles); setIdeas(data.ideas); setSavedProfileIds(data.savedProfileIds); }
        } else if (mode === "connections") {
          const data = await loadConnections(userId);
          if (alive) { setRequests(data.requests); setConnectionProfiles(data.profiles); }
        } else if (mode === "messages") {
          const data = await loadConversations(userId);
          if (alive) { setConversations(data.conversations); setConversationProfiles(data.profiles); setMessages(data.messages); }
        } else if (mode === "notifications") {
          const data = await loadNotifications(userId);
          if (alive) setNotifications(data);
        } else if (mode === "settings") {
          const [data, profileData] = await Promise.all([loadSettings(userId), loadOwnProfile(userId)]);
          if (alive) {
            if (data) { setSettingsState(data); setStoredLanguage(data.preferred_language); }
            setOwnProfile(profileData);
          }
        }
      } catch (cause) {
        if (alive) setError(cause instanceof Error ? cause.message : "Could not load your Kufuo data.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, [mode, userId, previewProfile]);

  const filteredProfiles = useMemo(() => profiles.filter((profile) => `${profile.full_name} ${profile.headline} ${profile.city} ${profile.skills.join(" ")} ${profile.industries.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [profiles, query]);
  const filteredIdeas = useMemo(() => ideas.filter((idea) => `${idea.title} ${idea.summary} ${idea.city} ${idea.skills_needed.join(" ")} ${idea.industries.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [ideas, query]);
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  async function toggleProfile(profileId: string) {
    const shouldSave = !savedProfileIds.includes(profileId);
    setSavedProfileIds((current) => shouldSave ? [...current, profileId] : current.filter((id) => id !== profileId));
    try { await toggleSavedProfile(userId, profileId, shouldSave); }
    catch (cause) { setSavedProfileIds((current) => shouldSave ? current.filter((id) => id !== profileId) : [...current, profileId]); setError(cause instanceof Error ? cause.message : "Could not save this profile."); }
  }

  async function respond(requestId: string, status: "accepted" | "declined" | "cancelled") {
    try {
      const updated = await respondToIntroduction(requestId, status);
      setRequests((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update the request."); }
  }

  async function sendMessage() {
    const conversation = conversations[activeConversation];
    const value = draft.trim();
    if (!conversation || !value) return;
    try {
      const message = await sendConversationMessage(userId, conversation.id, value);
      setMessages((current) => [...current, message]);
      setDraft("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not send the message."); }
  }

  async function readAllNotifications() {
    try { await markNotificationsRead(userId); setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() }))); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update notifications."); }
  }

  async function updateSettings(next: MemberSettings) {
    setSettingsState(next);
    setError("");
    const { user_id: _userId, ...preferences } = next;
    void _userId;
    try { const saved = await saveSettings(userId, preferences); setSettingsState(saved); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save settings."); }
  }

  return <main className="workspace-app" dir={arabic ? "rtl" : "ltr"}>
    <MemberHeader user={user} active={mode === "settings" ? "settings" : mode === "notifications" ? undefined : mode} searchValue={query} onSearchChange={setQuery} searchPlaceholder={t.search} />
    <div className="workspace-grid"><aside className="workspace-sidebar"><nav className="dash-nav" aria-label="Member navigation">{nav.map(([en, ar, href, Icon]) => <a className={href === `/${mode}` ? "is-active" : ""} href={href} key={href}><Icon size={18} /><span>{arabic ? ar : en}</span>{href === "/notifications" && unreadCount > 0 && <b>{unreadCount}</b>}</a>)}</nav><div className="workspace-profile-note"><span className="dash-small-avatar"><UserRound size={18} /></span><div><strong>{user.displayName}</strong><span>{arabic ? "عضو كفو" : "Kufuo member"}</span></div></div><a className="dash-signout" href={signOutHref}><LogOut size={17} />{t.signOut}</a></aside>
      <section className="workspace-main"><header className="workspace-heading"><p className="kicker">{label}</p><h1>{title}</h1><p>{body}</p></header>{error && <p className="workspace-error" role="alert">{error}</p>}{loading ? <div className="workspace-loading" role="status">{arabic ? "جارٍ تحميل بياناتك…" : "Loading your Kufuo workspace…"}</div> : <>{mode === "discover" && <Discover language={language} query={query} setQuery={setQuery} type={discoverType} setType={setDiscoverType} profiles={filteredProfiles} ideas={filteredIdeas} saved={savedProfileIds} onToggleSaved={toggleProfile} />}{mode === "connections" && <Connections language={language} userId={userId} tab={connectionTab} setTab={setConnectionTab} requests={requests} profiles={connectionProfiles} onRespond={respond} />}{mode === "messages" && <Messages language={language} userId={userId} conversations={conversations} profiles={conversationProfiles} messages={messages} active={activeConversation} setActive={setActiveConversation} draft={draft} setDraft={setDraft} send={sendMessage} />}{mode === "notifications" && <Notifications language={language} items={notifications} onReadAll={readAllNotifications} />}{mode === "settings" && <SettingsView language={language} state={settingsState} onChange={updateSettings} user={user} profile={ownProfile} signOutHref={signOutHref} />}</>}</section>
    </div>
  </main>;
}

function Discover({ language, query, setQuery, type, setType, profiles, ideas, saved, onToggleSaved }: { language: Language; query: string; setQuery: (value: string) => void; type: "people" | "ideas"; setType: (value: "people" | "ideas") => void; profiles: FounderProfile[]; ideas: Idea[]; saved: string[]; onToggleSaved: (id: string) => void }) {
  const ar = language === "ar";
  return <div className="discover-view"><div className="workspace-toolbar"><div className="segmented"><button className={type === "people" ? "is-active" : ""} onClick={() => setType("people")} type="button"><UsersRound size={17} />{ar ? "مؤسسون" : "Founders"}</button><button className={type === "ideas" ? "is-active" : ""} onClick={() => setType("ideas")} type="button"><Lightbulb size={17} />{ar ? "أفكار" : "Ideas"}</button></div><button className="button button-secondary button-small" type="button"><Filter size={16} />{ar ? "تصفية" : "Filters"}</button></div><label className="workspace-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={ar ? "ابحث بالمهارة أو المدينة أو القطاع" : "Search by skill, city, or sector"} /></label>{type === "people" ? profiles.length ? <div className="discover-grid">{profiles.map((profile) => <article className="discover-card" key={profile.id}><div className="discover-card-top">{profile.avatar_url ? <img src={profile.avatar_url} alt={profile.full_name ?? "Founder"} /> : <span className="discover-avatar-fallback"><UserRound size={34} /></span>}<span className="status"><ShieldCheck size={14} />{profile.profile_strength}%</span></div><h2>{profile.full_name ?? (ar ? "عضو كفو" : "Kufuo member")}</h2><p className="discover-role">{profile.headline ?? profile.role} · {profile.city ?? (ar ? "الموقع غير محدد" : "Location not specified")}</p><p>{profile.bio}</p><div className="tag-row">{profile.skills.slice(0, 4).map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div><footer><a className="button button-small" href={`/profile/${profile.id}`}>{ar ? "عرض الملف" : "View profile"}<ChevronRight size={16} /></a><button className={`icon-button ${saved.includes(profile.id) ? "is-saved" : ""}`} type="button" aria-label={ar ? "حفظ الملف" : "Save profile"} onClick={() => onToggleSaved(profile.id)}><Bookmark size={18} fill={saved.includes(profile.id) ? "currentColor" : "none"} /></button></footer></article>)}</div> : <EmptyState title={ar ? "لا توجد ملفات مكتملة بعد" : "No complete founder profiles yet"} body={ar ? "كن أول من يكمل ملفه، وستظهر الملفات المناسبة هنا عند انضمامها." : "Complete your own profile first. Compatible members will appear here as the community grows."} href="/account" action={ar ? "أكمل ملفك" : "Complete your profile"} /> : ideas.length ? <div className="idea-list">{ideas.map((idea) => <article key={idea.id}><span className="side-icon"><Lightbulb size={20} /></span><div><small>{idea.stage} · {idea.city ?? (ar ? "الموقع غير محدد" : "Location not specified")}</small><h2>{idea.title}</h2><p>{idea.summary}</p><div className="tag-row">{idea.skills_needed.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div></div><a className="button button-small button-secondary" href={`/profile/${idea.owner_id}`}>{ar ? "المؤسس" : "Founder"}<ChevronRight size={16} /></a></article>)}</div> : <EmptyState title={ar ? "لا توجد أفكار منشورة" : "No open ideas yet"} body={ar ? "ستظهر هنا الأفكار التي ينشرها أعضاؤها للعثور على شريك." : "Ideas seeking a cofounder will appear here once members publish them."} href="/dashboard" action={ar ? "انشر تحديثًا" : "Share an update"} />}</div>;
}

function Connections({ language, userId, tab, setTab, requests, profiles, onRespond }: { language: Language; userId: string; tab: "accepted" | "pending"; setTab: (value: "accepted" | "pending") => void; requests: ConnectionRequest[]; profiles: FounderProfile[]; onRespond: (id: string, status: "accepted" | "declined" | "cancelled") => void }) {
  const ar = language === "ar";
  const data = requests.filter((request) => tab === "accepted" ? request.status === "accepted" : request.status === "pending");
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  return <div><div className="workspace-toolbar"><div className="segmented"><button className={tab === "accepted" ? "is-active" : ""} type="button" onClick={() => setTab("accepted")}><UserCheck size={17} />{ar ? "العلاقات" : "Connected"}</button><button className={tab === "pending" ? "is-active" : ""} type="button" onClick={() => setTab("pending")}><Clock3 size={17} />{ar ? "قيد الانتظار" : "Pending"}</button></div></div>{data.length ? <div className="connection-list">{data.map((request) => { const incoming = request.recipient_id === userId; const person = profileMap.get(incoming ? request.requester_id : request.recipient_id); return <article key={request.id}>{person?.avatar_url ? <img src={person.avatar_url} alt={person.full_name ?? "Founder"} /> : <span className="dash-small-avatar"><UserRound size={20} /></span>}<div><h2>{person?.full_name ?? (ar ? "عضو كفو" : "Kufuo member")}</h2><p>{person?.headline ?? person?.role} · {person?.city ?? (ar ? "الموقع غير محدد" : "Location not specified")}</p><span>{tab === "accepted" ? (ar ? "تم قبول التعارف" : "Introduction accepted") : incoming ? (ar ? "طلب وارد" : "Incoming request") : (ar ? "بانتظار الرد" : "Waiting for response")}</span>{request.message && <p className="connection-message">{request.message}</p>}</div><div>{tab === "accepted" ? <><a className="button button-small" href="/messages"><MessageCircle size={16} />{ar ? "رسالة" : "Message"}</a><a className="icon-button" href={`/profile/${person?.id}`} aria-label="View profile"><ChevronRight size={17} /></a></> : incoming ? <><button className="button button-small" type="button" onClick={() => onRespond(request.id, "accepted")}><Check size={16} />{ar ? "قبول" : "Accept"}</button><button className="button button-small button-secondary" type="button" onClick={() => onRespond(request.id, "declined")}><X size={16} />{ar ? "رفض" : "Decline"}</button></> : <button className="button button-small button-secondary" type="button" onClick={() => onRespond(request.id, "cancelled")}><X size={16} />{ar ? "إلغاء" : "Cancel"}</button>}</div></article>; })}</div> : <EmptyState title={tab === "accepted" ? (ar ? "لا توجد علاقات بعد" : "No connections yet") : (ar ? "لا توجد طلبات معلقة" : "No pending requests")} body={ar ? "استكشف أعضاء المجتمع وأرسل طلب تعارف واضح ومحترم." : "Discover community members and send a thoughtful introduction request."} href="/discover" action={ar ? "استكشف المؤسسين" : "Discover founders"} />}</div>;
}

function Messages({ language, userId, conversations, profiles, messages, active, setActive, draft, setDraft, send }: { language: Language; userId: string; conversations: Conversation[]; profiles: FounderProfile[]; messages: Message[]; active: number; setActive: (value: number) => void; draft: string; setDraft: (value: string) => void; send: () => void }) {
  const ar = language === "ar";
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const activeConversation = conversations[active];
  if (!conversations.length) return <EmptyState title={ar ? "لا توجد محادثات بعد" : "No conversations yet"} body={ar ? "تبدأ المحادثة بعد قبول أحد طلبات التعارف." : "A private conversation opens after an introduction request is accepted."} href="/discover" action={ar ? "اكتشف المؤسسين" : "Discover founders"} />;
  const activeProfile = profileMap.get(activeConversation.participant_a === userId ? activeConversation.participant_b : activeConversation.participant_a);
  return <div className="messages-shell"><aside className="conversation-list"><label><Search size={17} /><input placeholder={ar ? "ابحث في الرسائل" : "Search messages"} /></label>{conversations.map((conversation, index) => { const person = profileMap.get(conversation.participant_a === userId ? conversation.participant_b : conversation.participant_a); const last = messages.filter((message) => message.conversation_id === conversation.id).at(-1); return <button className={active === index ? "is-active" : ""} type="button" onClick={() => setActive(index)} key={conversation.id}>{person?.avatar_url ? <img src={person.avatar_url} alt="" /> : <span className="dash-small-avatar"><UserRound size={18} /></span>}<span><strong>{person?.full_name ?? (ar ? "عضو كفو" : "Kufuo member")}</strong><small>{last?.body ?? (ar ? "ابدأ المحادثة" : "Start the conversation")}</small></span></button>; })}</aside><section className="conversation"><header>{activeProfile?.avatar_url ? <img src={activeProfile.avatar_url} alt="" /> : <span className="dash-small-avatar"><UserRound size={20} /></span>}<div><strong>{activeProfile?.full_name ?? (ar ? "عضو كفو" : "Kufuo member")}</strong><span>{ar ? "تم التعارف عبر كفو" : "Connected through Kufuo"}</span></div><a className="button button-small button-secondary" href={`/profile/${activeProfile?.id}`}>{ar ? "الملف" : "Profile"}</a></header><div className="message-thread"><div className="message-date">{ar ? "المحادثة" : "Conversation"}</div>{messages.filter((message) => message.conversation_id === activeConversation.id).map((message) => <p className={`message-bubble ${message.author_id === userId ? "sent" : "received"}`} key={message.id}>{message.body}</p>)}</div><div className="message-compose"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={ar ? "اكتب رسالة…" : "Write a message…"} rows={2} /><button className="button" type="button" onClick={send} aria-label={ar ? "إرسال" : "Send"}><Send size={18} /></button></div></section></div>;
}

function Notifications({ language, items, onReadAll }: { language: Language; items: Notification[]; onReadAll: () => void }) {
  const ar = language === "ar";
  const unread = items.filter((item) => !item.read_at).length;
  return <div className="notifications-view"><div className="workspace-toolbar"><span>{unread ? (ar ? `${unread} تنبيهات جديدة` : `${unread} new notifications`) : (ar ? "لا توجد تنبيهات غير مقروءة" : "No unread notifications")}</span><button className="button button-small button-secondary" type="button" onClick={onReadAll} disabled={!unread}><Check size={16} />{ar ? "تحديد الكل كمقروء" : "Mark all read"}</button></div>{items.length ? <div className="notification-list">{items.map((item) => <a className={!item.read_at ? "is-unread" : ""} href={item.href ?? "/dashboard"} key={item.id}><span className="side-icon"><Bell size={20} /></span><div><h2>{item.title}</h2>{item.body && <p>{item.body}</p>}<small>{new Date(item.created_at).toLocaleString(ar ? "ar-SA" : "en-SA")}</small></div><ChevronRight size={18} /></a>)}</div> : <EmptyState title={ar ? "كل شيء هادئ" : "You are all caught up"} body={ar ? "ستظهر هنا طلبات التعارف والرسائل المهمة." : "Introduction requests and important messages will appear here."} />}</div>;
}

function SettingsView({ language, state, onChange, user, profile, signOutHref }: { language: Language; state: MemberSettings; onChange: (state: MemberSettings) => void; user: { displayName: string; email: string }; profile: FounderProfile | null; signOutHref: string }) {
  const ar = language === "ar";
  const [tab, setTab] = useState<"profile" | "preferences" | "security" | "account">("profile");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const tabs = [
    { id: "profile" as const, icon: CircleUserRound, label: ar ? "الملف" : "Profile" },
    { id: "preferences" as const, icon: SlidersHorizontal, label: ar ? "التفضيلات" : "Preferences" },
    { id: "security" as const, icon: KeyRound, label: ar ? "الأمان" : "Security" },
    { id: "account" as const, icon: LockKeyhole, label: ar ? "الحساب" : "Account" },
  ];
  const rows: Array<{ key: keyof MemberSettings; icon: typeof Sparkles; title: string; body: string }> = [
    { key: "match_notifications", icon: Sparkles, title: ar ? "فرص مناسبة لك" : "Recommended opportunities", body: ar ? "نبهني عند ظهور فرصة تناسب مهاراتي وتفضيلاتي." : "Notify me when a new opportunity fits my skills and preferences." },
    { key: "introduction_notifications", icon: UserCheck, title: ar ? "طلبات الانضمام والتعارف" : "Applications and introductions", body: ar ? "نبهني عند وصول طلب أو تغيّر حالته." : "Notify me when a request arrives or its status changes." },
    { key: "community_notifications", icon: UsersRound, title: ar ? "ملخصات كفو" : "Kufuo summaries", body: ar ? "أرسل لي ملخصًا مختصرًا بأهم الفرص والنشاط." : "Send me a concise summary of relevant opportunities and activity." },
    { key: "profile_visible", icon: ShieldCheck, title: ar ? "ظهور الملف" : "Profile visibility", body: ar ? "اسمح للأعضاء المكتملين باكتشاف ملفي." : "Allow complete members to discover my profile." },
    { key: "city_visible", icon: MapPin, title: ar ? "إظهار الموقع" : "Show my location", body: ar ? "أظهر موقعي داخل الملف العام." : "Show my location on my public profile." },
  ];

  async function savePassword() {
    setPasswordError("");
    setPasswordNotice("");
    if (password.length < 8) { setPasswordError(ar ? "استخدم كلمة مرور من ٨ أحرف على الأقل." : "Use at least 8 characters."); return; }
    if (password !== confirmPassword) { setPasswordError(ar ? "كلمتا المرور غير متطابقتين." : "The passwords do not match."); return; }
    setSavingPassword(true);
    try {
      await updatePassword(password);
      setPassword("");
      setConfirmPassword("");
      setPasswordNotice(ar ? "تم تحديث كلمة المرور." : "Password updated.");
    } catch (cause) {
      setPasswordError(cause instanceof Error ? cause.message : "Could not update the password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return <div className="settings-shell">
    <nav className="settings-tabs" aria-label={ar ? "أقسام الإعدادات" : "Settings sections"}>{tabs.map(({ id, icon: Icon, label }) => <button className={tab === id ? "is-active" : ""} type="button" onClick={() => setTab(id)} key={id}><Icon size={17} />{label}</button>)}</nav>

    {tab === "profile" && <div className="settings-profile-grid"><section className="settings-panel settings-profile-summary"><div className="settings-profile-head"><span className="dash-profile-avatar">{profile?.avatar_url ? <img src={profile.avatar_url} alt="" /> : <UserRound size={28} />}</span><div><small>{ar ? "ملفك العام" : "Your public profile"}</small><h2>{profile?.full_name ?? user.displayName}</h2><p>{profile?.headline ?? (ar ? "أضف عنوانك المهني" : "Add your professional headline")}</p></div><strong>{profile?.profile_strength ?? 20}%</strong></div><div className="member-progress"><span style={{ width: `${profile?.profile_strength ?? 20}%` }} /></div><p>{ar ? "حدّث خبرتك ومهاراتك وتفضيلاتك ليعرف المؤسسون متى تكون الشخص المناسب." : "Keep your experience, skills, and founder preferences current so people know when you are the right fit."}</p><a className="button" href="/account"><Pencil size={16} />{ar ? "تعديل الملف" : "Edit profile"}</a></section><aside className="settings-account"><div className="member-side-heading"><ShieldCheck size={20} /><span>{ar ? "حالة الملف" : "Profile status"}</span></div><dl className="settings-status-list"><div><dt>{ar ? "الظهور" : "Visibility"}</dt><dd>{state.profile_visible ? (ar ? "ظاهر" : "Visible") : (ar ? "مخفي" : "Hidden")}</dd></div><div><dt>{ar ? "اكتمال الملف" : "Completion"}</dt><dd>{profile?.profile_strength ?? 20}%</dd></div><div><dt>LinkedIn</dt><dd>{profile?.linkedin_url ? (ar ? "مرتبط" : "Added") : (ar ? "غير مضاف" : "Not added")}</dd></div></dl><a className="button button-secondary" href={profile?.id ? `/profile/${profile.id}` : "/account"}>{ar ? "معاينة الملف العام" : "Preview public profile"}<ChevronRight className="directional-icon" size={16} /></a></aside></div>}

    {tab === "preferences" && <section className="settings-panel settings-list"><header><span className="side-icon"><SlidersHorizontal size={20} /></span><div><h2>{ar ? "التنبيهات والخصوصية" : "Notifications and privacy"}</h2><p>{ar ? "اختر ما يصلك وما يظهر في ملفك العام." : "Choose what reaches you and what appears on your public profile."}</p></div></header>{rows.map((row) => { const Icon = row.icon; const checked = Boolean(state[row.key]); return <div className="settings-row" key={row.key}><span className="side-icon"><Icon size={20} /></span><div><h2>{row.title}</h2><p>{row.body}</p></div><button className={`toggle ${checked ? "is-on" : ""}`} type="button" role="switch" aria-checked={checked} onClick={() => onChange({ ...state, [row.key]: !checked })}><span /></button></div>; })}</section>}

    {tab === "security" && <section className="settings-panel security-settings"><div className="settings-section-heading"><span className="side-icon"><KeyRound size={20} /></span><div><h2>{ar ? "تغيير كلمة المرور" : "Change password"}</h2><p>{ar ? "استخدم كلمة مرور قوية لا تستخدمها في موقع آخر." : "Use a strong password you do not reuse elsewhere."}</p></div></div><div className="settings-form-grid"><label><span>{ar ? "كلمة المرور الجديدة" : "New password"}</span><input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label><span>{ar ? "تأكيد كلمة المرور" : "Confirm password"}</span><input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label></div>{passwordError && <p className="workspace-error" role="alert">{passwordError}</p>}{passwordNotice && <p className="settings-success" role="status"><Check size={16} />{passwordNotice}</p>}<button className="button" type="button" disabled={savingPassword} onClick={savePassword}><KeyRound size={16} />{savingPassword ? (ar ? "جارٍ التحديث…" : "Updating…") : (ar ? "تحديث كلمة المرور" : "Update password")}</button></section>}

    {tab === "account" && <div className="settings-account-grid"><section className="settings-panel"><div className="settings-section-heading"><span className="side-icon"><LockKeyhole size={20} /></span><div><h2>{ar ? "الحساب المتصل" : "Connected account"}</h2><p>{ar ? "هذه البيانات مرتبطة بجلسة تسجيل الدخول الحالية." : "These details are linked to your current sign-in session."}</p></div></div><div className="settings-user"><span className="dash-small-avatar"><UserRound size={20} /></span><div><strong>{user.displayName}</strong><span>{user.email}</span></div></div><div className="account-security-note"><ShieldCheck size={17} /><span>{ar ? "جلسة مشفرة وبيانات التواصل خاصة." : "Encrypted session and private contact details."}</span></div><a className="button button-secondary" href={signOutHref}><LogOut size={17} />{ar ? "تسجيل الخروج من هذا الجهاز" : "Sign out on this device"}</a></section><aside className="settings-account settings-pause-card"><div className="member-side-heading"><CircleUserRound size={20} /><span>{ar ? "إيقاف الظهور مؤقتًا" : "Pause discovery"}</span></div><p>{ar ? "إذا احتجت فترة راحة، أخفِ ملفك من نتائج البحث بدل حذف حسابك." : "Need a break? Hide your profile from discovery without deleting your account."}</p><button className="button button-secondary" type="button" onClick={() => onChange({ ...state, profile_visible: !state.profile_visible })}>{state.profile_visible ? (ar ? "إخفاء الملف" : "Hide profile") : (ar ? "إظهار الملف" : "Show profile")}</button></aside></div>}
  </div>;
}
