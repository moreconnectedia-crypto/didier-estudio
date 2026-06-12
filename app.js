// ============================================================
// app.js — Cliente Supabase y helpers compartidos
// ============================================================

const SUPABASE_URL = 'https://xuvubvznlczcwakifrsn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1dnVidnpubGN6Y3dha2lmcnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzk5ODgsImV4cCI6MjA5Njg1NTk4OH0.SVOdEdtjdWtM93QgVFF9hVD6O3_ET2tLMaq1NP1ip_U';

let sbClient;

function initSupabase() {
  sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return sbClient;
}

async function getCurrentUser() {
  const { data: { user } } = await sbClient.auth.getUser();
  return user;
}

async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data } = await sbClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
}

async function requireAuth(redirectTo = 'login.html') {
  const user = await getCurrentUser();
  if (!user) { window.location.href = redirectTo; return null; }
  return user;
}

async function requireRole(role, redirectTo = 'login.html') {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== role) { window.location.href = redirectTo; return null; }
  return profile;
}

async function signOut() {
  await sbClient.auth.signOut();
  window.location.href = 'login.html';
}

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = type ? `show ${type}` : 'show';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.className = '', 2800);
}

function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn._orig = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn._orig || btn.innerHTML;
    btn.disabled = false;
  }
}

function hidePageLoader() {
  const el = document.getElementById('page-loader');
  if (el) el.classList.add('hidden');
}

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DAYS_FULL = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const DAYS_SHORT = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function fmt2(n) { return n.toString().padStart(2, '0'); }
function dateKey(d) { return d.getFullYear() + '-' + fmt2(d.getMonth()+1) + '-' + fmt2(d.getDate()); }
function parseDate(str) { const [y,m,d] = str.split('-').map(Number); return new Date(y, m-1, d); }

function getSlotsForDate(dateStr) {
  const d = parseDate(dateStr);
  const dow = d.getDay();
  if (dow === 0) return [];
  const close = dow === 6 ? 18 : 20;
  const slots = [];
  for (let h = 9; h < close; h++) slots.push(h);
  return slots;
}

function formatDateLong(dateStr) {
  const d = parseDate(dateStr);
  return DAYS_FULL[d.getDay()] + ', ' + d.getDate() + ' de ' + MONTHS_ES[d.getMonth()] + ' ' + d.getFullYear();
}

const SERVICES = [
  'Corte tradicional',
  'Full navaja',
  'Full tijera',
  'Degradados',
  'Perfilados',
  'Cejas / barba',
  'Limpieza facial',
];
];
