
/* =========================================
   MANGOMATH - COMPLETE MAIN SCRIPT
========================================= */

const TOTAL_QUESTIONS = 20;

let selectedDifficulty = "all";
let questions = [];
let currentQuestion = 0;
let score = 0;
let answered = false;
let currentQuizXP = 0;

const XP_KEY = "mangomath_xp";
const PRESTIGE_KEY = "mangomath_prestige";
const HISTORY_KEY = "mangomath_history";
const STREAK_KEY = "mangomath_streak";
const ACHIEVEMENTS_KEY = "mangomath_achievements";
const EQUIPPED_BADGE_KEY = "mangomath_equipped_badge";

/* =========================================
   ELEMENTS
========================================= */

const setupScreen = document.getElementById("setup-screen");
const gameScreen = document.getElementById("game-screen");
const resultsScreen = document.getElementById("results-screen");

const startButton = document.getElementById("start-quiz");
const nextButton = document.getElementById("next-question");
const playAgainButton = document.getElementById("play-again");

const questionCount = document.getElementById("question-count");
const scoreDisplay = document.getElementById("score");
const progressBar = document.getElementById("progress-bar");
const difficultyLabel = document.getElementById("difficulty-label");
const questionDisplay = document.getElementById("question");
const answersContainer = document.getElementById("answers");
const feedback = document.getElementById("feedback");

const difficultyButtons = document.querySelectorAll(".difficulty");

/* =========================================
   SAFE STORAGE HELPERS
========================================= */

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function getQuizHistory() {
  const history = readJSON(HISTORY_KEY, []);
  return Array.isArray(history) ? history : [];
}

function getUnlockedAchievements() {
  const unlocked = readJSON(ACHIEVEMENTS_KEY, []);
  return Array.isArray(unlocked) ? unlocked : [];
}

function saveUnlockedAchievements(unlocked) {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
}

/* =========================================
   XP AND LEVELING
========================================= */

function getTotalXP() {
  const xp = Number(localStorage.getItem(XP_KEY));
  return Number.isFinite(xp) && xp > 0 ? xp : 0;
}

function getXPNeededForLevel(level) {
  return 100 + (level - 1) * 50;
}

function getLevelData(totalXP = getTotalXP()) {
  let level = 1;
  let remainingXP = Math.max(0, Number(totalXP) || 0);
  let xpNeeded = getXPNeededForLevel(level);

  while (remainingXP >= xpNeeded) {
    remainingXP -= xpNeeded;
    level++;
    xpNeeded = getXPNeededForLevel(level);
  }

  return {
    level,
    currentXP: remainingXP,
    nextLevelXP: xpNeeded,
    percentage: (remainingXP / xpNeeded) * 100
  };
}

function showLevelUp(newLevel) {
  const toast = document.getElementById("level-up-toast");
  const message = document.getElementById("level-up-message");

  if (!toast || !message) return;

  message.textContent = `You reached Level ${newLevel}!`;
  toast.hidden = false;
  toast.classList.remove("show");

  requestAnimationFrame(() => toast.classList.add("show"));

  clearTimeout(window.mangoLevelToastTimer);

  window.mangoLevelToastTimer = setTimeout(() => {
    toast.classList.remove("show");

    setTimeout(() => {
      toast.hidden = true;
    }, 300);
  }, 3500);
}

function addXP(amount) {
  if (!Number.isFinite(amount) || amount <= 0) return;

  const oldLevel = getLevelData().level;
  const newTotal = getTotalXP() + amount;

  localStorage.setItem(XP_KEY, String(newTotal));

  const newLevel = getLevelData(newTotal).level;

  updateXPDisplay();

  if (newLevel > oldLevel) {
    showLevelUp(newLevel);
  }

  updateAchievements();
  updateProfileBadge();
  updateDevConsole();
}

