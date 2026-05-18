const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a");
const revealItems = document.querySelectorAll(".section-reveal");
const orderForm = document.querySelector(".order-form");
const formMessage = document.querySelector(".form-message");
const legalModal = document.querySelector(".legal-modal");
const legalOpen = document.querySelector("[data-legal-open]");
const legalCloseItems = document.querySelectorAll("[data-legal-close]");
const ingredientsModal = document.querySelector(".ingredients-modal");
const ingredientsTitle = document.querySelector("#ingredients-title");
const ingredientsList = document.querySelector(".ingredients-list");
const ingredientsButtons = document.querySelectorAll(".ingredients-button");
const ingredientsCloseItems = document.querySelectorAll("[data-ingredients-close]");
const tiramisuLayerButtons = document.querySelectorAll(".tiramisu-layer[data-layer-title]");
const layerInfoPanel = document.querySelector(".layer-info-panel");
const layerInfoTitle = document.querySelector(".layer-info-title");
const layerInfoDescription = document.querySelector(".layer-info-description");
const layerInfoClose = document.querySelector(".layer-info-close");

const cartModal = document.querySelector(".cart-modal");
const accountModal = document.querySelector(".account-modal");
const boxModal = document.querySelector(".box-modal");
const cartCount = document.querySelector(".cart-count");
const cartItemsContainer = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartTotalValue = document.querySelector(".cart-total-value");
const orderCartItems = document.querySelector(".order-cart-items");
const orderCartEmpty = document.querySelector(".order-cart-empty");
const orderCartTotal = document.querySelector(".order-cart-total");
const orderPoints = document.querySelector(".order-points");
const paymentNote = document.querySelector(".payment-note");
const flavorGrid = document.querySelector(".flavor-grid");
const boxRemaining = document.querySelector(".box-remaining");
const boxSelectionList = document.querySelector(".box-selection-list");
const boxComposeInfo = document.querySelector(".box-compose-info");
const addBoxCartButton = document.querySelector(".add-box-cart-button");
const signupForm = document.querySelector("#signup-form");
const loginForm = document.querySelector("#login-form");
const accountForms = document.querySelector(".account-forms");
const accountDashboard = document.querySelector(".account-dashboard");
const accountGreeting = document.querySelector(".account-greeting");
const accountMessage = document.querySelector(".account-message");
const loyaltyPoints = document.querySelector(".loyalty-points");
const loyaltyProgress = document.querySelector(".loyalty-progress span");
const loyaltyMessage = document.querySelector(".loyalty-message");
const rewardButton = document.querySelector(".reward-button");
const logoutButton = document.querySelector(".logout-button");

const emailJsConfig = {
  serviceId: "service_8l3vwot",
  orderTemplateId: "template_1prhvxh",
  confirmationTemplateId: "template_fb6xeyc",
  publicKey: "uHc0C-GnVHycALXuG",
};

const productNames = [
  "Tiramisu Classique Café",
  "Tiramisu Spéculoos",
  "Tiramisu Nutella",
  "Tiramisu Fraise",
  "Tiramisu Pistache",
  "Tiramisu Oreo",
  "Tiramisu Kinder Bueno",
  "Tiramisu Caramel Beurre Salé",
];

let cart = JSON.parse(localStorage.getItem("tiramoodCart") || "[]");
let account = JSON.parse(localStorage.getItem("tiramoodAccount") || "null");
let activeBox = null;

if (window.emailjs) {
  emailjs.init({ publicKey: emailJsConfig.publicKey });
}

const formatPrice = (value) =>
  `${Number(value).toFixed(2).replace(".", ",")} €`;

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const saveCart = () => {
  localStorage.setItem("tiramoodCart", JSON.stringify(cart));
};

const saveAccount = () => {
  if (account) {
    localStorage.setItem("tiramoodAccount", JSON.stringify(account));
  } else {
    localStorage.removeItem("tiramoodAccount");
  }
};

const showToast = (message) => {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 250);
  }, 2200);
};

