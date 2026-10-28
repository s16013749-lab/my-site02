"use strict";

const services = {
  haircut: {
    title: "Женская стрижка",
    price: 1500,
    duration: 60,
    from: false
  },
  coloring: {
    title: "Окрашивание",
    price: 3500,
    duration: 120,
    from: true
  },
  manicure: {
    title: "Маникюр",
    price: 1800,
    duration: 90,
    from: false
  },
  pedicure: {
    title: "Педикюр",
    price: 2200,
    duration: 90,
    from: false
  },
  care: {
    title: "Уход за лицом",
    price: 2500,
    duration: 60,
    from: false
  },
  makeup: {
    title: "Макияж",
    price: 2000,
    duration: 60,
    from: true
  }
};

const OPENING_TIME = 10 * 60;
const CLOSING_TIME = 19 * 60;

const menuButton = document.getElementById("menu-button");
const navigation = document.getElementById("navigation");

function closeMenu() {
  navigation.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Открыть меню");
  menuButton.textContent = "☰";
}

menuButton.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");

  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute(
    "aria-label",
    isOpen ? "Закрыть меню" : "Открыть меню"
  );

  menuButton.textContent = isOpen ? "×" : "☰";
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

const filterButtons = document.querySelectorAll(".filter-button");
const serviceCards = document.querySelectorAll(".service-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;

      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    serviceCards.forEach((card) => {
      card.hidden =
        selectedCategory !== "all" &&
        card.dataset.category !== selectedCategory;
    });
  });
});

const form = document.getElementById("booking-form");
const nameInput = document.getElementById("client-name");
const phoneInput = document.getElementById("client-phone");
const serviceInput = document.getElementById("service");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const serviceSummary = document.getElementById("service-summary");

const modal = document.getElementById("booking-modal");
const modalText = document.getElementById("modal-text");
const modalClose = document.getElementById("modal-close");
const modalOk = document.getElementById("modal-ok");

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function updateMinDate() {
  dateInput.min = getLocalDateString();
}

updateMinDate();

dateInput.addEventListener("focus", updateMinDate);

function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function setError(input, errorId, message) {
  const errorElement = document.getElementById(errorId);

  errorElement.textContent = message;
  input.classList.toggle("invalid", Boolean(message));

  if (message) {
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }

  return message === "";
}
function updateServiceSummary() {
  const service = services[serviceInput.value];

  if (!service) {
    serviceSummary.textContent =
      "Выбери услугу, чтобы увидеть стоимость и длительность.";

    timeInput.max = "18:00";
    return;
  }

  const price = service.price.toLocaleString("ru-RU");
  const prefix = service.from ? "от " : "";
  const lastStart = CLOSING_TIME - service.duration;

  timeInput.max = formatTime(lastStart);

  serviceSummary.textContent =
    `Стоимость: ${prefix}${price} ₽ · ` +
    `Длительность: ${service.duration} мин · ` +
    `Последняя запись: ${formatTime(lastStart)}`;
}

function validateName() {
  const name = nameInput.value.trim();

  if (name.length < 2 || name.length > 60) {
    return setError(
      nameInput,
      "name-error",
      "Введи имя длиной от 2 до 60 символов."
    );
  }

  if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'’-]*$/u.test(name)) {
    return setError(
      nameInput,
      "name-error",
      "Имя может содержать буквы, пробелы, дефис и апостроф."
    );
  }

  return setError(nameInput, "name-error", "");
}

function validatePhone() {
  const rawPhone = phoneInput.value.trim();
  const digits = rawPhone.replace(/\D/g, "");

  const allowedCharacters = /^\+?[\d\s()-]+$/;
  const validNumber = /^[78]\d{10}$/;

  if (
    !allowedCharacters.test(rawPhone) ||
    !validNumber.test(digits)
  ) {
    return setError(
      phoneInput,
      "phone-error",
      "Введи 11 цифр с 7 или 8. Например: +7 (999) 123-45-67."
    );
  }

  return setError(phoneInput, "phone-error", "");
}