function updateXPDisplay() {
  const totalXP = getTotalXP();
  const data = getLevelData(totalXP);

  const profileLevel = document.getElementById("profile-level");
  const levelDisplay = document.getElementById("xp-level-display");
  const totalXPDisplay = document.getElementById("total-xp");
  const xpToNext = document.getElementById("xp-to-next");
  const progress = document.getElementById("xp-progress-bar");
  const currentProgress = document.getElementById("xp-current-progress");
  const nextProgress = document.getElementById("xp-next-progress");

  if (profileLevel) {
    profileLevel.textContent = `LEVEL ${data.level}`;
  }

  if (levelDisplay) {
    levelDisplay.textContent = `LEVEL ${data.level}`;
  }

  if (totalXPDisplay) {
    totalXPDisplay.textContent = `${totalXP.toLocaleString()} XP`;
  }

  if (xpToNext) {
    xpToNext.textContent =
      `${data.nextLevelXP - data.currentXP} XP to next level`;
  }

  if (progress) {
    progress.style.width = `${data.percentage}%`;
  }

  if (currentProgress) {
    currentProgress.textContent = `${data.currentXP} XP`;
  }

  if (nextProgress) {
    nextProgress.textContent = `${data.nextLevelXP} XP`;
  }

  updatePrestigeDisplay();
}

/* =========================================
   PRESTIGE SYSTEM
========================================= */

function getPrestige() {
  const value = Number(localStorage.getItem(PRESTIGE_KEY)) || 0;
  return Math.min(20, Math.max(0, Math.floor(value)));
}

function updatePrestigeDisplay() {
  const count = document.getElementById("prestige-count");
  const button = document.getElementById("prestige-button");
  const status = document.getElementById("prestige-status");

  const prestige = getPrestige();
  const level = getLevelData().level;

  if (count) {
    count.textContent = `PRESTIGE ${prestige}`;
  }

  if (!button) return;

  if (prestige >= 20) {
    button.disabled = true;
    button.textContent = "🏆 MAX PRESTIGE REACHED";

    if (status) {
      status.textContent = "You've completed all 20 prestige levels!";
    }
  } else if (level >= 20) {
    button.disabled = false;
    button.textContent = `🏆 PRESTIGE ${prestige + 1}`;

    if (status) {
      status.textContent =
        "You're ready! Prestige to earn your permanent badge.";
    }
  } else {
    button.disabled = true;
    button.textContent = "🔒 REACH LEVEL 20";

    if (status) {
      status.textContent =
        `Reach Level 20 to unlock Prestige ${prestige + 1}.`;
    }
  }
}

function performPrestige() {
  const level = getLevelData().level;
  const prestige = getPrestige();

  if (level < 20 || prestige >= 20) return;

  const nextPrestige = prestige + 1;

  const confirmed = confirm(
    `Are you sure you want to prestige?\n\n` +
    `Your XP will reset to 0 and your level will return to 1.\n` +
    `You will keep all your unlocked badges and earn Prestige ${nextPrestige}.`
  );

  if (!confirmed) return;

  localStorage.setItem(PRESTIGE_KEY, String(nextPrestige));
  localStorage.setItem(XP_KEY, "0");

  updateXPDisplay();
  updateAchievements();
  updateProfileBadge();
  updateDevConsole();

  const toast = document.getElementById("level-up-toast");
  const message = document.getElementById("level-up-message");

  if (toast && message) {
    message.textContent = `You unlocked Prestige ${nextPrestige}!`;
    toast.hidden = false;
    toast.classList.add("show");

    clearTimeout(window.mangoLevelToastTimer);

    window.mangoLevelToastTimer = setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.hidden = true;
      }, 300);
    }, 4000);
  }
}

const prestigeButton = document.getElementById("prestige-button");

if (prestigeButton) {
  prestigeButton.addEventListener("click", performPrestige);
}

/* =========================================
   DIFFICULTY SELECTION
========================================= */

difficultyButtons.forEach(button => {
  button.addEventListener("click", () => {
    difficultyButtons.forEach(item => {
      item.classList.remove("selected");
    });

    button.classList.add("selected");
    selectedDifficulty = button.dataset.level;
  });
});

