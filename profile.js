
const usernameInput = document.getElementById("username-input");
const settingsPicture = document.getElementById("settings-picture");
const settingsPlaceholder = document.getElementById("settings-placeholder");
const settingsUpload = document.getElementById("settings-upload");
const saveButton = document.getElementById("save-profile");
const saveMessage = document.getElementById("save-message");

const USERNAME_KEY = "mangomath_username";
const PICTURE_KEY = "mangomath_profile_picture";

let selectedPicture = localStorage.getItem(PICTURE_KEY) || "";

// LOAD SAVED PROFILE

function loadProfile() {
  usernameInput.value =
    localStorage.getItem(USERNAME_KEY) || "";

  updatePreview();
}

// UPDATE PROFILE PICTURE PREVIEW

function updatePreview() {
  if (selectedPicture) {
    settingsPicture.src = selectedPicture;
    settingsPicture.style.display = "block";
    settingsPlaceholder.style.display = "none";
  } else {
    settingsPicture.style.display = "none";
    settingsPlaceholder.style.display = "block";
  }
}

// UPLOAD PROFILE PICTURE

settingsUpload.addEventListener("change", () => {
  const file = settingsUpload.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    settingsUpload.value = "";
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    alert("Please choose an image smaller than 3 MB.");
    settingsUpload.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    selectedPicture = reader.result;
    updatePreview();
    saveMessage.textContent = "Picture selected! Press Save Changes.";
  };

  reader.readAsDataURL(file);
  settingsUpload.value = "";
});

// SAVE PROFILE

saveButton.addEventListener("click", () => {
  const username = usernameInput.value.trim();

  if (!username) {
    saveMessage.textContent = "Please enter a username.";
    return;
  }

  try {
    localStorage.setItem(USERNAME_KEY, username);

    if (selectedPicture) {
      localStorage.setItem(PICTURE_KEY, selectedPicture);
    }

    saveMessage.textContent = "✓ Profile saved successfully!";
  } catch {
    saveMessage.textContent =
      "Couldn't save your picture. Try a smaller image.";
  }
});

loadProfile();
