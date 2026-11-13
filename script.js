/**
 * ============================================================================
 * CITYHEALTH CLINIC - APPOINTMENT REQUEST SYSTEM
 * ARCHITECTURE: MODEL-VIEW-CONTROLLER (MVC)
 * ============================================================================
 * Separation of Concerns:
 *  - MODEL:      State storage, data entities, and business validation rules.
 *  - VIEW:       DOM element management, UI rendering, Toast notifications, and screen views.
 *  - CONTROLLER: User event handling, coordination between Model and View.
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. MODEL LAYER (Data & Validation Rules)
     ========================================================================== */
  const Model = {
    // Current active appointment data
    currentAppointment: null,

    // In-memory collection of all submitted appointments
    appointments: [],

    /**
     * Business validation rules for all fields.
     * Each validator returns { isValid: boolean, message: string }
     */
    validators: {
      fullName: function (value) {
        const trimmed = (value || '').trim();
        if (!trimmed) {
          return { isValid: false, message: 'Full name is required. Please enter your name.' };
        }
        if (trimmed.length < 3) {
          return { isValid: false, message: 'Name must be at least 3 characters long.' };
        }
        const nameRegex = /^[a-zA-Z\s.'-]+$/;
        if (!nameRegex.test(trimmed)) {
          return { isValid: false, message: 'Name should only contain letters and standard punctuation.' };
        }
        return { isValid: true, message: '' };
      },

      email: function (value) {
        const trimmed = (value || '').trim();
        if (!trimmed) {
          return { isValid: false, message: 'Email address is required. Please provide a contact email.' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(trimmed)) {
          return { isValid: false, message: 'Enter a valid email address format (e.g., patient@example.com).' };
        }
        return { isValid: true, message: '' };
      },

      phone: function (value) {
        const trimmed = (value || '').trim();
        if (!trimmed) {
          return { isValid: false, message: 'Phone number is required for appointment SMS updates.' };
        }
        const digits = trimmed.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 11) {
          return { isValid: false, message: 'Phone number must be 10 or 11 digits (e.g., 09171234567).' };
        }
        return { isValid: true, message: '' };
      },

      department: function (value) {
        if (!value || value.trim() === '') {
          return { isValid: false, message: 'Please select a clinic department from the dropdown list.' };
        }
        return { isValid: true, message: '' };
      },

      appointmentDate: function (value) {
        if (!value) {
          return { isValid: false, message: 'Please select your preferred appointment date.' };
        }
        const selectedDate = new Date(value + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(selectedDate.getTime())) {
          return { isValid: false, message: 'Invalid date. Please choose a valid calendar date.' };
        }
        if (selectedDate <= today) {
          return { isValid: false, message: 'Date must be tomorrow or later. For same-day visits, walk-in at triage.' };
        }
        return { isValid: true, message: '' };
      },

      timeSlot: function (value) {
        if (!value) {
          return { isValid: false, message: 'Please choose either a Morning or Afternoon time slot.' };
        }
        return { isValid: true, message: '' };
      },

      consent: function (isChecked) {
        if (!isChecked) {
          return { isValid: false, message: 'You must acknowledge the clinic policies before submitting.' };
        }
        return { isValid: true, message: '' };
      },

      reason: function (value) {
        const trimmed = (value || '').trim();
        if (trimmed.length > 300) {
          return { isValid: false, message: 'Reason must be 300 characters or fewer.' };
        }
        return { isValid: true, message: '' };
      }
    },

    /**
     * Generates a unique appointment tracking reference ID
     */
    generateReferenceId: function () {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      return `#APT-2026-${randomDigits}`;
    },

    /**
     * Saves a confirmed appointment to the in-memory store
     */
    saveAppointment: function (formData) {
      const record = {
        referenceId: this.generateReferenceId(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.timeSlot,
        reason: formData.reason ? formData.reason.trim() : '',
        timestamp: new Date().toISOString()
      };
      this.currentAppointment = record;
      this.appointments.push(record);
      return record;
    }
  };

  /* ==========================================================================
     2. VIEW LAYER (DOM Queries, Rendering, Toast, Screen Transitions)
     ========================================================================== */
  const View = {
    // Cached DOM elements
    elements: {
      formScreen: document.getElementById('form-screen'),
      confirmationScreen: document.getElementById('confirmation-screen'),
      form: document.getElementById('appointment-form'),
      toastContainer: document.getElementById('toast-container'),
      reasonCounter: document.getElementById('reason-counter'),
      submitBtn: document.getElementById('submit-btn'),
      bookAnotherBtn: document.getElementById('book-another-btn'),
      printSummaryBtn: document.getElementById('print-summary-btn'),

      // Inputs
      fullNameInput: document.getElementById('fullName'),
      emailInput: document.getElementById('email'),
      phoneInput: document.getElementById('phone'),
      departmentSelect: document.getElementById('department'),
      dateInput: document.getElementById('appointmentDate'),
      reasonInput: document.getElementById('reason'),
      consentCheckbox: document.getElementById('consent'),

      // Confirmation screen display fields
      summaryRef: document.getElementById('summary-referenceId'),
      summaryName: document.getElementById('summary-name'),
      summaryDepartment: document.getElementById('summary-department'),
      summaryDate: document.getElementById('summary-date'),
      summaryTime: document.getElementById('summary-time'),
      summaryContact: document.getElementById('summary-contact'),
      summaryReason: document.getElementById('summary-reason')
    },

    /**
     * Sets the minimum date in the datepicker to tomorrow
     */
    initDatePickerMin: function () {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yyyy = tomorrow.getFullYear();
      const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd = String(tomorrow.getDate()).padStart(2, '0');
      this.elements.dateInput.min = `${yyyy}-${mm}-${dd}`;
    },

    /**
     * Displays a validation error message under a specific field
     */
    showFieldError: function (fieldName, message) {
      const group = document.getElementById(`field-group-${fieldName}`);
      const errorP = document.getElementById(`${fieldName}-error`);
      if (group) {
        group.classList.add('has-error');
        group.classList.remove('has-success');
      }
      if (errorP) {
        errorP.textContent = message;
      }
    },

    /**
     * Clears validation error from a specific field
     */
    clearFieldError: function (fieldName) {
      const group = document.getElementById(`field-group-${fieldName}`);
      const errorP = document.getElementById(`${fieldName}-error`);
      if (group) {
        group.classList.remove('has-error');
        group.classList.add('has-success');
      }
      if (errorP) {
        errorP.textContent = '';
      }
    },

    /**
     * Displays an elegant Google Material Design 3 Toast / Snackbar
     * @param {string} message Text message to display
     * @param {'error'|'success'} type Toast variant
     * @param {number} durationMs Auto-dismiss duration in milliseconds
     */
    showToast: function (message, type = 'error', durationMs = 4500) {
      const container = this.elements.toastContainer;
      if (!container) return;

      // Clear existing toasts to prevent stacking clutter
      container.innerHTML = '';

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

      // Authentic Google MD3 Vector Icons (16px scaled)
      const iconSvg = type === 'error'
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f28b82" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <circle cx="12" cy="12" r="10"></circle>
             <line x1="12" y1="8" x2="12" y2="12"></line>
             <circle cx="12" cy="16" r="1" fill="#f28b82"></circle>
           </svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#81c995" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
             <path d="M20 6L9 17l-5-5"></path>
           </svg>`;

      toast.innerHTML = `
        <div class="toast-icon-wrap toast-icon-${type}" aria-hidden="true">
          ${iconSvg}
        </div>
        <span class="toast-message">${message}</span>
        <button type="button" class="toast-action" aria-label="Dismiss notification">Dismiss</button>
      `;

      // Google-style action dismiss button
      const actionBtn = toast.querySelector('.toast-action');
      actionBtn.addEventListener('click', function () {
        View.dismissToast(toast);
      });

      container.appendChild(toast);

      // Auto dismiss with graceful exit
      setTimeout(() => {
        View.dismissToast(toast);
      }, durationMs);
    },

    /**
     * Smoothly removes a toast
     */
    dismissToast: function (toast) {
      if (!toast || !toast.parentNode) return;
      toast.classList.add('toast-hiding');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 200);
    },

    /**
     * Updates the character counter on the textarea
     */
    updateCharCounter: function (currentLength, maxLength = 300) {
      if (this.elements.reasonCounter) {
        this.elements.reasonCounter.textContent = `${currentLength} / ${maxLength}`;
      }
    },

    /**
     * Formats a raw YYYY-MM-DD date into friendly readable format
     */
    formatFriendlyDate: function (dateStr) {
      if (!dateStr) return '';
      const [year, month, day] = dateStr.split('-');
      const d = new Date(year, month - 1, day);
      const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
      return d.toLocaleDateString('en-US', options);
    },

    /**
     * Populates Screen 2 (Confirmation View) with the confirmed appointment data
     */
    renderConfirmation: function (appointment) {
      this.elements.summaryRef.textContent = appointment.referenceId;
      this.elements.summaryName.textContent = appointment.fullName;
      this.elements.summaryDepartment.textContent = appointment.department;
      this.elements.summaryDate.textContent = this.formatFriendlyDate(appointment.appointmentDate);
      this.elements.summaryTime.textContent = appointment.timeSlot;
      this.elements.summaryContact.textContent = `${appointment.email} • ${appointment.phone}`;
      this.elements.summaryReason.textContent = appointment.reason ? appointment.reason : 'None provided';
    },

    /**
     * Switches the active screen view between Form Screen (1) and Confirmation Screen (2)
     */
    switchScreen: function (targetScreen) {
      if (targetScreen === 'confirmation') {
        this.elements.formScreen.classList.add('hidden');
        this.elements.formScreen.classList.remove('active');
        this.elements.confirmationScreen.classList.remove('hidden');
        this.elements.confirmationScreen.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        this.elements.confirmationScreen.classList.add('hidden');
        this.elements.confirmationScreen.classList.remove('active');
        this.elements.formScreen.classList.remove('hidden');
        this.elements.formScreen.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    /**
     * Resets the entire form and removes all validation indicators
     */
    resetForm: function () {
      this.elements.form.reset();
      const allGroups = document.querySelectorAll('.form-field');
      allGroups.forEach(g => {
        g.classList.remove('has-error', 'has-success');
      });
      const allErrors = document.querySelectorAll('.field-message');
      allErrors.forEach(e => {
        e.textContent = '';
      });
      if (this.elements.toastContainer) {
        this.elements.toastContainer.innerHTML = '';
      }
      this.updateCharCounter(0);
    }
  };

  /* ==========================================================================
     3. CONTROLLER LAYER (Event Listeners & Coordination)
     ========================================================================== */
  const Controller = {
    // Flag: Validation only runs after the user hits the submit button
    hasSubmitted: false,

    /**
     * Extracts all current values from the form inputs
     */
    getFormData: function () {
      const selectedTime = document.querySelector('input[name="timeSlot"]:checked');
      return {
        fullName: View.elements.fullNameInput.value,
        email: View.elements.emailInput.value,
        phone: View.elements.phoneInput.value,
        department: View.elements.departmentSelect.value,
        appointmentDate: View.elements.dateInput.value,
        timeSlot: selectedTime ? selectedTime.value : '',
        reason: View.elements.reasonInput.value,
        consent: View.elements.consentCheckbox.checked
      };
    },

    /**
     * Validates a single named field using Model validators and updates View feedback
     */
    validateSingleField: function (fieldName) {
      const formData = this.getFormData();
      const validator = Model.validators[fieldName];
      if (!validator) return true;

      const result = validator(formData[fieldName]);
      if (!result.isValid) {
        View.showFieldError(fieldName, result.message);
        return false;
      } else {
        View.clearFieldError(fieldName);
        return true;
      }
    },

    /**
     * Performs full validation across all form fields
     */
    validateAll: function () {
      const fields = ['fullName', 'email', 'phone', 'department', 'appointmentDate', 'timeSlot', 'consent', 'reason'];
      let allValid = true;
      let firstInvalidField = null;

      fields.forEach(field => {
        const isValid = this.validateSingleField(field);
        if (!isValid) {
          allValid = false;
          if (!firstInvalidField) {
            firstInvalidField = field;
          }
        }
      });

      return { allValid, firstInvalidField };
    },

    /**
     * EVENT HANDLER 1: Form Submit (Event: 'submit')
     * Validation triggers here! Uses preventDefault(), shows Toast, switches screen on success.
     */
    handleFormSubmit: function (e) {
      e.preventDefault(); // Requirement 4b: Correct use of preventDefault()

      // Enable active validation mode from now on
      Controller.hasSubmitted = true;

      const { allValid, firstInvalidField } = Controller.validateAll();

      if (!allValid) {
        // Show Google Material 3 Toast for error
        View.showToast('Please fix the highlighted errors before requesting your appointment.', 'error');

        // Accessibility: Focus first invalid field
        const el = document.getElementById(firstInvalidField);
        if (el && typeof el.focus === 'function') {
          el.focus();
        }
        return;
      }

      // Valid: Save to Model
      const formData = Controller.getFormData();
      const savedRecord = Model.saveAppointment(formData);

      // Show Google Material 3 Toast for success
      View.showToast('Appointment confirmed! Viewing your summary details.', 'success', 3500);

      // Render Screen 2 and navigate
      View.renderConfirmation(savedRecord);
      View.switchScreen('confirmation');
    },

    /**
     * EVENT HANDLER 2: Live validation as user leaves field (Event: 'blur')
     * Only validates if the user has already attempted to submit
     */
    handleFieldBlur: function (e) {
      if (!Controller.hasSubmitted) return;

      const target = e.target;
      if (!target) return;
      const fieldName = target.name || target.id;
      if (Model.validators[fieldName]) {
        Controller.validateSingleField(fieldName);
      }
    },

    /**
     * EVENT HANDLER 3: Real-time validation as user types/changes (Events: 'input', 'change')
     */
    handleFieldInput: function (e) {
      const target = e.target;
      if (!target) return;
      const fieldName = target.name || target.id;

      // Always update character counter for reason textarea
      if (fieldName === 'reason') {
        View.updateCharCounter(target.value.length);
      }

      // Only show/clear validation feedback if submit was previously clicked
      if (Controller.hasSubmitted) {
        Controller.validateSingleField(fieldName);
      }
    },

    /**
     * EVENT HANDLER 4: Time slot radio change (Event: 'change')
     */
    handleRadioChange: function () {
      if (Controller.hasSubmitted) {
        Controller.validateSingleField('timeSlot');
      }
    },

    /**
     * EVENT HANDLER 5: Consent checkbox change (Event: 'change')
     */
    handleConsentChange: function () {
      if (Controller.hasSubmitted) {
        Controller.validateSingleField('consent');
      }
    },

    /**
     * EVENT HANDLER 6: Book another appointment button (Event: 'click')
     * Returns user to Screen 1, resets validation state
     */
    handleBookAnotherClick: function () {
      Controller.hasSubmitted = false;
      View.resetForm();
      View.switchScreen('form');
    },

    /**
     * EVENT HANDLER 7: Print / Save summary button (Event: 'click')
     */
    handlePrintSummaryClick: function () {
      window.print();
    },

    /**
     * Initializes all event bindings on application load
     */
    init: function () {
      // 1. Initialize View constraints
      View.initDatePickerMin();

      // 2. Form submission handler
      View.elements.form.addEventListener('submit', this.handleFormSubmit);

      // 3. Blur handlers
      const blurFields = [
        View.elements.fullNameInput,
        View.elements.emailInput,
        View.elements.phoneInput,
        View.elements.departmentSelect,
        View.elements.dateInput
      ];
      blurFields.forEach(field => {
        if (field) {
          field.addEventListener('blur', this.handleFieldBlur);
        }
      });

      // 4. Real-time typing input handlers
      const inputFields = [
        View.elements.fullNameInput,
        View.elements.emailInput,
        View.elements.phoneInput,
        View.elements.reasonInput
      ];
      inputFields.forEach(field => {
        if (field) {
          field.addEventListener('input', this.handleFieldInput);
        }
      });

      // 5. Change handlers for dropdown, radios, and checkbox
      if (View.elements.departmentSelect) {
        View.elements.departmentSelect.addEventListener('change', () => {
          if (this.hasSubmitted) this.validateSingleField('department');
        });
      }
      if (View.elements.dateInput) {
        View.elements.dateInput.addEventListener('change', () => {
          if (this.hasSubmitted) this.validateSingleField('appointmentDate');
        });
      }
      const radioSlots = document.querySelectorAll('input[name="timeSlot"]');
      radioSlots.forEach(radio => {
        radio.addEventListener('change', this.handleRadioChange);
      });
      if (View.elements.consentCheckbox) {
        View.elements.consentCheckbox.addEventListener('change', this.handleConsentChange);
      }

      // 6. Navigation / Action click handlers
      if (View.elements.bookAnotherBtn) {
        View.elements.bookAnotherBtn.addEventListener('click', this.handleBookAnotherClick);
      }
      if (View.elements.printSummaryBtn) {
        View.elements.printSummaryBtn.addEventListener('click', this.handlePrintSummaryClick);
      }

      console.log('CityHealth Clinic MVC Architecture initialized successfully.');
    }
  };

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    Controller.init();
  });

})();
