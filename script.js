// FORM SUBMISSION HANDLER WITH GOOGLE SHEETS INTEGRATION
document.addEventListener("DOMContentLoaded", function () {
  const applicationForm = document.getElementById("applicationForm");
  const submitBtn = document.getElementById("submitBtn");
  const formContainer = applicationForm
    ? applicationForm.closest(".form-container") || applicationForm.parentNode
    : null;

  // Check if elements exist before using them
  if (submitBtn) {
    const btnText = submitBtn.querySelector(".btn-text");
    const btnLoading = submitBtn.querySelector(".btn-loading");
  }

  // Initialize floating labels
  if (applicationForm) {
    initFloatingLabels();
  }

  if (applicationForm) {
    applicationForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector(".btn-text");
        const btnLoading = submitBtn.querySelector(".btn-loading");
        if (btnText && btnLoading) {
          btnText.style.display = "none";
          btnLoading.style.display = "inline-block";
        }
      }

      try {
        // Get form data
        const formData = getFormData();
        console.log("Submitting form data:", formData);

        // Send to Google Sheets
        await submitToGoogleSheets(formData);

        // Hide form and show success message
        showSuccessMessageAndHideForm(
          "Application submitted successfully! We will contact you soon.",
          applicationForm,
          formContainer
        );
      } catch (error) {
        console.error("Submission error:", error);
        showMessage(
          "There was an error submitting your application. Please try again.",
          "error"
        );

        // Reset button state on error only (form stays visible)
        if (submitBtn) {
          submitBtn.disabled = false;
          const btnText = submitBtn.querySelector(".btn-text");
          const btnLoading = submitBtn.querySelector(".btn-loading");
          if (btnText && btnLoading) {
            btnText.style.display = "inline-block";
            btnLoading.style.display = "none";
          }
        }
      }
    });
  }

  // Initialize floating labels functionality
  function initFloatingLabels() {
    const floatingInputs = document.querySelectorAll(
      ".form-group.floating input"
    );

    floatingInputs.forEach((input) => {
      // Set initial state
      if (input.value) {
        input.parentElement.classList.add("filled");
      }

      // Add event listeners
      input.addEventListener("focus", function () {
        this.parentElement.classList.add("focused");
      });

      input.addEventListener("blur", function () {
        if (!this.value) {
          this.parentElement.classList.remove("focused");
        }
        this.parentElement.classList.toggle("filled", !!this.value);
      });
    });
  }

  // Reset floating labels after form submission
  function resetFloatingLabels() {
    const floatingInputs = document.querySelectorAll(
      ".form-group.floating input"
    );
    floatingInputs.forEach((input) => {
      input.parentElement.classList.remove("focused", "filled");
    });
  }

  // Get form data as object
  function getFormData() {
    const formData = new FormData(applicationForm);
    return {
      fullname: formData.get("fullname") || "",
      address: formData.get("address") || "",
      city: formData.get("city") || "",
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      terms: formData.get("terms") ? "Yes" : "No",
      newsletter: formData.get("newsletter") ? "Yes" : "No",
      timestamp: new Date().toISOString(),
      source: "Website Application Form",
    };
  }

  // Submit data to Google Sheets
  async function submitToGoogleSheets(formData) {
    // Your Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbwmQKRtzgRd6h0AE_mO3RikgdAFNt7ayrR2VGeB16HGa3diq2BGIat7EBNPro2MCZZk/exec";

    try {
      // Use no-cors mode for Google Apps Script
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Important for Google Apps Script
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // With no-cors mode, we can't read the response
      // So we assume success if no error is thrown
      console.log("Form submitted to Google Sheets");
      return { result: "success" };
    } catch (error) {
      console.error("Error submitting to Google Sheets:", error);
      throw new Error("Failed to submit application");
    }
  }

  // Show message to user
  function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector(".form-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement("div");
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.textContent = message;

    // Add styles
    messageDiv.style.cssText = `
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 8px;
      font-weight: 500;
      text-align: center;
      ${
        type === "success"
          ? "background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;"
          : "background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca;"
      }
    `;

    // Insert message before the form
    if (applicationForm) {
      applicationForm.parentNode.insertBefore(messageDiv, applicationForm);
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  // Function to show success message and hide form
  function showSuccessMessageAndHideForm(
    message,
    formElement,
    containerElement
  ) {
    // Create success message element
    const successDiv = document.createElement("div");
    successDiv.className = "form-success-message";
    successDiv.innerHTML = `
      <div class="success-icon">✓</div>
      <h3>Thank You!</h3>
      <p>${message}</p>
       <div class="next-steps">
          <h3>What Happens Next?</h3>
          <ul>
            <li>
              <div class="step-number">1</div>
              <div>
                <strong>Confirmation Packet</strong><br />
                You will receive your confirmation packet in the mail within 3-7
                business days
              </div>
            </li>
            <li>
              <div class="step-number">2</div>
              <div>
                <strong>First Task & Guidelines</strong><br />
                Your confirmation packet will include your first task and
                detailed guidelines
              </div>
            </li>
            <li>
              <div class="step-number">3</div>
              <div>
                <strong>Complete Your First Task</strong><br />
                Successfully complete your first assignment following the
                provided guidelines
              </div>
            </li>
            <li>
              <div class="step-number">4</div>
              <div>
                <strong>Unlock More Tasks</strong><br />
                After successful completion of your first task, you'll be able
                to access more assignments
              </div>
            </li>
          </ul>
        </div>
      <div class="share-section">
        <p><strong>Know someone who might be interested?</strong></p>
        <div class="share-buttons">
          <button class="share-btn whatsapp-btn" onclick="shareViaWhatsApp()">
            <span class="share-icon">📱</span> Share via WhatsApp
          </button>
          <button class="share-btn copy-link-btn" onclick="copyApplicationLink()">
            <span class="share-icon">🔗</span> Copy Application Link
          </button>
        </div>
        <div class="share-note">
          <small>Help your friends and family apply for this amazing opportunity!</small>
        </div>
      </div>
    `;

    // Add styles
    successDiv.style.cssText = `
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      margin: 1rem 0;
      animation: fadeInUp 0.6s ease-out;
    `;

    // Hide the form
    if (formElement) {
      formElement.style.display = "none";
    }

    // Insert success message in place of the form
    if (containerElement) {
      containerElement.appendChild(successDiv);
    } else if (formElement && formElement.parentNode) {
      formElement.parentNode.insertBefore(successDiv, formElement.nextSibling);
    }

    // Add CSS for animation if not already present
    addSuccessMessageStyles();
  }

  // Add success message styles dynamically
  function addSuccessMessageStyles() {
    if (!document.getElementById("success-message-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "success-message-styles";
      styleElement.textContent = `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .form-success-message .success-icon {
          width: 80px;
          height: 80px;
          background: #10b981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
          margin: 0 auto 1.5rem;
          animation: bounceIn 0.6s ease-out;
        }
        
        .form-success-message h3 {
          color: #10b981;
          font-size: 1.8rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        
        .form-success-message p {
          color: #6b7280;
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        
        .success-details {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1.5rem 0;
          text-align: left;
        }
        
        .success-details p {
          color: #374151;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .success-details ul {
          color: #6b7280;
          padding-left: 1.5rem;
          margin: 0;
        }
        
        .success-details li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        
        .share-section {
          background: #f0f9ff;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1.5rem 0;
          border: 1px solid #e0f2fe;
        }
        
        .share-section p {
          color: #0369a1;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .share-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        
        .share-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 180px;
        }
        
        .whatsapp-btn {
          background: #25D366;
          color: white;
        }
        
        .whatsapp-btn:hover {
          background: #128C7E;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(37, 211, 102, 0.3);
        }
        
        .copy-link-btn {
          background: #3b82f6;
          color: white;
        }
        
        .copy-link-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
        }
        
        .share-icon {
          font-size: 1.2rem;
        }
        
        .share-note {
          color: #6b7280;
          font-style: italic;
        }
        
        .copy-feedback {
          margin-top: 0.5rem;
          color: #059669;
          font-weight: 500;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .copy-feedback.show {
          opacity: 1;
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `;
      document.head.appendChild(styleElement);
    }
  }

  // MOBILE MENU TOGGLE
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navMenu = document.getElementById("navMenu");

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      // Change menu icon
      this.textContent = navMenu.classList.contains("active") ? "✕" : "☰";
    });

    // Close menu when clicking on a link
    const navLinks = navMenu.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        navMenu.classList.remove("active");
        mobileMenuBtn.textContent = "☰";
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
      if (
        !navMenu.contains(event.target) &&
        !mobileMenuBtn.contains(event.target)
      ) {
        navMenu.classList.remove("active");
        mobileMenuBtn.textContent = "☰";
      }
    });

    // Close menu on window resize (if resizing to desktop)
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        navMenu.classList.remove("active");
        mobileMenuBtn.textContent = "☰";
      }
    });
  }

  // MODERN RESPONSIVE NAVIGATION
  const hamburger = document.querySelector(".hamburger");
  const navMenuModern = document.querySelector(".nav-menu");
  const navLinksModern = document.querySelectorAll(".nav-link");
  const body = document.body;

  // Toggle mobile menu
  function toggleMenu() {
    hamburger.classList.toggle("active");
    navMenuModern.classList.toggle("active");
    body.classList.toggle("menu-open");
  }

  // Close mobile menu
  function closeMenu() {
    hamburger.classList.remove("active");
    navMenuModern.classList.remove("active");
    body.classList.remove("menu-open");
  }

  // Event Listeners
  if (hamburger) {
    hamburger.addEventListener("click", toggleMenu);
  }

  // Close menu when clicking on links
  navLinksModern.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (event) {
    const navContainer = document.querySelector(".nav-container");
    if (navContainer) {
      const isClickInsideNav = navContainer.contains(event.target);
      if (!isClickInsideNav && navMenuModern.classList.contains("active")) {
        closeMenu();
      }
    }
  });

  // Close menu on escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && navMenuModern.classList.contains("active")) {
      closeMenu();
    }
  });

  // Close menu on window resize (if resizing to desktop)
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768 && navMenuModern.classList.contains("active")) {
      closeMenu();
    }
  });

  // Prevent scrolling when menu is open on mobile
  if (navMenuModern) {
    navMenuModern.addEventListener(
      "touchmove",
      function (e) {
        if (navMenuModern.classList.contains("active")) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }
}); // End of DOMContentLoaded

// SHARE FUNCTIONS - These need to be in global scope
function shareViaWhatsApp() {
  const currentUrl = window.location.href;
  const shareText =
    "Check out this amazing opportunity! I just applied and thought you might be interested too. Apply here: ";
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    shareText + currentUrl
  )}`;
  window.open(whatsappUrl, "_blank");
}

function copyApplicationLink() {
  const currentUrl = window.location.href;
  const tempInput = document.createElement("input");
  tempInput.value = currentUrl;
  document.body.appendChild(tempInput);
  tempInput.select();
  tempInput.setSelectionRange(0, 99999);

  try {
    const successful = document.execCommand("copy");
    document.body.removeChild(tempInput);

    // Show feedback
    const shareSection = document.querySelector(".share-section");
    let feedback = shareSection.querySelector(".copy-feedback");

    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "copy-feedback";
      shareSection.appendChild(feedback);
    }

    feedback.textContent = "✓ Link copied to clipboard!";
    feedback.classList.add("show");

    setTimeout(() => {
      feedback.classList.remove("show");
    }, 3000);
  } catch (err) {
    console.error("Failed to copy: ", err);
    // Fallback: open in new window with share prompt
    window.open(currentUrl, "_blank");
  }
}