const openModal = (modal) => {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

const closeModal = (modal) => {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  if (!document.querySelector(".app-modal.is-open, .legal-modal.is-open, .ingredients-modal.is-open")) {
    document.body.classList.remove("modal-open");
  }
};

menuToggle.addEventListener("click", () => {
  header.classList.toggle("is-open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => header.classList.remove("is-open"));
});

tiramisuLayerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    layerInfoTitle.textContent = button.dataset.layerTitle;
    layerInfoDescription.textContent = button.dataset.layerDescription;
    layerInfoPanel.hidden = false;
  });
});

layerInfoClose?.addEventListener("click", () => {
  layerInfoPanel.hidden = true;
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

legalOpen.addEventListener("click", (event) => {
  event.preventDefault();
  openModal(legalModal);
});

legalCloseItems.forEach((item) => item.addEventListener("click", () => closeModal(legalModal)));

ingredientsButtons.forEach((button) => {
  button.addEventListener("click", () => {
    ingredientsTitle.textContent = button.dataset.product;
    ingredientsList.innerHTML = button.dataset.ingredients
      .split("|")
      .map((ingredient) => `<li>${ingredient}</li>`)
      .join("");
    openModal(ingredientsModal);
  });
});

ingredientsCloseItems.forEach((item) =>
  item.addEventListener("click", () => closeModal(ingredientsModal))
);

const cartTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
const cartQuantity = () => cart.reduce((sum, item) => sum + item.qty, 0);
const cartSummaryText = () =>
  cart
    .map((item) => {
      const details = item.details ? ` (${item.details})` : "";
      return `${item.qty} x ${item.name}${details} - ${formatPrice(item.price * item.qty)}`;
    })
    .join("\n");

const updateCartViews = () => {
  saveCart();
  cartCount.textContent = cartQuantity();
  const total = cartTotal();
  cartTotalValue.textContent = formatPrice(total);
  orderCartTotal.textContent = formatPrice(total);
  cartEmpty.hidden = cart.length > 0;
  orderCartEmpty.hidden = cart.length > 0;

  const renderItem = (item) => `
    <article class="cart-item">
      <div>
        <h3>${item.name}</h3>
        <p>${item.details || "Prix unitaire"} ${formatPrice(item.price)}</p>
        <p>Total : ${formatPrice(item.price * item.qty)}</p>
      </div>
      <div class="cart-controls" data-cart-id="${item.id}">
        <button type="button" data-cart-action="decrease">-</button>
        <strong>${item.qty}</strong>
        <button type="button" data-cart-action="increase">+</button>
        <button type="button" data-cart-action="remove">×</button>
      </div>
    </article>`;

  cartItemsContainer.innerHTML = cart.map(renderItem).join("");
  orderCartItems.innerHTML = cart
    .map((item) => `<p>${item.qty} x ${item.name} - ${formatPrice(item.price * item.qty)}</p>`)
    .join("");
  updateOrderPoints();
};

const addToCart = (item) => {
  const existing = cart.find((entry) => entry.id === item.id);
  if (existing && !item.unique) {
    existing.qty += item.qty;
  } else {
    cart.push({ ...item });
  }
  updateCartViews();
  showToast("Produit ajouté au panier");
};

document.querySelectorAll(".product-card").forEach((card) => {
  const name = card.querySelector("h3").textContent.trim();
  const price = Number(card.querySelector(".product-bottom span").textContent.replace(",", ".").replace(/[^\d.]/g, ""));
  card.querySelector(".add-cart-button")?.addEventListener("click", () => {
    addToCart({
      id: `product-${slugify(name)}`,
      name,
      price,
      qty: 1,
      type: "product",
    });
  });
});

document.querySelector("[data-cart-open]").addEventListener("click", () => openModal(cartModal));
document.querySelectorAll("[data-cart-close]").forEach((item) =>
  item.addEventListener("click", () => closeModal(cartModal))
);

cartItemsContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-cart-action]");
  if (!button) return;
  const id = button.closest("[data-cart-id]").dataset.cartId;
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;
  if (button.dataset.cartAction === "increase") item.qty += 1;
  if (button.dataset.cartAction === "decrease") item.qty -= 1;
  if (button.dataset.cartAction === "remove" || item.qty <= 0) {
    cart = cart.filter((entry) => entry.id !== id);
  }
  updateCartViews();
});

