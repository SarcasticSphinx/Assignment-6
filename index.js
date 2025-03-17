const nav = document.querySelector(".fixed-nav");
const lessonSelection = document.querySelector("#lesson-selection");
const lessonSection = document.getElementById("lesson");
const faqSection = document.getElementById("faq");
const heroPage = document.getElementById("hero-page");
const faqItem = document.querySelectorAll(".faq-item");

const form = document.querySelector("form");

const wordInfoBtn = document.querySelector(".word-info-btn");

let selectedLesson = null;

//handle login
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  if (!data.name || !data.password) {
    alert("Please enter your name and password");
    return;
  }
  if (data.password === "123456") {
    
    nav.style.display = "block";
    lessonSelection.style.display = "block";
    lessonSection.style.display = "block";
    faqSection.style.display = "block";
    heroPage.style.display = "none";
    alert("Login successful");
  } else {
    alert("Incorrect password. Please try again");
  }

  handleLessonSelection();
  handleSelectedLessonData();
});

// handle Logout
function Logout() {
  nav.style.display = "none";
  lessonSelection.style.display = "none";
  lessonSection.style.display = "none";
  faqSection.style.display = "none";
  heroPage.style.display = "flex";
  form.reset();
}


//handle lesson selection menu
function handleLessonSelection() {
  const lessonContainer = document.querySelector(".lesson-container");

  // Show loading state
  lessonContainer.innerHTML =
    '<div class="text-center"><i class="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i></div>';

  fetch("https://openapi.programming-hero.com/api/levels/all")
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((lessons) => {
      const data = lessons.data;

      lessonContainer.innerHTML = data
        .map(
          (lesson, index) =>
            `<button class="vocab-btn" onclick="selectLesson(${
              lesson.level_no})"> 
              <i class="fa-solid fa-book-open"></i>Lesson-${index + 1}
            </button>`
        )
        .join("");
    })
    .catch((error) => {
      console.error("Error fetching lessons:", error);
    });
}

function selectLesson(levelNo) {
  selectedLesson = levelNo;
  handleSelectedLessonData();
  document.querySelectorAll(".vocab-btn").forEach((btn) => {
    btn.classList.remove("selected");
  });

  document
    .querySelectorAll(".vocab-btn")
    [levelNo - 1].classList.add("selected");
}

function handleLessonData(lessonData) {
  let lessonSectionHTML = "";
  lessonData.map((data) => {
    lessonSectionHTML += `
          <div class="lesson-card rounded-2xl">
              <h4 class="text-2xl font-bold mb-2">${data.word}</h4>
              <p class="text-gray-600 mb-4 text-sm">Meaning / Pronunciation</p>
              <p class="text-xl font-semibold text-gray-800 mb-6 bangla-text">"${data.meaning} / ${data.pronunciation}"</p>
              <div class="flex justify-between">
                  <button class="bg-blue-100 p-2 rounded-sm cursor-pointer hover:bg-blue-200">
                      <i class="word-info-btn fa-solid fa-circle-info" onClick="handleWordInfo(${data.id})"></i>
                  </button>
                  <button class="bg-blue-100 p-2 rounded-sm cursor-pointer hover:bg-blue-200">
                      <i class="fa-solid fa-volume-up"></i>
                  </button>
              </div>
          </div>
          `;
  });
  return lessonSectionHTML;
}

function handleWordInfo(wordId) {
  fetch(`https://openapi.programming-hero.com/api/word/${wordId}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((word) => {
      const wordData = word.data;
      modalView(wordData);
    })
    .catch((error) => {
      console.error("Error fetching word data:", error);
    });
}

function modalView(wordData) {
  const modal = document.createElement("div");
  modal.classList.add("modal");

  modal.innerHTML = `
  <div class="modal-content">
    
    <h2 class="text-2xl font-semibold">
      ${wordData.word} 
      (<i class="fa-solid fa-microphone-lines"></i> ${wordData.pronunciation})
    </h2>
    <p class='mt-4'><strong>Meaning:</strong></p>
    <p class='bangla-text'>${wordData.meaning}</p>
    <p class='mt-4'><strong>Example:</strong></p>
    <p>${wordData.sentence}</p>
    <p class='bangla-text mt-4'><strong>সমার্থক শব্দ গুলো</strong></p>
    <div class="flex gap-2">
      ${
        !wordData.synonyms
          ? ""
          : wordData.synonyms
              .map(
                (synonym) =>
                  `<p class='border border-black px-3 py-1 bg-blue-100 rounded-sm'>${synonym}</p>`
              )
              .join("")
      }
    </div>
    <p class="modal-close">Complete learning</p>
  </div> 
`;

  document.body.appendChild(modal);

  const closeButton = modal.querySelector(".modal-close");
  closeButton.addEventListener("click", () => {
    modal.remove();
  });
}

function handleSelectedLessonData() {
  // Show initial loading state
  lessonSection.innerHTML = `
    <div class="text-center py-8">
      <i class="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-4"></i>
      <p class="text-gray-600 bangla-text">লেসন লোড হচ্ছে...</p>
    </div>`;

  if (!selectedLesson) {
    lessonSection.innerHTML = `
      <div class="text-center py-12">
        <p class="text-md text-gray-600 mb-4 bangla-text">
          আপনি এখনো কোন Lesson Select করেন নি।
        </p>
        <h3 class="text-2xl font-semibold bangla-text">
          একটি Lesson Select করুন।
        </h3>
      </div>`;
    return;
  }

  fetch(`https://openapi.programming-hero.com/api/level/${selectedLesson}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      return res.json();
    })
    .then((lesson) => {
      const lessonData = lesson.data;
      if (lessonData.length === 0) {
        lessonSection.innerHTML = `
        <div class="text-center py-12">
        <i class="text-9xl fa-solid fa-triangle-exclamation" style="color: #ea9595;"></i>
          <p class="text-md text-gray-600 mb-4 bangla-text">
            এই Lesson এ এখনো কোন Vocabulary যুক্ত করা হয়নি।
          </p>
          <h3 class="text-2xl font-semibold bangla-text">
           নেক্সট Lesson এ যান।
          </h3>
        </div>`;
      } else {
        const lessonSectionHTML = handleLessonData(lessonData);
        lessonSection.innerHTML = `<div class="lesson-card-container">${lessonSectionHTML}</div>`;
      }
    })
    .catch((error) => {
      console.error("Error fetching lesson data:", error);
    });
}


//handle faq
const faqAnswer = document.querySelectorAll(".faq-answer");
const plus = document.querySelectorAll(".plus");
document.querySelectorAll(".faq-item").forEach((item, index) => {
  item.addEventListener("click", () => {
    // Toggle current item
    faqAnswer[index].classList.contains("hidden")
      ? faqAnswer[index].classList.remove("hidden")
      : faqAnswer[index].classList.add("hidden");

    // Toggle plus icon
    plus[index].innerHTML === "+"
      ? (plus[index].innerHTML = "-")
      : (plus[index].innerHTML = "+");
  });
});
