const KEY = 'comments-v1';
const $ = (s, r = document) => r.querySelector(s);
const root = $('#comments');
const dlg = $('#delete-dialog');
const tpl = id => $('#' + id).content.firstElementChild.cloneNode(true);

const UNITS = [['year', 31536e6], ['month', 2592e6], ['week', 6048e5], ['day', 864e5], ['hour', 36e5], ['minute', 6e4]];
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'always' });
const ago = ts => {
  const d = ts - Date.now();
  for (const [u, ms] of UNITS) if (Math.abs(d) >= ms) return rtf.format(Math.round(d / ms), u);
  return 'just now';
};
// "2 weeks ago" from data.json -> timestamp, so time keeps tracking dynamically
const parse = s => {
  const m = s.match(/(\d+)\s+(\w+?)s?\s+ago/);
  const ms = m && UNITS.find(u => u[0] === m[2]);
  return ms ? Date.now() - m[1] * ms[1] : Date.now();
};

let state, pending = null;
let ui = {}; // { mode: 'reply' | 'edit', id, draft, focus }

const seed = d => {
  let max = 0;
  const fix = c => {
    max = Math.max(max, c.id);
    return { ...c, createdAt: parse(c.createdAt), replies: (c.replies || []).map(fix) };
  };
  return { me: d.currentUser, comments: d.comments.map(fix), votes: {}, next: max + 1 };
};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

const find = id => {
  for (const c of state.comments) {
    if (c.id === id) return { c, list: state.comments };
    const r = c.replies.find(r => r.id === id);
    if (r) return { c: r, list: c.replies, parent: c };
  }
};
const mention = c => (c.replyingTo ? `@${c.replyingTo} ` : '');
const strip = (text, name) => (name ? text.replace(new RegExp(`^@${name}\\b[,:]?\\s*`), '') : text);

const avatar = (el, u) => {
  $('source', el).srcset = u.image.webp;
  $('img', el).src = u.image.png;
};

const composer = (kind, value = '') => {
  const f = tpl('t-composer');
  f.dataset.kind = kind;
  avatar($('.avatar', f), state.me);
  $('textarea', f).value = value;
  $('button', f).textContent = kind === 'comment' ? 'Send' : 'Reply';
  return f;
};

function node(c) {
  const li = tpl('t-comment');
  const mine = c.user.username === state.me.username;
  li.dataset.id = c.id;
  avatar($('.avatar', li), c.user);
  $('.card__name', li).textContent = c.user.username;
  $('.badge', li).hidden = !mine;
  const t = $('time', li);
  t.dateTime = new Date(c.createdAt).toISOString();
  t.dataset.ts = c.createdAt;
  t.textContent = ago(c.createdAt);

  if (ui.mode === 'edit' && ui.id === c.id) {
    const f = tpl('t-edit');
    $('textarea', f).value = ui.draft ?? mention(c) + c.content;
    $('.card__body', li).replaceChildren(f);
  } else {
    const p = $('.card__text', li);
    if (c.replyingTo) {
      const m = document.createElement('span');
      m.className = 'mention';
      m.textContent = '@' + c.replyingTo;
      p.append(m, ' ');
    }
    p.append(c.content);
  }

  $('.votes__score', li).textContent = c.score;
  const v = state.votes[c.id] || 0;
  $('[data-act=up]', li).setAttribute('aria-pressed', v === 1);
  $('[data-act=down]', li).setAttribute('aria-pressed', v === -1);
  $('[data-act=reply]', li).hidden = mine;
  $('[data-act=delete]', li).hidden = !mine;
  $('[data-act=edit]', li).hidden = !mine;

  if (ui.mode === 'reply' && ui.id === c.id) {
    li.append(composer('reply', ui.draft ?? `@${c.user.username} `));
  }
  if (c.replies.length) {
    const ul = document.createElement('ul');
    ul.className = 'comment__replies';
    ul.append(...c.replies.map(node)); // replies stay in the order they were added
    li.append(ul);
  }
  return li;
}

function render() {
  root.replaceChildren(...[...state.comments].sort((a, b) => b.score - a.score).map(node));
  if (ui.focus) {
    const ta = $('.comment textarea', root);
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
    ui.focus = false;
  }
}

function vote(id, dir) {
  const { c } = find(id);
  const prev = state.votes[id] || 0;
  const next = prev === dir ? 0 : dir;
  c.score += next - prev;
  state.votes[id] = next;
  save();
  render();
  $(`[data-id="${id}"] [data-act=${dir === 1 ? 'up' : 'down'}]`, root)?.focus(); // keep keyboard position
}

root.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const id = +b.closest('.comment').dataset.id;
  const act = b.dataset.act;
  if (act === 'up' || act === 'down') return vote(id, act === 'up' ? 1 : -1);
  if (act === 'delete') { pending = id; dlg.returnValue = ''; return dlg.showModal(); }
  ui = ui.mode === act && ui.id === id ? {} : { mode: act, id, focus: true }; // click again to close
  render();
});

root.addEventListener('input', e => {
  if (e.target.matches('textarea')) ui.draft = e.target.value;
});

document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-kind]');
  if (!f) return;
  e.preventDefault();
  const ta = $('textarea', f);
  const kind = f.dataset.kind;
  let text = ta.value.trim();

  if (kind === 'comment') {
    if (!text) return ta.focus();
    state.comments.push({ id: state.next++, content: text, createdAt: Date.now(), score: 0, user: state.me, replies: [] });
  } else {
    const { c, parent } = find(+f.closest('.comment').dataset.id);
    text = strip(text, kind === 'reply' ? c.user.username : c.replyingTo);
    if (!text) return ta.focus();
    if (kind === 'edit') c.content = text;
    else (parent || c).replies.push({
      id: state.next++, content: text, createdAt: Date.now(), score: 0,
      user: state.me, replyingTo: c.user.username, replies: [],
    });
  }
  ui = {};
  save();
  render();
  if (kind === 'comment') ta.value = '';
});

dlg.addEventListener('close', () => {
  if (dlg.returnValue === 'delete' && pending !== null) {
    const { c, list } = find(pending);
    list.splice(list.indexOf(c), 1);
    ui = {};
    save();
    render();
  }
  pending = null;
});

setInterval(() => {
  document.querySelectorAll('time[data-ts]').forEach(t => (t.textContent = ago(+t.dataset.ts)));
}, 30000);

(async function init() {
  try { state = JSON.parse(localStorage.getItem(KEY)); } catch {}
  if (!state) {
    try {
      state = seed(await (await fetch('data.json')).json());
      save();
    } catch {
      root.textContent = 'Could not load data.json. Serve this folder over http (for example with "npx serve") instead of opening the file directly.';
      return;
    }
  }
  $('#new-comment').replaceChildren(composer('comment'));
  render();
})();