const openBoxComposer = (card) => {
  activeBox = {
    size: Number(card.dataset.boxSize),
    price: Number(card.dataset.boxPrice),
    flavors: Object.fromEntries(productNames.map((name) => [name, 0])),
  };
  boxComposeInfo.textContent = `Box de ${activeBox.size} tiramisu(s) - ${formatPrice(activeBox.price)}`;
  flavorGrid.innerHTML = productNames
    .map(
      (name) => `
      <article class="flavor-control" data-flavor="${name}">
        <strong>${name.replace("Tiramisu ", "")}</strong>
        <div class="flavor-buttons">
          <button type="button" data-flavor-action="minus">-</button>
          <span>0</span>
          <button type="button" data-flavor-action="plus">+</button>
        </div>
      </article>`
    )
    .join("");
  updateBoxComposer();
  openModal(boxModal);
};

const selectedBoxCount = () =>
  Object.values(activeBox?.flavors || {}).reduce((sum, qty) => sum + qty, 0);

const updateBoxComposer = () => {
  const selected = selectedBoxCount();
  const remaining = activeBox.size - selected;
  boxRemaining.textContent = `Il vous reste ${remaining} tiramisu(s) à choisir`;
  addBoxCartButton.disabled = remaining !== 0;
  boxSelectionList.innerHTML = Object.entries(activeBox.flavors)
    .filter(([, qty]) => qty > 0)
    .map(([name, qty]) => `<p>${qty} x ${name}</p>`)
    .join("");
  flavorGrid.querySelectorAll(".flavor-control").forEach((control) => {
    control.querySelector("span").textContent = activeBox.flavors[control.dataset.flavor];
  });
};

document.querySelectorAll(".compose-box-button").forEach((button) => {
  button.addEventListener("click", () => openBoxComposer(button.closest(".box-card")));
});

flavorGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-flavor-action]");
  if (!button || !activeBox) return;
  const flavor = button.closest(".flavor-control").dataset.flavor;
  if (button.dataset.flavorAction === "plus" && selectedBoxCount() < activeBox.size) {
    activeBox.flavors[flavor] += 1;
  }
  if (button.dataset.flavorAction === "minus" && activeBox.flavors[flavor] > 0) {
    activeBox.flavors[flavor] -= 1;
  }
  updateBoxComposer();
});

addBoxCartButton.addEventListener("click", () => {
  if (!activeBox || selectedBoxCount() !== activeBox.size) return;
  const details = Object.entries(activeBox.flavors)
    .filter(([, qty]) => qty > 0)
    .map(([name, qty]) => `${qty} ${name.replace("Tiramisu ", "")}`)
    .join(", ");
  addToCart({
    id: `box-${activeBox.size}-${Date.now()}`,
    name: `Box de ${activeBox.size} tiramisus`,
    price: activeBox.price,
    qty: 1,
    type: "box",
    unique: true,
    details,
  });
  closeModal(boxModal);
});

document.querySelectorAll("[data-box-close]").forEach((item) =>
  item.addEventListener("click", () => closeModal(boxModal))
);

const updateAccountView = () => {
  if (account?.loggedIn) {
    accountForms.hidden = true;
    accountDashboard.hidden = false;
    accountGreeting.textContent = `Bonjour ${account.prenom}`;
    const points = account.points || 0;
    loyaltyPoints.textContent = `${points} / 100 points`;
    loyaltyProgress.style.width = `${Math.min(points, 100)}%`;
    rewardButton.hidden = points < 100;
    loyaltyMessage.textContent =
      points >= 100
        ? "Vous avez gagné 1 tiramisu offert 🎁"
        : `Encore ${100 - points} points pour obtenir 1 tiramisu offert`;
  } else {
    accountForms.hidden = false;
    accountDashboard.hidden = true;
  }
  updateOrderPoints();
};

