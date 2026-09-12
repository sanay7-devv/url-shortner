//async functions for backend 
const API_BASE_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://url-shortner-126s.onrender.com"; //locally run and then to be replaced after being deployed

// ---- Element references ----
const form = document.getElementById("shorten-form");
const urlInput = document.getElementById("url-input");
const customCodeInput = document.getElementById("custom-code-input");
const toggleCustomBtn = document.getElementById("toggle-custom");
const customCodeRow = document.getElementById("custom-code-row");
const submitBtn = document.getElementById("submit-btn");
const errorMsg = document.getElementById("form-error");

const ticket = document.getElementById("result-ticket");
const resultShortUrl = document.getElementById("result-short-url");
const resultOriginalUrl = document.getElementById("result-original-url");
const resultClicks = document.getElementById("result-clicks");
const copyBtn = document.getElementById("copy-btn");

const recentList = document.getElementById("recent-list");
const recentEmpty = document.getElementById("recent-empty");
const refreshBtn = document.getElementById("refresh-btn");

//gHelpers
function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("hidden");
}

function clearError() {
  errorMsg.textContent = "";
  errorMsg.classList.add("hidden");
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.querySelector(".btn-label").textContent = isLoading ? "Snipping..." : "Snip it";
}

function isLikelyUrl(value) {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function renderTicket(data) {
  resultShortUrl.href = data.shortUrl;
  resultShortUrl.textContent = data.shortUrl.replace(/^https?:\/\//, "");
  resultOriginalUrl.textContent = data.originalUrl;
  resultClicks.textContent = data.clicks ?? 0;
  copyBtn.textContent = "Copy link";
  copyBtn.classList.remove("copied");
  ticket.dataset.url = data.shortUrl;
  ticket.classList.remove("hidden");
}

function renderRecentList(items) {
  recentList.innerHTML = "";

  if (!items || items.length === 0) {
    recentEmpty.classList.remove("hidden");
    return;
  }
  recentEmpty.classList.add("hidden");

  for (const item of items) {
    const li = document.createElement("li");
    li.className = "recent-item";
    li.innerHTML = `
      <div class="recent-item-main">
        <a class="recent-item-code" href="${item.shortUrl}" target="_blank" rel="noopener">
          ${item.shortUrl.replace(/^https?:\/\//, "")}
        </a>
        <p class="recent-item-original">${item.originalUrl}</p>
      </div>
      <span class="recent-item-clicks">${item.clicks} click${item.clicks === 1 ? "" : "s"}</span>
    `;
    recentList.appendChild(li);
  }
}

async function loadRecentUrls() { //async functions are the functions in which we can run
  //the browser without pausing it
  try {
    const res = await fetch(`${API_BASE_URL}/api/urls`);
    if (!res.ok) return; // fail quietly, this is a non-critical panel
    const items = await res.json();
    renderRecentList(items);
  } 
  catch {
    // Backend might not be deployed yet during local dev without it running -
    // don't block the rest of the page on this.
  }
}

//Event listeners
toggleCustomBtn.addEventListener("click", () => {
  const isHidden = customCodeRow.classList.contains("hidden");
  customCodeRow.classList.toggle("hidden"); //adds the class if not there
  toggleCustomBtn.textContent = isHidden ? "- custom code" : "+ custom code";
  if (isHidden) customCodeInput.focus();
});

copyBtn.addEventListener("click", async () => {
  const url = ticket.dataset.url;
  if (!url) return; 
  //try an catch are the methods by which we do this 
  try 
  {
    await navigator.clipboard.writeText(url);
    copyBtn.textContent = "Copied!"; //we are copying this directly to the clipboard
    copyBtn.classList.add("copied");
    setTimeout(() => {
      copyBtn.textContent = "Copy link";
      copyBtn.classList.remove("copied");
    }, 1900); //this just creates a delay of 1.9 seconds after that we can again copy the link
  } catch {
    showError("Couldn't copy automatically — select and copy the link manually.");
  }
});

refreshBtn.addEventListener("click", loadRecentUrls);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const originalUrl = urlInput.value.trim();
  const customCode = customCodeInput.value.trim();

  if (!isLikelyUrl(originalUrl)) {
    showError("That doesn't look like a valid http:// or https:// URL.");
    urlInput.focus();
    return;
  }

  setLoading(true);
  ticket.classList.add("hidden");

  try {
    const res = await fetch(`${API_BASE_URL}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalUrl,
        ...(customCode ? { customCode } : {}),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Something went wrong. Please try again.");
      return;
    }

    renderTicket(data);
    urlInput.value = "";
    customCodeInput.value = "";
    loadRecentUrls();
  } catch (err) {
    showError(
      "Couldn't reach the server. Check your connection, or that the backend is deployed and running."
    );
  } finally {
    setLoading(false);
  }
});

//Initialising
loadRecentUrls();