/* =========================================
   QUESTION GENERATION
========================================= */

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomNumber(0, i);
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function createQuestion(level) {
  let a;
  let b;
  let operator;
  let answer;

  if (level === "easy") {
    operator = ["+", "-"][randomNumber(0, 1)];
    a = randomNumber(1, 30);
    b = randomNumber(1, 30);

    if (operator === "-" && b > a) {
      [a, b] = [b, a];
    }

    answer = operator === "+" ? a + b : a - b;
  }

  if (level === "medium") {
    operator = ["+", "-", "×", "÷"][randomNumber(0, 3)];

    if (operator === "+") {
      a = randomNumber(10, 100);
      b = randomNumber(10, 100);
      answer = a + b;
    }

    if (operator === "-") {
      a = randomNumber(20, 150);
      b = randomNumber(1, a);
      answer = a - b;
    }

    if (operator === "×") {
      a = randomNumber(2, 12);
      b = randomNumber(2, 12);
      answer = a * b;
    }

    if (operator === "÷") {
      b = randomNumber(2, 12);
      answer = randomNumber(2, 12);
      a = b * answer;
    }
  }

  if (level === "hard") {
    operator = ["+", "-", "×", "÷"][randomNumber(0, 3)];

    if (operator === "+") {
      a = randomNumber(100, 999);
      b = randomNumber(100, 999);
      answer = a + b;
    }

    if (operator === "-") {
      a = randomNumber(200, 999);
      b = randomNumber(50, a);
      answer = a - b;
    }

    if (operator === "×") {
      a = randomNumber(12, 35);
      b = randomNumber(12, 35);
      answer = a * b;
    }

    if (operator === "÷") {
      b = randomNumber(5, 25);
      answer = randomNumber(5, 30);
      a = b * answer;
    }
  }

  return {
    text: `${a} ${operator} ${b} = ?`,
    answer,
    level
  };
}

function generateQuestions() {
  questions = [];

  const levels = [];

  if (selectedDifficulty === "all") {
    for (let i = 0; i < 7; i++) levels.push("easy");
    for (let i = 0; i < 7; i++) levels.push("medium");
    for (let i = 0; i < 6; i++) levels.push("hard");
  } else {
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      levels.push(selectedDifficulty);
    }
  }

  shuffle(levels);

  levels.forEach(level => {
    questions.push(createQuestion(level));
  });
}

/* =========================================
   ANSWER CHOICES
========================================= */

function generateAnswers(correctAnswer) {
  const choices = [correctAnswer];

  while (choices.length < 4) {
    const difference = randomNumber(1, 15);

    let wrongAnswer = correctAnswer +
      (Math.random() < 0.5 ? difference : -difference);

    if (wrongAnswer < 0) {
      wrongAnswer = correctAnswer + difference;
    }

    if (!choices.includes(wrongAnswer)) {
      choices.push(wrongAnswer);
    }
  }

  return shuffle(choices);
}

/* =========================================
   START QUIZ
========================================= */

startButton.addEventListener("click", startQuiz);

function startQuiz() {
  currentQuestion = 0;
  score = 0;
  answered = false;
  currentQuizXP = 0;

  generateQuestions();

  setupScreen.hidden = true;
  resultsScreen.hidden = true;
  gameScreen.hidden = false;

  scoreDisplay.textContent = "0";

  displayQuestion();
}

/* =========================================
   DISPLAY QUESTION
========================================= */

function displayQuestion() {
  answered = false;

  const question = questions[currentQuestion];

  questionCount.textContent =
    `QUESTION ${currentQuestion + 1} / ${TOTAL_QUESTIONS}`;

  scoreDisplay.textContent = score;

  progressBar.style.width =
    `${(currentQuestion / TOTAL_QUESTIONS) * 100}%`;

  difficultyLabel.textContent = question.level.toUpperCase();
  questionDisplay.textContent = question.text;

  feedback.textContent = "Choose your answer above.";
  feedback.style.color = "";

  nextButton.hidden = true;
  nextButton.textContent =
    currentQuestion === TOTAL_QUESTIONS - 1
      ? "View Results →"
      : "Next Question →";

  answersContainer.innerHTML = "";

  const choices = generateAnswers(question.answer);

  choices.forEach(choice => {
    const button = document.createElement("button");

    button.className = "answer-button";
    button.textContent = choice;

    button.addEventListener("click", () => {
      selectAnswer(button, choice);
    });

    answersContainer.appendChild(button);
  });
}

/* =========================================
   SELECT ANSWER
========================================= */

function selectAnswer(button, selectedAnswer) {
  if (answered) return;

  answered = true;

  const correctAnswer = questions[currentQuestion].answer;
  const answerButtons =
    answersContainer.querySelectorAll(".answer-button");

  answerButtons.forEach(answerButton => {
    answerButton.disabled = true;

    if (Number(answerButton.textContent) === correctAnswer) {
      answerButton.classList.add("correct");
    }
  });

  if (selectedAnswer === correctAnswer) {
    score++;
    scoreDisplay.textContent = score;

    feedback.textContent = "Correct! Great job! 🎉";
    feedback.style.color = "#a9ff68";

    addXP(10);
    currentQuizXP += 10;
  } else {
    button.classList.add("incorrect");

    feedback.textContent =
      `Not quite! The correct answer was ${correctAnswer}.`;

    feedback.style.color = "#ff7777";
  }

  progressBar.style.width =
    `${((currentQuestion + 1) / TOTAL_QUESTIONS) * 100}%`;

  nextButton.hidden = false;
}

