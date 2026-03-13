
//User profile loader
(async () => {
  try {
    const res = await fetch('/api/me', { credentials: 'same-origin' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    if (!res.ok) throw new Error('Failed to load user data');
    const data = await res.json();
    const { fullname, email } = data.user;
    document.getElementById('sidebar-fullname').textContent = fullname;
    document.getElementById('header-fullname').textContent = fullname;
    document.getElementById('full-name').value = fullname;
    document.getElementById('user-email').value = email;
  } catch (err) {
    console.error('Profile load error:', err);
  }
})();

//State 
let _pendingDeleteId = null;
let _editingId = null;

//Helpers 
function showModal(id) {
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  el.classList.add('flex');
  document.body.classList.add('overflow-hidden');
}
function hideModal(id) {
  const el = document.getElementById(id);
  el.classList.add('hidden');
  el.classList.remove('flex');
  document.body.classList.remove('overflow-hidden');
}

//Edit Email Modal
function openEmailModal() {
  const currentEmail = document.getElementById('user-email').value;
  document.getElementById('edit-email-input').value = currentEmail;
  document.getElementById('email-error').classList.add('hidden');
  showModal('email-modal');
}

function closeEmailModal() {
  hideModal('email-modal');
}

async function handleEmailSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById('email-error');
  const newEmail = document.getElementById('edit-email-input').value.trim();
  errEl.classList.add('hidden');

  // Frontend Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!newEmail) {
    errEl.textContent = 'Email address is required.';
    errEl.classList.remove('hidden');
    return;
  }
  if (!emailRegex.test(newEmail)) {
    errEl.textContent = 'Please enter a valid email address.';
    errEl.classList.remove('hidden');
    return;
  }

  const btn = document.getElementById('email-submit-btn');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<svg class="animate-spin w-4 h-4 inline-block mr-2" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="60" stroke-dashoffset="20"/></svg> Processing...`;

  try {
    const response = await fetch('/profile/change-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newEmail })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      window.location.href = data.redirectUrl || '/profile/email-otp';
    } else {
      errEl.textContent = data.message || 'Failed to update email. Please try again.';
      errEl.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error submitting email:', error);
    errEl.textContent = 'An error occurred. Please try again.';
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

async function uploadProfileImage(event) {

  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("profileImage", file);

  const res = await fetch("/profile/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  if (data.success) {

    const preview = document.getElementById("profileImagePreview");

    preview.style.backgroundImage =
      `url('${data.imageUrl}?t=${new Date().getTime()}')`;

  } else {
    alert(data.message);
  }

}


