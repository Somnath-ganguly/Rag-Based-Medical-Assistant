// Medical Assistant Chatbot - Frontend Controller

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const sidebar = document.getElementById('sidebar');
  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const clearChatBtn = document.getElementById('clear-chat-btn');
  const messagesContainer = document.getElementById('messages-container');
  const welcomeScreen = document.getElementById('welcome-screen');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');

  // Upload Elements
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const selectedFilesList = document.getElementById('selected-files-list');
  const uploadBtn = document.getElementById('upload-btn');

  // API Config Elements
  const apiConfigToggle = document.getElementById('api-config-toggle');
  const apiConfigPanel = document.getElementById('api-config-panel');
  const configChevron = document.getElementById('config-chevron');
  const apiBaseUrlInput = document.getElementById('api-base-url');
  const toastContainer = document.getElementById('toast-container');

  // State Management
  let selectedFiles = [];
  let isProcessing = false;

  // Get current API Base URL
  function getApiBaseUrl() {
    let url = apiBaseUrlInput ? apiBaseUrlInput.value.trim() : '';
    if (!url) url = 'https://medical-chatbot-backend-4ipf.onrender.com';
    return url.replace(/\/+$/, ''); // Strip trailing slashes
  }

  // Toast Notifications
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconClass = 'fa-circle-info';
    if (type === 'error') iconClass = 'fa-circle-exclamation';
    if (type === 'success') iconClass = 'fa-circle-check';

    toast.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <i class="fa-solid ${iconClass}"></i>
        <span>${escapeHtml(message)}</span>
      </div>
      <button style="background:none; border:none; color:inherit; cursor:pointer;" onclick="this.parentElement.remove()">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4000);
  }

  // HTML Sanitization
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Dark / Light Theme Toggle
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);

    const icon = themeToggleBtn.querySelector('i');
    icon.className = newTheme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  });

  // Mobile Sidebar Toggle
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // API Config Toggle Collapsible
  if (apiConfigToggle && apiConfigPanel) {
    apiConfigToggle.addEventListener('click', () => {
      const isHidden = apiConfigPanel.style.display === 'none';
      apiConfigPanel.style.display = isHidden ? 'flex' : 'none';
      if (configChevron) {
        configChevron.className = isHidden ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
      }
    });
  }

  // Input Auto-resize & Enable/Disable Send Button
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 120)}px`;
    sendBtn.disabled = !chatInput.value.trim() || isProcessing;
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        chatForm.dispatchEvent(new Event('submit'));
      }
    }
  });

  // File Upload Handlers (Drag & Drop + Select)
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(Array.from(e.target.files));
      }
    });
  }

  function handleFiles(files) {
    const pdfFiles = files.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length < files.length) {
      showToast('Only PDF files are supported.', 'error');
    }

    // Add unique files to selection
    pdfFiles.forEach(file => {
      if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        selectedFiles.push(file);
      }
    });

    renderSelectedFiles();
  }

  function renderSelectedFiles() {
    if (!selectedFilesList) return;
    selectedFilesList.innerHTML = '';
    selectedFiles.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `
        <span class="file-name"><i class="fa-solid fa-file-pdf" style="color:var(--accent-primary); margin-right:6px;"></i>${escapeHtml(file.name)}</span>
        <button class="remove-file" data-index="${index}" title="Remove file">
          <i class="fa-solid fa-xmark"></i>
        </button>
      `;
      selectedFilesList.appendChild(item);
    });

    // Add click event to remove buttons
    document.querySelectorAll('.remove-file').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'));
        selectedFiles.splice(idx, 1);
        renderSelectedFiles();
      });
    });

    if (uploadBtn) uploadBtn.disabled = selectedFiles.length === 0 || isProcessing;
  }

  // Upload PDFs API Call (`POST /upload_pdfs/`)
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      if (selectedFiles.length === 0 || isProcessing) return;

      const baseUrl = getApiBaseUrl();
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      uploadBtn.disabled = true;
      uploadBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading & Embedding...`;

      try {
        const response = await fetch(`${baseUrl}/upload_pdfs/`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          showToast(data.messages || 'Documents successfully processed and added to vectorstore!', 'success');
          selectedFiles = [];
          if (fileInput) fileInput.value = '';
          renderSelectedFiles();
        } else {
          const errorMsg = data.error || data.detail || 'Failed to upload documents.';
          showToast(`Upload Error: ${errorMsg}`, 'error');
        }
      } catch (err) {
        console.error('Upload API Error:', err);
        showToast(`Network Error: Unable to connect to backend at ${baseUrl}`, 'error');
      } finally {
        uploadBtn.innerHTML = `<i class="fa-solid fa-upload"></i> Upload & Embed PDFs`;
        uploadBtn.disabled = selectedFiles.length === 0;
      }
    });
  }

  // Prompt Chips & Welcome Cards Handler
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.prompt-chip') || e.target.closest('.welcome-card');
    if (chip) {
      const promptText = chip.getAttribute('data-prompt');
      if (promptText) {
        chatInput.value = promptText;
        chatInput.style.height = 'auto';
        chatInput.style.height = `${Math.min(chatInput.scrollHeight, 120)}px`;
        sendBtn.disabled = false;
        chatForm.dispatchEvent(new Event('submit'));
      }
    }
  });

  // Clear Chat History
  clearChatBtn.addEventListener('click', () => {
    messagesContainer.innerHTML = '';
    messagesContainer.appendChild(welcomeScreen);
    welcomeScreen.style.display = 'flex';
    showToast('Chat history cleared.', 'info');
  });

  // Render User Message
  function appendUserMessage(text) {
    if (welcomeScreen.style.display !== 'none') {
      welcomeScreen.style.display = 'none';
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `
      <div class="avatar"><i class="fa-solid fa-user"></i></div>
      <div class="message-content">
        <div class="bubble">${escapeHtml(text)}</div>
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
  }

  // Render Typing Indicator Indicator for Bot
  function appendTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="avatar"><i class="fa-solid fa-robot"></i></div>
      <div class="message-content">
        <div class="bubble">
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
    return typingDiv;
  }

  // Render Assistant Message with Sources Citations
  function appendAssistantMessage(responseText, sources = []) {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';

    let sourcesHtml = '';
    if (Array.isArray(sources) && sources.length > 0) {
      const badges = sources.map(src => {
        const fileName = escapeHtml(src.file || 'Document');
        const pageNum = src.page !== null && src.page !== undefined ? `<span class="page-tag">p. ${src.page}</span>` : '';
        return `
          <div class="source-badge">
            <i class="fa-solid fa-file-pdf"></i>
            <span>${fileName}</span>
            ${pageNum}
          </div>
        `;
      }).join('');

      sourcesHtml = `
        <div class="sources-container">
          <div class="sources-header">
            <i class="fa-solid fa-bookmark"></i> Source References (${sources.length})
          </div>
          <div class="sources-list">
            ${badges}
          </div>
        </div>
      `;
    }

    messageDiv.innerHTML = `
      <div class="avatar"><i class="fa-solid fa-user-doctor"></i></div>
      <div class="message-content">
        <div class="bubble">${escapeHtml(responseText)}</div>
        ${sourcesHtml}
      </div>
    `;

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
  }

  // Scroll Chat to Bottom
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Submit Question Handler (`POST /ask/`)
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query || isProcessing) return;

    // Set Processing state
    isProcessing = true;
    sendBtn.disabled = true;
    chatInput.disabled = true;

    appendUserMessage(query);
    chatInput.value = '';
    chatInput.style.height = 'auto';

    appendTypingIndicator();

    const baseUrl = getApiBaseUrl();
    const formData = new FormData();
    formData.append('question', query);

    try {
      const response = await fetch(`${baseUrl}/ask/`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        const answerText = data.response || 'No response returned.';
        const sources = data.sources || [];
        appendAssistantMessage(answerText, sources);
      } else {
        const errorMsg = data.error || data.detail || 'Error processing your medical query.';
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();

        appendAssistantMessage(`⚠️ Server Error: ${errorMsg}`);
        showToast(`Backend Error: ${errorMsg}`, 'error');
      }
    } catch (err) {
      console.error('Ask API Error:', err);
      const indicator = document.getElementById('typing-indicator');
      if (indicator) indicator.remove();

      appendAssistantMessage(`⚠️ Unable to connect to backend server at ${baseUrl}. Please ensure FastAPI is running.`);
      showToast(`Network Error: Failed to reach ${baseUrl}/ask/`, 'error');
    } finally {
      isProcessing = false;
      chatInput.disabled = false;
      chatInput.focus();
    }
  });
});