/* =========================================
   NEXT QUESTION AND ENTER KEY
========================================= */

nextButton.addEventListener("click", nextQuestion);

function nextQuestion() {
  if (!answered) return;

  currentQuestion++;

  if (currentQuestion >= TOTAL_QUESTIONS) {
    showResults();
    return;
  }

  displayQuestion();
}

document.addEventListener("keydown", event => {
  if (event.key !== "Enter") return;

  if (
    gameScreen.hidden === false &&
    answered &&
    document.activeElement.tagName !== "BUTTON"
  ) {
    event.preventDefault();
    nextQuestion();
  }
});

/* =========================================
   RESULTS
========================================= */

function showResults() {
  gameScreen.hidden = true;
  resultsScreen.hidden = false;

  const percentage = Math.round(
    (score / TOTAL_QUESTIONS) * 100
  );

  document.getElementById("final-score").textContent =
    `You scored ${score} out of ${TOTAL_QUESTIONS}.`;

  document.getElementById("result-progress").style.width =
    `${percentage}%`;

  let title;
  let message;

  if (score === 20) {
    title = "PERFECT SCORE!";
    message = "Incredible! You answered every question correctly!";
  } else if (score >= 15) {
    title = "Amazing work!";
    message = "You're doing great! Keep up the awesome work.";
  } else if (score >= 10) {
    title = "Good effort!";
    message = "You're making progress. Keep practicing!";
  } else {
    title = "Keep growing!";
    message = "Every attempt helps you improve. Give it another try!";
  }

  document.getElementById("result-title").textContent = title;
  document.getElementById("result-message").textContent = message;

  saveQuizResult(score, selectedDifficulty);

  let bonusXP = 50;

  if (score === TOTAL_QUESTIONS) {
    bonusXP += 100;
  }

  if (selectedDifficulty === "hard") {
    bonusXP += 50;
  }

  addXP(bonusXP);
  currentQuizXP += bonusXP;

  document.getElementById("xp-earned").textContent =
    `+${currentQuizXP} XP`;

  updateDashboard();
  updateAchievements();
  updateProfileBadge();
  updateXPDisplay();
  updateDevConsole();
}

/* =========================================
   REPLAY
========================================= */

playAgainButton.addEventListener("click", () => {
  resultsScreen.hidden = true;
  setupScreen.hidden = false;
});

/* =========================================
   QUIZ HISTORY
========================================= */

function saveQuizResult(finalScore, difficulty) {
  const history = getQuizHistory();

  history.unshift({
    score: finalScore,
    total: TOTAL_QUESTIONS,
    difficulty,
    date: new Date().toLocaleDateString(),
    timestamp: Date.now()
  });

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

  updateStreak();
}

/* =========================================
   STREAK SYSTEM
========================================= */

function getStreakData() {
  const data = readJSON(STREAK_KEY, { date: "", count: 0 });

  return {
    date: data.date || "",
    count: Math.max(0, Number(data.count) || 0)
  };
}

function updateStreak() {
  const today = new Date().toLocaleDateString();
  const yesterdayDate = new Date();

  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  const yesterday = yesterdayDate.toLocaleDateString();
  const streakData = getStreakData();

  if (streakData.date === today) return;

  if (streakData.date === yesterday) {
    streakData.count++;
  } else {
    streakData.count = 1;
  }

  streakData.date = today;

  localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
}

function getActiveStreak() {
  const streakData = getStreakData();

  const today = new Date().toLocaleDateString();
  const yesterdayDate = new Date();

  yesterdayDate.setDate(yesterdayDate.getDate() - 1);

  const yesterday = yesterdayDate.toLocaleDateString();

  if (streakData.date === today || streakData.date === yesterday) {
    return streakData.count;
  }

  return 0;
}

/* =========================================
   ORIGINAL 8 ACHIEVEMENTS
========================================= */