document.querySelector("[data-account-open]").addEventListener("click", () => {
  updateAccountView();
  openModal(accountModal);
});
document.querySelectorAll("[data-account-close]").forEach((item) =>
  item.addEventListener("click", () => closeModal(accountModal))
);

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(signupForm);
  account = {
    prenom: String(data.get("prenom")).trim(),
    nom: String(data.get("nom")).trim(),
    email: String(data.get("email")).trim(),
    telephone: String(data.get("telephone")).trim(),
    password: String(data.get("password")),
    points: account?.points || 0,
    loggedIn: true,
  };
  saveAccount();
  accountMessage.textContent = "Compte créé sur cet appareil.";
  signupForm.reset();
  updateAccountView();
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  if (account && data.get("email") === account.email && data.get("password") === account.password) {
    account.loggedIn = true;
    saveAccount();
    accountMessage.textContent = "Connexion réussie.";
    loginForm.reset();
    updateAccountView();
  } else {
    accountMessage.textContent = "Identifiants incorrects ou compte absent sur cet appareil.";
  }
});

logoutButton.addEventListener("click", () => {
  account.loggedIn = false;
  saveAccount();
  updateAccountView();
});

rewardButton.addEventListener("click", () => {
  if (!account || account.points < 100) return;
  account.points -= 100;
  saveAccount();
  addToCart({
    id: `reward-${Date.now()}`,
    name: "Tiramisu offert",
    price: 0,
    qty: 1,
    type: "reward",
    unique: true,
    details: "Récompense fidélité",
  });
  updateAccountView();
});

const formFields = {
  nom: orderForm.elements.nom,
  telephone: orderForm.elements.telephone,
  email: orderForm.elements.email,
  adresse: orderForm.elements.adresse,
  message: orderForm.elements.message,
  paiement: orderForm.elements.paiement,
};

const fieldMessages = {
  nom: "Veuillez entrer un nom valide.",
  telephone: "Veuillez entrer un numéro de téléphone français valide.",
  email: "Veuillez entrer une adresse e-mail valide.",
  adresse: "Veuillez entrer une adresse de livraison complète.",
  message: "Les liens ne sont pas autorisés dans le message.",
  paiement: "Veuillez choisir un mode de paiement.",
};

const getOrCreateError = (field) => {
  const errorId = `${field.id}-error`;
  let error = document.querySelector(`#${errorId}`);
  if (!error) {
    error = document.createElement("span");
    error.className = "field-error";
    error.id = errorId;
    error.setAttribute("aria-live", "polite");
    field.insertAdjacentElement("afterend", error);
    field.setAttribute("aria-describedby", errorId);
  }
  return error;
};

const setFieldError = (field, message) => {
  getOrCreateError(field).textContent = message;
  field.classList.add("is-invalid");
  field.setAttribute("aria-invalid", "true");
};

const clearFieldError = (field) => {
  getOrCreateError(field).textContent = "";
  field.classList.remove("is-invalid");
  field.setAttribute("aria-invalid", "false");
};

const hasSuspiciousContent = (value) => /<script\b|<\/script>|https?:\/\/|www\.|<[^>]+>/i.test(value);

const validateOrderForm = () => {
  const values = {
    nom: formFields.nom.value.trim(),
    telephone: formFields.telephone.value.trim(),
    email: formFields.email.value.trim(),
    adresse: formFields.adresse.value.trim(),
    message: formFields.message.value.trim(),
    paiement: formFields.paiement.value.trim(),
  };
  const rules = {
    nom: values.nom.length >= 2 && values.nom.length <= 50 && /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(values.nom),
    telephone: /^(?:0[67]\d{8}|\+33[67]\d{8})$/.test(values.telephone),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email),
    adresse:
      values.adresse.length >= 8 &&
      values.adresse.length <= 120 &&
      /\d/.test(values.adresse) &&
      /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(values.adresse),
    message: values.message.length <= 300 && !hasSuspiciousContent(values.message),
    paiement: Boolean(values.paiement),
  };
  Object.entries(formFields).forEach(([name, field]) => {
    rules[name] ? clearFieldError(field) : setFieldError(field, fieldMessages[name]);
  });
  return { isValid: Object.values(rules).every(Boolean), values };
};

