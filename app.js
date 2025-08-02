const toast = document.getElementById('toast');
const form  = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const resultCard = document.getElementById('result');
const videoPlayer = document.getElementById('videoPlayer');

/* ---------- Notification Toast ---------- */
function showToast(msg, type = 'info') {
  toast.textContent = msg;
  toast.className = `fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl transition-all
                     ${type === 'error' ? 'bg-red-600' : 'bg-sky-600'} text-white`;
  gsap.to(toast, { opacity: 1, y: 0, duration: 0.3, onComplete: () => {
    setTimeout(() => gsap.to(toast, { opacity: 0, y: -20, duration: 0.3 }), 2500);
  }});
}

/* ---------- Main Flow ---------- */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = fileInput.files[0];
  if (!file) return showToast('Please select an image', 'error');

  showToast('Uploading image…');
  const formData = new FormData();
  formData.append('file', file);

  try {
    // 1️⃣ Upload image
    const upRes = await fetch('https://cloudgood.xyz/upload.php', {
      method: 'POST',
      body: formData
    }).then(r => r.json());
    if (!upRes.url) throw new Error('Upload failed');

    showToast('Searching episode…');
    // 2️⃣ Trace anime
    const traceRes = await fetch(
      `https://apii.baguss.web.id/search/epanime?apikey=bagus&url=${encodeURIComponent(upRes.url)}`
    ).then(r => r.json());
    if (!traceRes.success) throw new Error(traceRes.message || 'Not found');

    // 3️⃣ Render result
    const { filename, episode, video } = traceRes;
    document.getElementById('title').textContent = filename;
    document.getElementById('episode').textContent = `Episode ${episode}`;
    videoPlayer.src = video;
    document.getElementById('downloadBtn').href = video;
    resultCard.classList.remove('hidden');
    gsap.from('#result', { scale: 0.95, opacity: 0, duration: 0.4 });
    showToast('Episode found!', 'success');

  } catch (err) {
    console.error(err);
    showToast(err.message || 'Something went wrong', 'error');
  }
});