const achievementList = [
  {
    id: "first_quiz",
    icon: "🎯",
    name: "First Steps",
    description: "Complete your very first quiz.",
    requirement: "Complete 1 quiz.",
    check: history => history.length >= 1
  },
  {
    id: "five_quizzes",
    icon: "📚",
    name: "Getting Serious",
    description: "Complete five quizzes.",
    requirement: "Complete 5 quizzes.",
    check: history => history.length >= 5
  },
  {
    id: "ten_quizzes",
    icon: "🏅",
    name: "Math Machine",
    description: "Complete ten quizzes.",
    requirement: "Complete 10 quizzes.",
    check: history => history.length >= 10
  },
  {
    id: "perfect_score",
    icon: "💯",
    name: "Flawless",
    description: "Get every question correct in one quiz.",
    requirement: "Score 20/20 in a quiz.",
    check: history => history.some(item => item.score === 20)
  },
  {
    id: "three_perfect",
    icon: "👑",
    name: "Perfectionist",
    description: "Earn three perfect quiz scores.",
    requirement: "Get 3 perfect scores.",
    check: history =>
      history.filter(item => item.score === 20).length >= 3
  },
  {
    id: "three_day_streak",
    icon: "🔥",
    name: "On Fire",
    description: "Practice on three consecutive days.",
    requirement: "Reach a 3-day streak.",
    check: () => getActiveStreak() >= 3
  },
  {
    id: "seven_day_streak",
    icon: "⚡",
    name: "Unstoppable",
    description: "Practice on seven consecutive days.",
    requirement: "Reach a 7-day streak.",
    check: () => getActiveStreak() >= 7
  },
  {
    id: "hard_champion",
    icon: "💎",
    name: "Hard Mode Hero",
    description: "Score at least 15 on a hard quiz.",
    requirement: "Score 15/20 or higher on Hard.",
    check: history =>
      history.some(item =>
        item.difficulty === "hard" && item.score >= 15
      )
  }
];

/* =========================================
   LEVEL BADGES - 4 BADGES
========================================= */

const levelBadgeList = [
  {
    id: "level_5",
    icon: "⭐",
    name: "Rising Star",
    description: "Reached Level 5.",
    requirement: "Reach Level 5.",
    check: () => getLevelData().level >= 5
  },
  {
    id: "level_10",
    icon: "🌟",
    name: "Superstar",
    description: "Reached Level 10.",
    requirement: "Reach Level 10.",
    check: () => getLevelData().level >= 10
  },
  {
    id: "level_15",
    icon: "💫",
    name: "Elite",
    description: "Reached Level 15.",
    requirement: "Reach Level 15.",
    check: () => getLevelData().level >= 15
  },
  {
    id: "level_20",
    icon: "👑",
    name: "Level Legend",
    description: "Reached Level 20.",
    requirement: "Reach Level 20.",
    check: () => getLevelData().level >= 20
  }
];

/* =========================================
   PRESTIGE BADGES - 20 BADGES
========================================= */

const prestigeIcons = [
  "🥉", "🥈", "🥇", "🏆", "💠",
  "🔮", "💎", "🌈", "🔥", "⚡",
  "🌌", "☄️", "🪐", "🌠", "🦁",
  "🐉", "👑", "💫", "🌟", "🏅"
];

const prestigeBadgeList = prestigeIcons.map((icon, index) => {
  const prestigeNumber = index + 1;

  return {
    id: `prestige_${prestigeNumber}`,
    icon,
    name: `Prestige ${prestigeNumber}`,
    description: `Earned Prestige ${prestigeNumber}.`,
    requirement: `Reach Prestige ${prestigeNumber}.`,
    check: () => getPrestige() >= prestigeNumber
  };
});

function getAllBadges() {
  return [
    ...achievementList,
    ...levelBadgeList,
    ...prestigeBadgeList
  ];
}

/* =========================================
   ACHIEVEMENT DISPLAY
========================================= */