function validateService() {
  if (!services[serviceInput.value]) {
    return setError(
      serviceInput,
      "service-error",
      "Выбери услугу из списка."
    );
  }

  return setError(serviceInput, "service-error", "");
}

function validateDate() {
  updateMinDate();

  const value = dateInput.value;

  if (!value) {
    return setError(
      dateInput,
      "date-error",
      "Выбери дату записи."
    );
  }

  if (value < getLocalDateString()) {
    return setError(
      dateInput,
      "date-error",
      "Нельзя записаться на прошедшую дату."
    );
  }

  return setError(dateInput, "date-error", "");
}

function validateTime() {
  const value = timeInput.value;

  if (!value) {
    return setError(
      timeInput,
      "time-error",
      "Выбери время записи."
    );
  }

  const [hours, minutes] = value.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  const service = services[serviceInput.value];
  const duration = service ? service.duration : 60;
  const lastStart = CLOSING_TIME - duration;

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return setError(
      timeInput,
      "time-error",
      "Введи корректное время."
    );
  }

  if (totalMinutes < OPENING_TIME || totalMinutes > lastStart) {
    return setError(
      timeInput,
      "time-error",
      `Для этой услуги выбери время с 10:00 до ${formatTime(lastStart)}.`
    );
  }

  if (dateInput.value) {
    const appointment = new Date(
      `${dateInput.value}T${value}:00`
    );

    if (
      Number.isNaN(appointment.getTime()) ||
      appointment <= new Date()
    ) {
      return setError(
        timeInput,
        "time-error",
        "Это время уже прошло. Выбери более позднее."
      );
    }
  }

  return setError(timeInput, "time-error", "");
}

nameInput.addEventListener("input", validateName);
phoneInput.addEventListener("input", validatePhone);

serviceInput.addEventListener("change", () => {
  updateServiceSummary();
  validateService();

  if (timeInput.value) {
    validateTime();
  }
});

dateInput.addEventListener("change", () => {
  validateDate();

  if (timeInput.value) {
    validateTime();
  }
});

timeInput.addEventListener("change", validateTime);

document.querySelectorAll("[data-service]").forEach((button) => {
  button.addEventListener("click", () => {
    serviceInput.value = button.dataset.service;

    updateServiceSummary();
    validateService();

    if (timeInput.value) {
      validateTime();
    }

    document.getElementById("booking").scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start"
    });
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const results = [
    validateName(),
    validatePhone(),
    validateService(),
    validateDate(),
    validateTime()
  ];

  if (!results.every(Boolean)) {
    const firstInvalid = form.querySelector(".invalid");

    if (firstInvalid) {
      firstInvalid.focus();
    }

    return;
  }

  const service = services[serviceInput.value];
  const [year, month, day] = dateInput.value.split("-");

  const startMinutes = timeInput.value
    .split(":")
    .map(Number)
    .reduce((hours, minutes) => hours * 60 + minutes);

  const endTime = formatTime(startMinutes + service.duration);
  const price = service.price.toLocaleString("ru-RU");
  const prefix = service.from ? "от " : "";

  modalText.textContent =
    `${nameInput.value.trim()}, выбранная услуга — «${service.title}». ` +
    `Дата: ${day}.${month}.${year}. ` +
    `Время: ${timeInput.value}–${endTime}. ` +
    `Стоимость: ${prefix}${price} ₽.`;

  modal.showModal();

  form.reset();
  updateMinDate();
  updateServiceSummary();
});

modalClose.addEventListener("click", () => {
  modal.close();
});

modalOk.addEventListener("click", () => {
  modal.close();
});

modal.addEventListener("click", (event) => {
  const bounds = modal.getBoundingClientRect();

  const outside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;

  if (outside) {
    modal.close();
  }
});