const paymentMessages = {
  "Espèces à la livraison": "Paiement en espèces à la livraison.",
  "Carte bancaire après confirmation":
    "Le paiement par carte bancaire sera confirmé par message après validation de votre commande.",
  "PayPal après confirmation": "Le lien PayPal vous sera envoyé après confirmation de votre commande.",
};

formFields.paiement.addEventListener("change", () => {
  paymentNote.textContent = paymentMessages[formFields.paiement.value] || "";
});

Object.values(formFields).forEach((field) => {
  field.addEventListener("input", () => {
    if (field.classList.contains("is-invalid")) validateOrderForm();
  });
});

function updateOrderPoints() {
  const points = Math.floor(cartTotal());
  orderPoints.textContent = account?.loggedIn
    ? `Cette commande vous rapportera ${points} point(s) fidélité.`
    : "Connectez-vous pour gagner des points fidélité avec cette commande.";
}

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const { isValid, values } = validateOrderForm();

  if (!cart.length) {
    formMessage.textContent = "Votre panier est vide.";
    openModal(cartModal);
    return;
  }

  if (!isValid) {
    formMessage.textContent = "Veuillez corriger les champs indiqués avant d'envoyer la commande.";
    orderForm.querySelector(".is-invalid")?.focus();
    return;
  }

  const total = cartTotal();
  const points = account?.loggedIn ? Math.floor(total) : 0;
  const panier = cartSummaryText();
  const totalQuantity = cartQuantity();
  const templateParams = {
    nom: values.nom,
    telephone: values.telephone,
    email: values.email,
    adresse: values.adresse,
    message: values.message || "Aucune précision",
    panier: panier,
    total: formatPrice(total),
    paiement: values.paiement,
    points: String(points),
    tiramisu: panier,
    quantite: String(totalQuantity),
    subject: "Votre commande TiraMood est bien reçue 🍰",
    titre: "Votre commande a bien été reçue",
    message_principal:
      "Merci pour votre commande chez TiraMood 🤎 Nous avons bien reçu votre demande et nous allons vous recontacter rapidement pour confirmer la livraison.",
    bloc_titre: "Récapitulatif de votre commande",
    code: "",
    details_commande: panier,
  };

  try {
    if (!window.emailjs) throw new Error("EmailJS n'est pas chargé.");
    orderForm.querySelector("button[type='submit']").disabled = true;
    formMessage.textContent = "Envoi de votre commande...";
    await emailjs.send(emailJsConfig.serviceId, emailJsConfig.orderTemplateId, templateParams);
    await emailjs.send(emailJsConfig.serviceId, emailJsConfig.confirmationTemplateId, templateParams);

    if (account?.loggedIn) {
      account.points = (account.points || 0) + points;
      saveAccount();
      updateAccountView();
    }

    cart = [];
    updateCartViews();
    orderForm.reset();
    paymentNote.textContent = "";
    Object.values(formFields).forEach(clearFieldError);
    formMessage.textContent =
      "Merci, votre commande a bien été envoyée. Un e-mail de confirmation vous a été envoyé.";
  } catch (error) {
    formMessage.textContent = "Une erreur est survenue pendant l'envoi. Veuillez réessayer.";
  } finally {
    orderForm.querySelector("button[type='submit']").disabled = false;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  [cartModal, accountModal, boxModal, legalModal, ingredientsModal].forEach((modal) => {
    if (modal?.classList.contains("is-open")) closeModal(modal);
  });
});

updateCartViews();
updateAccountView();