function updateAchievements() {
  const history = getQuizHistory();
  const allBadges = getAllBadges();
  const unlocked = getUnlockedAchievements();

  allBadges.forEach(badge => {
    if (badge.check(history) && !unlocked.includes(badge.id)) {
      unlocked.push(badge.id);
    }
  });

  saveUnlockedAchievements(unlocked);

  const grid = document.getElementById("achievements-grid");
  const count = document.getElementById("achievement-count");
  const progress = document.getElementById("achievement-progress");

  if (!grid || !count || !progress) return;

  const unlockedCount = allBadges.filter(badge =>
    unlocked.includes(badge.id)
  ).length;

  const percentage = (unlockedCount / allBadges.length) * 100;

  count.textContent = `${unlockedCount}/${allBadges.length}`;
  progress.style.width = `${percentage}%`;

  grid.innerHTML = "";

  const equippedId = localStorage.getItem(EQUIPPED_BADGE_KEY);

  allBadges.forEach(badge => {
    const isUnlocked = unlocked.includes(badge.id);
    const isEquipped = equippedId === badge.id;

    const card = document.createElement("div");
    card.className = `achievement-card ${isUnlocked ? "unlocked" : "locked"}`;

    const icon = document.createElement("div");
    icon.className = "achievement-icon";
    icon.textContent = isUnlocked ? badge.icon : "🔒";

    const title = document.createElement("h3");
    title.textContent = badge.name;

    const description = document.createElement("p");
    description.textContent = isUnlocked
      ? badge.description
      : badge.requirement;

    const status = document.createElement("span");
    status.className = "achievement-status";
    status.textContent = isUnlocked ? "✓ UNLOCKED" : "LOCKED";

    card.append(icon, title, description, status);

    if (isUnlocked) {
      const equipButton = document.createElement("button");
      equipButton.type = "button";
      equipButton.className = "equip-badge-button";
      equipButton.textContent = isEquipped ? "UNEQUIP" : "EQUIP";

      if (isEquipped) {
        equipButton.classList.add("equipped");
      }

      equipButton.addEventListener("click", () => {
        if (isEquipped) {
          localStorage.removeItem(EQUIPPED_BADGE_KEY);
        } else {
          localStorage.setItem(EQUIPPED_BADGE_KEY, badge.id);
        }

        updateProfileBadge();
        updateAchievements();
      });

      card.appendChild(equipButton);
    }

    grid.appendChild(card);
  });
}

/* =========================================
   PROFILE BADGE
========================================= */

function updateProfileBadge() {
  const badgeElement = document.getElementById("equipped-badge");

  if (!badgeElement) return;

  const equippedId = localStorage.getItem(EQUIPPED_BADGE_KEY);
  const unlocked = getUnlockedAchievements();

  const badge = getAllBadges().find(item =>
    item.id === equippedId
  );

  if (!badge || !unlocked.includes(equippedId)) {
    badgeElement.textContent = "";
    badgeElement.style.display = "none";
    return;
  }

  badgeElement.textContent = badge.icon;
  badgeElement.style.display = "flex";
}

/* =========================================
   DASHBOARD
========================================= */

function updateDashboard() {
  const history = getQuizHistory();
  const totalQuizzes = history.length;

  const bestScore = totalQuizzes
    ? Math.max(...history.map(item => Number(item.score) || 0))
    : 0;

  const averageScore = totalQuizzes
    ? Math.round(
        history.reduce((sum, item) => sum + (Number(item.score) || 0), 0) /
        totalQuizzes / TOTAL_QUESTIONS * 100
      )
    : 0;

  document.getElementById("best-score").textContent =
    `${bestScore}/${TOTAL_QUESTIONS}`;

  document.getElementById("total-quizzes").textContent =
    totalQuizzes;

  document.getElementById("average-score").textContent =
    `${averageScore}%`;

  document.getElementById("daily-streak").textContent =
    `${getActiveStreak()} days`;

  const activityContainer =
    document.getElementById("recent-activity");

  if (!activityContainer) return;

  activityContainer.innerHTML = "";

  if (history.length === 0) {
    activityContainer.innerHTML =
      '<p class="empty-activity">No quizzes completed yet. Start practicing!</p>';
    return;
  }

  history.slice(0, 5).forEach(item => {
    const activity = document.createElement("div");
    activity.className = "activity-item";

    const info = document.createElement("div");
    info.className = "activity-info";

    const title = document.createElement("strong");
    title.textContent = `${String(item.difficulty || "all").toUpperCase()} QUIZ`;

    const date = document.createElement("span");
    date.textContent = item.date || "";

    const result = document.createElement("span");
    result.className = "activity-score";
    result.textContent = `${item.score}/${item.total || TOTAL_QUESTIONS}`;

    info.append(title, date);
    activity.append(info, result);
    activityContainer.appendChild(activity);
  });
}

/* =========================================
   PROFILE PICTURE
========================================= */

