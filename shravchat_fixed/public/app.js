const $ = s => document.querySelector(s);

const state = {
  me: JSON.parse(localStorage.getItem("shravchat_me") || "null"),
  chats: JSON.parse(localStorage.getItem("shravchat_chats") || "[]"),
  active: null,
  messages: {}
};

const API = {
  async post(path, body) {
    const r = await fetch(path, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || "Request failed");
    return data;
  }
};

function toast(text) {
  const el = $("#toast");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove("show"), 2500);
}

function save() {
  localStorage.setItem("shravchat_me", JSON.stringify(state.me));
  localStorage.setItem("shravchat_chats", JSON.stringify(state.chats));
}

function initials(name) {
  return (name || "?").trim().slice(0,1).toUpperCase();
}

function renderMe() {
  if (!state.me) return;
  $("#meName").textContent = state.me.name;
  $("#meId").textContent = state.me.id;
  $("#meAvatar").textContent = initials(state.me.name);
}

function renderChats() {
  const list = $("#chatList");
  list.innerHTML = "";
  if (!state.chats.length) {
    list.innerHTML = `<div class="empty">No chats yet.<br>Add someone using their IP.</div>`;
    return;
  }
  for (const chat of state.chats) {
    const el = document.createElement("div");
    el.className = "chat-item" + (state.active === chat.id ? " active" : "");
    el.innerHTML = `
      <div class="avatar">${escapeHtml(initials(chat.name))}</div>
      <div class="chat-copy">
        <strong>${escapeHtml(chat.name)}</strong>
        <small>${escapeHtml(chat.ip)}</small>
      </div>`;
    el.onclick = () => openChat(chat.id);
    list.appendChild(el);
  }
}

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function openChat(id) {
  state.active = id;
  const chat = state.chats.find(c => c.id === id);
  if (!chat) return;
  $("#chatName").textContent = chat.name;
  $("#chatStatus").textContent = `${chat.ip} · waiting for connection`;
  $("#chatAvatar").textContent = initials(chat.name);
  $("#renameBtn").disabled = false;
  $("#messageInput").disabled = false;
  $(".send").disabled = false;
  renderChats();
  renderMessages();
}

function renderMessages() {
  const box = $("#messages");
  const arr = state.messages[state.active] || [];
  if (!arr.length) {
    box.innerHTML = `<div class="welcome">
      <div class="welcome-logo">S</div>
      <h2>${escapeHtml(state.chats.find(c=>c.id===state.active)?.name || "Chat")}</h2>
      <p>Your conversation is ready. Messages will appear here.</p>
    </div>`;
    return;
  }
  box.innerHTML = arr.map(m => `
    <div>
      <div class="bubble-row ${m.mine ? "mine" : ""}">
        <div class="bubble">${renderContent(m)}</div>
      </div>
      <div class="meta ${m.mine ? "mine" : ""}">${new Date(m.time).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</div>
    </div>`).join("");
  box.scrollTop = box.scrollHeight;
}

function renderContent(m) {
  if (m.type === "image") return `<img src="${escapeHtml(m.content)}" alt="Image">`;
  if (m.type === "gif") return `<img src="${escapeHtml(m.content)}" alt="GIF">`;
  if (m.type === "sticker") return `<span style="font-size:34px">${escapeHtml(m.content)}</span>`;
  return escapeHtml(m.content).replace(/\n/g, "<br>");
}

async function createIdentity() {
  const name = $("#nameInput").value.trim();
  if (!name) return toast("Enter a name");
  try {
    const data = await API.post("/api/users", {name});
    state.me = data.user;
    await API.post("/api/register", {id: state.me.id, name: state.me.name});
    save();
    renderMe();
    $("#setupModal").classList.add("hidden");
    toast("Your ShravChat identity is ready");
  } catch (e) {
    toast(e.message);
  }
}

async function addByIp() {
  const ip = $("#ipInput").value.trim();
  if (!ip) return toast("Enter an IP address");
  if (!state.me) return toast("Create your identity first");
  if (state.chats.some(c => c.ip === ip)) return toast("That chat already exists");
  try {
    const data = await API.post("/api/lookup", {ip, requester: state.me.id});
    const chat = {
      id: data.user.id,
      ip,
      name: data.user.name || ip,
      addedAt: Date.now()
    };
    state.chats.unshift(chat);
    save();
    $("#ipInput").value = "";
    openChat(chat.id);
    toast(data.user.online ? "Chat added" : "Chat added — recipient is offline");
  } catch (e) {
    toast(e.message);
  }
}

async function send(type, content) {
  if (!state.active || !state.me) return;
  const chat = state.chats.find(c => c.id === state.active);
  if (!chat) return;
  try {
    const data = await API.post("/api/message", {
      sender: state.me.id,
      recipient: chat.id,
      type,
      content
    });
    const m = {...data.message, mine:true, time:Date.now()};
    (state.messages[state.active] ||= []).push(m);
    renderMessages();
  } catch (e) {
    toast(e.message);
  }
}

$("#createBtn").onclick = createIdentity;
$("#addBtn").onclick = addByIp;
$("#ipInput").onkeydown = e => { if (e.key === "Enter") addByIp(); };

$("#composer").onsubmit = e => {
  e.preventDefault();
  const input = $("#messageInput");
  const value = input.value.trim();
  if (!value) return;
  send("text", value);
  input.value = "";
};

$("#imageBtn").onclick = () => $("#imagePicker").click();
$("#imagePicker").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) return toast("Image must be under 4 MB");
  const reader = new FileReader();
  reader.onload = () => send("image", reader.result);
  reader.readAsDataURL(file);
  e.target.value = "";
};

$("#gifBtn").onclick = () => {
  const url = prompt("Paste a GIF URL");
  if (url) send("gif", url);
};

$("#stickerBtn").onclick = () => {
  const sticker = prompt("Choose a sticker: 😀 😂 ❤️ 🔥 👍 🎉 😎");
  if (sticker) send("sticker", sticker.slice(0, 2));
};

$("#renameBtn").onclick = () => {
  const chat = state.chats.find(c => c.id === state.active);
  if (!chat) return;
  $("#renameInput").value = chat.name;
  $("#renameModal").classList.remove("hidden");
  $("#renameInput").focus();
};

$("#renameCancel").onclick = () => $("#renameModal").classList.add("hidden");

$("#renameSave").onclick = () => {
  const chat = state.chats.find(c => c.id === state.active);
  const name = $("#renameInput").value.trim();
  if (!chat || !name) return;
  chat.name = name;
  save();
  $("#renameModal").classList.add("hidden");
  openChat(chat.id);
};

$("#settingsBtn").onclick = () => {
  if (!state.me) return;
  alert(`Your ShravChat ID is:\\n\\n${state.me.id}\\n\\nGive this ID to someone if you want to move away from IP-based discovery.`);
};

if (!state.me) {
  $("#setupModal").classList.remove("hidden");
} else {
  renderMe();
  renderChats();
}
