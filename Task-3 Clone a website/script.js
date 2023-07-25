const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");
const chatContainer = document.querySelector(".chat-container");

let userText = null;
const initialHeight = chatInput.scrollHeight;
const API_KEY = "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";

const loadDataFromLocalStorage = () => {
  const themeColor = localStorage.getItem("theme-color");
  document.body.classList.toggle("light-mode", themeColor === "light_mode");
  themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

  const defaultText = `<div class="default-text">
  <h1>ChatGPT Clone</h1>
  <p>Start the conversation and Ask anything you want to.<br>Your chat history will be displayed here.</p>
  </div>`

  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
}
loadDataFromLocalStorage();

const createElement = (html, className) => {
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = html;
  return chatDiv;
}
const getChatResponse = async (incomingChatDiv) => {
  const API_URL = "https://api.openai.com/v1/completions";
  const pElement = document.createElement("p");

  const requestOption = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      "model": "text-davinci-003",
      "prompt": userText,
      "max_tokens": 2048,
      "temperature": 0.2,
      "n": 1,
      "stop": null
    })
  }
  try {
    const response = await (await fetch(API_URL, requestOption)).json();
    pElement.textContent = response.choices[0].text.trim();
  } catch (error) {
    pElement.classList.add("error");
    pElement.textContent = "Oops something went wrong while retrieving the response. Please try again."
  }
  incomingChatDiv.querySelector(".typing-animation").remove();
  incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  localStorage.setItem("all-chats", chatContainer.innerHTML);
}

const copyResponse = (copyBtn) => {
  const responseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(responseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

const showTypingAnimation = () => {
  const html = `<div class="chat-content">
  <div class="chat-details">
    <img src="chatbot.jpg" alt="chatbot-img" />
    <div class="typing-animation">
      <div class="typing-dot" style="--delay: 0.2s"></div>
      <div class="typing-dot" style="--delay: 0.3s"></div>
      <div class="typing-dot" style="--delay: 0.4s"></div>
    </div>
  </div>
  <span onClick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
</div>`;
  const incomingChatDiv = createElement(html, "incoming");
  chatContainer.appendChild(incomingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  getChatResponse(incomingChatDiv);
}

const handleOutgoingChat = () => {
  userText = chatInput.value.trim();
  if (!userText) return;
  chatInput.style.height = `${initialHeight}px`;
  chatInput.value = "";
  const html = `<div class="chat-content">
    <div class="chat-details">
      <img src="user.jpg" alt="user-img" />
      <p>
        
      </p>
    </div>
  </div>`;
  const outgoingChatDiv = createElement(html, "outgoing");
  outgoingChatDiv.querySelector("p").textContent = userText;
  chatContainer.appendChild(outgoingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showTypingAnimation, 500);
  document.querySelector(".default-text").remove();
}

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("theme-color", themeButton.innerText);
  themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

deleteButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all chats?")) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalStorage();
  }
});

chatInput.addEventListener("input", () => {
  chatInput.style.height = `${initialHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleOutgoingChat();
  }
});

sendButton.addEventListener("click", handleOutgoingChat);