const profileButton =
  document.getElementById("profile-picture-button");

const profileUpload =
  document.getElementById("profile-upload");

const profileImage =
  document.getElementById("profile-picture");

const profilePlaceholder =
  document.getElementById("profile-placeholder");

function loadProfilePicture() {
  const savedPicture = localStorage.getItem("mangomath_profile_picture");
  const savedUsername = localStorage.getItem("mangomath_username");

  if (savedPicture) {
    profileImage.src = savedPicture;
    profileImage.style.display = "block";
    profilePlaceholder.style.display = "none";
  } else {
    profileImage.style.display = "none";
    profilePlaceholder.style.display = "flex";
  }

  profileButton.title = savedUsername || "Change profile picture";
}

if (profileButton && profileUpload) {
  profileButton.addEventListener("click", () => {
    profileUpload.click();
  });

  profileUpload.addEventListener("change", event => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      profileUpload.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("Please choose an image smaller than 3MB.");
      profileUpload.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        localStorage.setItem(
          "mangomath_profile_picture",
          reader.result
        );

        loadProfilePicture();
      } catch {
        alert("That image is too large to save. Try a smaller image.");
      }
    };

    reader.readAsDataURL(file);
  });
}

/* =========================================
   F6 DEVELOPER CONSOLE
========================================= */

const devConsole = document.getElementById("dev-console");
const closeDevConsole = document.getElementById("close-dev-console");
const devGiveXP = document.getElementById("dev-give-xp");
const devXPInput = document.getElementById("dev-xp-amount");
const devMessage = document.getElementById("dev-console-message");

function updateDevConsole() {
  if (!devConsole) return;

  const level = getLevelData();

  document.getElementById("dev-current-level").textContent =
    level.level;

  document.getElementById("dev-current-xp").textContent =
    getTotalXP().toLocaleString();

  document.getElementById("dev-current-prestige").textContent =
    getPrestige();
}

function toggleDevConsole() {
  if (!devConsole) return;

  devConsole.hidden = !devConsole.hidden;

  if (!devConsole.hidden) {
    updateDevConsole();
    devXPInput?.focus();
  }
}

document.addEventListener("keydown", event => {
  if (event.key === "F6") {
    event.preventDefault();
    toggleDevConsole();
  }

  if (event.key === "Escape" && devConsole && !devConsole.hidden) {
    devConsole.hidden = true;
  }
});

if (closeDevConsole) {
  closeDevConsole.addEventListener("click", () => {
    devConsole.hidden = true;
  });
}

function devAddXP(amount) {
  if (
    !Number.isSafeInteger(amount) ||
    amount < 1 ||
    amount > 1000000
  ) {
    if (devMessage) {
      devMessage.textContent =
        "Enter an XP amount from 1 to 1,000,000.";
    }
    return;
  }

  addXP(amount);
  updateDevConsole();

  if (devMessage) {
    devMessage.textContent =
      `SUCCESS: Added ${amount.toLocaleString()} XP!`;
  }
}

if (devGiveXP) {
  devGiveXP.addEventListener("click", () => {
    const amount = Number(devXPInput.value);
    devAddXP(amount);
    devXPInput.value = "";
  });
}

if (devXPInput) {
  devXPInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      devGiveXP.click();
    }
  });
}

document.querySelectorAll("[data-dev-xp]").forEach(button => {
  button.addEventListener("click", () => {
    devAddXP(Number(button.dataset.devXp));
  });
});

/* =========================================
   INITIAL PAGE LOAD
========================================= */

loadProfilePicture();
updateDashboard();
updateXPDisplay();
updateAchievements();
updateProfileBadge();
updateDevConsole();

/* =========================================
   MANGOHUB - F7 SHORTCUT
========================================= */

document.addEventListener("keydown", event => {
  if (event.key === "F7" && !event.repeat) {
    event.preventDefault();
    window.location.href = "mangohub.html";
  }
});

/* =========================================
   MOBILE QUICK BUTTON ACTIONS
========================================= */

const mobileDevButton = document.getElementById("mobile-dev-button");
const mobileHubButton = document.getElementById("mobile-hub-button");

if (mobileDevButton) {
  mobileDevButton.addEventListener("click", () => {
    toggleDevConsole();
  });
}

if (mobileHubButton) {
  mobileHubButton.addEventListener("click", () => {
    window.location.href = "mangohub.html";
  });
}
