document.addEventListener('DOMContentLoaded', () => {
  const AUTH_KEYS = {
    active: 'urbanChimneyAuth',
    loginTime: 'urbanChimneyLoginTime',
    sessionExpiry: 'urbanChimneySessionExpiry',
    mobile: 'customerMobile',
    name: 'customerName',
    city: 'customerCity',
    bookingHistory: 'bookingHistory',
    bookingId: 'bookingId',
    selectedService: 'selectedService',
    address: 'address',
    date: 'date',
    time: 'time',
    location: 'location',
    paymentMethod: 'paymentMethod',
    bookingAmount: 'bookingAmount'
  };

  const SESSION_DURATION_MS = 30 * 60 * 1000;
  const DEMO_OTP = '123456';
  const protectedPages = ['home.html', 'booking.html', 'payment.html', 'profile.html', 'track.html', 'success.html'];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const body = document.body;
  const loginForm = document.getElementById('loginForm');
  const bookingForm = document.getElementById('bookingForm');
  const locationButton = document.getElementById('locationButton');
  const locationField = document.getElementById('location');
  const mobileInput = document.getElementById('mobile');
  const otpInput = document.getElementById('otp');
  const sendOtpButton = document.getElementById('sendOtpButton');
  const verifyOtpButton = document.getElementById('verifyOtpButton');
  const formMessage = document.getElementById('formMessage');
  const otpStep = document.getElementById('otpStep');
  const verifyStep = document.getElementById('verifyStep');

  const toggleOtpFields = (visible) => {
    if (otpStep) otpStep.hidden = !visible;
    if (verifyStep) verifyStep.hidden = !visible;
  };

  const showToast = (message, type = 'info') => {
    const stack = document.getElementById('toastStack');
    if (!stack) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    stack.appendChild(toast);
    window.setTimeout(() => toast.classList.add('show'), 10);
    window.setTimeout(() => {
      toast.classList.remove('show');
      window.setTimeout(() => toast.remove(), 220);
    }, 3200);
  };

  const setFormMessage = (message, type) => {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
  };

  const showLoading = (message = 'Working on it...') => {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loadingOverlay';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="loading-card"><div class="spinner"></div><p></p></div>';
      document.body.appendChild(overlay);
    }
    overlay.querySelector('p').textContent = message;
    overlay.classList.add('active');
  };

  const hideLoading = () => {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  };

  const clearAuthState = () => {
    [AUTH_KEYS.active, AUTH_KEYS.loginTime, AUTH_KEYS.sessionExpiry, AUTH_KEYS.mobile, AUTH_KEYS.name, AUTH_KEYS.city, AUTH_KEYS.bookingId, AUTH_KEYS.selectedService, AUTH_KEYS.address, AUTH_KEYS.date, AUTH_KEYS.time, AUTH_KEYS.location, AUTH_KEYS.paymentMethod, AUTH_KEYS.bookingAmount].forEach((key) => localStorage.removeItem(key));
  };

  const saveAuthSession = (mobile) => {
    localStorage.setItem(AUTH_KEYS.active, 'active');
    localStorage.setItem(AUTH_KEYS.mobile, mobile);
    localStorage.setItem(AUTH_KEYS.loginTime, String(Date.now()));
    localStorage.setItem(AUTH_KEYS.sessionExpiry, String(Date.now() + SESSION_DURATION_MS));
    localStorage.setItem(AUTH_KEYS.name, localStorage.getItem(AUTH_KEYS.name) || 'Guest');
    localStorage.setItem(AUTH_KEYS.city, localStorage.getItem(AUTH_KEYS.city) || 'Not provided');
  };

  const isSessionValid = () => {
    const expiry = Number(localStorage.getItem(AUTH_KEYS.sessionExpiry) || 0);
    const isActive = localStorage.getItem(AUTH_KEYS.active) === 'active';
    return isActive && expiry > Date.now();
  };

  const redirectBasedOnSession = () => {
    if (currentPage === 'index.html') {
      if (isSessionValid()) {
        window.location.replace('home.html');
      }
      return;
    }

    if (!isSessionValid()) {
      clearAuthState();
      window.location.replace('index.html');
    }
  };

  const checkSession = () => {
    if (protectedPages.includes(currentPage) && !isSessionValid()) {
      clearAuthState();
      window.location.replace('index.html');
      return true;
    }
    return false;
  };

  const requestOtp = async (mobile) => new Promise((resolve) => {
    window.setTimeout(() => resolve({ ok: true, message: `Demo OTP sent to +91 ${mobile}. Use ${DEMO_OTP} to continue.` }), 250);
  });

  const verifyOtp = async (otp) => new Promise((resolve) => {
    window.setTimeout(() => resolve(otp === DEMO_OTP), 250);
  });

  const startResendCountdown = (button, seconds = 30) => {
    if (!button) return;
    let remaining = seconds;
    button.disabled = true;
    button.textContent = `Resend OTP (${remaining}s)`;

    const countdown = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        button.textContent = `Resend OTP (${remaining}s)`;
      } else {
        window.clearInterval(countdown);
        button.disabled = false;
        button.textContent = 'Resend OTP';
      }
    }, 1000);
  };

  const getBookingHistory = () => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEYS.bookingHistory) || '[]');
    } catch (error) {
      return [];
    }
  };

  const saveBookingHistory = (booking) => {
    const history = getBookingHistory();
    history.unshift(booking);
    localStorage.setItem(AUTH_KEYS.bookingHistory, JSON.stringify(history.slice(0, 8)));
  };

  const getServiceAmount = (service) => {
    const amounts = {
      'Chimney Cleaning': 799,
      'AC Service': 699,
      Electrical: 599,
      Plumbing: 649,
      Cleaning: 749,
      Painting: 899
    };
    return amounts[service] || 599;
  };

  const fillProfileFields = () => {
    const profileName = document.getElementById('profileName');
    const profileMobile = document.getElementById('profileMobile');
    const profileCity = document.getElementById('profileCity');
    if (profileName) profileName.value = localStorage.getItem(AUTH_KEYS.name) || 'Guest';
    if (profileMobile) profileMobile.value = localStorage.getItem(AUTH_KEYS.mobile) || 'Not available';
    if (profileCity) profileCity.value = localStorage.getItem(AUTH_KEYS.city) || 'Not provided';
  };

  const renderBookingHistory = () => {
    const list = document.getElementById('bookingHistoryList');
    if (!list) return;

    const history = getBookingHistory();
    if (!history.length) {
      list.innerHTML = '<div class="empty-state">No bookings yet. Your recent service requests will appear here.</div>';
      return;
    }

    list.innerHTML = history.map((item) => `
      <div class="history-item">
        <div>
          <strong>${item.service}</strong>
          <p>${item.address}</p>
        </div>
        <span>${item.date} • ${item.time}</span>
      </div>
    `).join('');
  };

  const renderTracking = () => {
    const bookingIdEl = document.getElementById('trackBookingId');
    const serviceEl = document.getElementById('trackService');
    const addressEl = document.getElementById('trackAddress');
    const dateEl = document.getElementById('trackDate');
    const timeEl = document.getElementById('trackTime');
    const timelineEl = document.getElementById('trackTimeline');
    if (!bookingIdEl && !serviceEl && !addressEl && !dateEl && !timeEl && !timelineEl) return;

    const booking = {
      bookingId: localStorage.getItem(AUTH_KEYS.bookingId) || 'UC-1001',
      service: localStorage.getItem(AUTH_KEYS.selectedService) || 'Chimney Cleaning',
      address: localStorage.getItem(AUTH_KEYS.address) || 'Not provided',
      date: localStorage.getItem(AUTH_KEYS.date) || 'Today',
      time: localStorage.getItem(AUTH_KEYS.time) || 'As scheduled'
    };

    if (bookingIdEl) bookingIdEl.textContent = booking.bookingId;
    if (serviceEl) serviceEl.textContent = booking.service;
    if (addressEl) addressEl.textContent = booking.address;
    if (dateEl) dateEl.textContent = booking.date;
    if (timeEl) timeEl.textContent = booking.time;

    if (timelineEl) {
      timelineEl.innerHTML = `
        <div class="timeline-item active"><div class="timeline-dot"></div><div><strong>Booked</strong><p>Your service request is confirmed.</p></div></div>
        <div class="timeline-item active"><div class="timeline-dot"></div><div><strong>Technician assigned</strong><p>A verified professional is preparing for your home.</p></div></div>
        <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Technician on the way</strong><p>Our expert is travelling to your location.</p></div></div>
        <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Service started</strong><p>Work has begun at your home.</p></div></div>
        <div class="timeline-item"><div class="timeline-dot"></div><div><strong>Service completed</strong><p>We have completed the job and checked quality.</p></div></div>`;
    }
  };

  const renderSuccessPage = () => {
    const bookingIdEl = document.getElementById('successBookingId');
    const serviceEl = document.getElementById('successService');
    const paymentEl = document.getElementById('successPayment');
    const dateEl = document.getElementById('successDate');
    const timeEl = document.getElementById('successTime');
    const addressEl = document.getElementById('successAddress');
    const amountEl = document.getElementById('successAmount');
    if (!bookingIdEl && !serviceEl && !paymentEl && !dateEl && !timeEl && !addressEl && !amountEl) return;

    const bookingId = localStorage.getItem(AUTH_KEYS.bookingId) || 'UC-1001';
    const service = localStorage.getItem(AUTH_KEYS.selectedService) || 'Chimney Cleaning';
    const payment = localStorage.getItem(AUTH_KEYS.paymentMethod) || 'UPI';
    const date = localStorage.getItem(AUTH_KEYS.date) || 'Today';
    const time = localStorage.getItem(AUTH_KEYS.time) || 'As scheduled';
    const address = localStorage.getItem(AUTH_KEYS.address) || 'Not provided';
    const amount = localStorage.getItem(AUTH_KEYS.bookingAmount) || getServiceAmount(service);

    if (bookingIdEl) bookingIdEl.textContent = bookingId;
    if (serviceEl) serviceEl.textContent = service;
    if (paymentEl) paymentEl.textContent = payment;
    if (dateEl) dateEl.textContent = date;
    if (timeEl) timeEl.textContent = time;
    if (addressEl) addressEl.textContent = address;
    if (amountEl) amountEl.textContent = `₹${amount}`;
  };

  const renderHomeDashboard = () => {
    const welcomeName = document.getElementById('welcomeName');
    const welcomeMobile = document.getElementById('welcomeMobile');
    const bookingSnapshot = document.getElementById('bookingSnapshot');
    if (!welcomeName && !welcomeMobile && !bookingSnapshot) return;

    const customerName = localStorage.getItem(AUTH_KEYS.name) || 'Guest';
    const mobile = localStorage.getItem(AUTH_KEYS.mobile) || 'Not available';
    const lastBooking = getBookingHistory()[0];

    if (welcomeName) welcomeName.textContent = `Welcome back, ${customerName}`;
    if (welcomeMobile) welcomeMobile.textContent = `Mobile: ${mobile}`;
    if (bookingSnapshot) {
      bookingSnapshot.innerHTML = lastBooking
        ? `<strong>Next up:</strong> ${lastBooking.service} on ${lastBooking.date}`
        : '<strong>Next up:</strong> Book your first premium service';
    }
  };

  const setupBookingWizard = () => {
    const serviceOptions = document.querySelectorAll('.option-card');
    const nextButton = document.getElementById('nextStepButton');
    const prevButton = document.getElementById('prevStepButton');
    const stepPanels = Array.from(document.querySelectorAll('.step-panel'));
    const stepChips = Array.from(document.querySelectorAll('.step-chip'));
    const serviceField = document.getElementById('service');
    const bookingName = document.getElementById('bookingName');
    const bookingMobile = document.getElementById('bookingMobile');
    const bookingCity = document.getElementById('bookingCity');
    const address = document.getElementById('address');
    const date = document.getElementById('date');
    const time = document.getElementById('time');
    const summaryService = document.getElementById('summaryService');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    const summaryAddress = document.getElementById('summaryAddress');
    const confirmService = document.getElementById('confirmService');
    const confirmDate = document.getElementById('confirmDate');
    const confirmTime = document.getElementById('confirmTime');
    const confirmAddress = document.getElementById('confirmAddress');

    if (!serviceOptions.length || !nextButton || !prevButton) return;

    let currentStep = 1;

    const updateSummary = () => {
      if (summaryService) summaryService.textContent = serviceField?.value || 'Select service';
      if (summaryDate) summaryDate.textContent = date?.value || 'Choose date';
      if (summaryTime) summaryTime.textContent = time?.value || 'Choose time';
      if (summaryAddress) summaryAddress.textContent = address?.value.trim() || 'Enter address';
      if (confirmService) confirmService.textContent = serviceField?.value || '-';
      if (confirmDate) confirmDate.textContent = date?.value || '-';
      if (confirmTime) confirmTime.textContent = time?.value || '-';
      if (confirmAddress) confirmAddress.textContent = address?.value.trim() || '-';
    };

    const updateWizard = () => {
      stepPanels.forEach((panel) => panel.classList.toggle('active', Number(panel.dataset.stepPanel) === currentStep));
      stepChips.forEach((chip) => chip.classList.toggle('active', Number(chip.dataset.stepChip) === currentStep));
      prevButton.disabled = currentStep === 1;
      nextButton.textContent = currentStep === 5 ? 'Confirm booking' : 'Next';
      updateSummary();
    };

    serviceOptions.forEach((option) => {
      option.addEventListener('click', () => {
        serviceOptions.forEach((item) => item.classList.remove('selected'));
        option.classList.add('selected');
        if (serviceField) serviceField.value = option.dataset.service;
        updateSummary();
      });
    });

    [bookingName, bookingMobile, bookingCity, address, date, time].forEach((field) => {
      if (field) {
        field.addEventListener('input', updateSummary);
        field.addEventListener('change', updateSummary);
      }
    });

    prevButton.addEventListener('click', () => {
      currentStep = Math.max(1, currentStep - 1);
      updateWizard();
    });

    nextButton.addEventListener('click', () => {
      if (currentStep === 1 && !serviceField?.value) {
        showToast('Please choose a service to continue.', 'error');
        return;
      }
      if (currentStep === 2 && !date?.value) {
        showToast('Please choose a date.', 'error');
        return;
      }
      if (currentStep === 3 && !time?.value) {
        showToast('Please choose a time.', 'error');
        return;
      }
      if (currentStep === 4) {
        if (!bookingName?.value.trim() || !bookingMobile?.value.trim() || !bookingCity?.value || !address?.value.trim()) {
          showToast('Please complete the address details.', 'error');
          return;
        }
        if (!/^[0-9]{10}$/.test(bookingMobile.value.trim())) {
          showToast('Please enter a valid 10-digit mobile number.', 'error');
          return;
        }
      }

      if (currentStep === 5) {
        const bookingId = `UC-${Math.floor(10000 + Math.random() * 90000)}`;
        const booking = {
          id: bookingId,
          service: serviceField.value,
          address: address.value.trim(),
          date: date.value,
          time: time.value,
          city: bookingCity.value,
          mobile: bookingMobile.value.trim(),
          customerName: bookingName.value.trim(),
          createdAt: new Date().toLocaleString()
        };

        localStorage.setItem(AUTH_KEYS.bookingId, bookingId);
        localStorage.setItem(AUTH_KEYS.selectedService, booking.service);
        localStorage.setItem(AUTH_KEYS.address, booking.address);
        localStorage.setItem(AUTH_KEYS.date, booking.date);
        localStorage.setItem(AUTH_KEYS.time, booking.time);
        localStorage.setItem(AUTH_KEYS.location, locationField ? locationField.value : '');
        localStorage.setItem(AUTH_KEYS.name, booking.customerName);
        localStorage.setItem(AUTH_KEYS.mobile, booking.mobile);
        localStorage.setItem(AUTH_KEYS.city, bookingCity.value);
        localStorage.setItem(AUTH_KEYS.bookingAmount, String(getServiceAmount(booking.service)));
        localStorage.setItem(AUTH_KEYS.paymentMethod, 'Pending selection');
        saveBookingHistory(booking);
        sendBookingNotificationEmail({
          ...booking,
          amount: getServiceAmount(booking.service),
          paymentMethod: 'Pending selection'
        });
        showToast('Booking confirmed. Continue to payment.', 'success');
        window.setTimeout(() => window.location.href = 'payment.html', 400);
        return;
      }

      currentStep = Math.min(5, currentStep + 1);
      updateWizard();
    });

    const initialService = new URLSearchParams(window.location.search).get('service');
    if (initialService) {
      const match = Array.from(serviceOptions).find((option) => option.dataset.service === initialService);
      if (match) {
        match.classList.add('selected');
        if (serviceField) serviceField.value = initialService;
      }
    }

    if (bookingName) bookingName.value = localStorage.getItem(AUTH_KEYS.name) || '';
    if (bookingMobile) bookingMobile.value = localStorage.getItem(AUTH_KEYS.mobile) || '';
    if (bookingCity) bookingCity.value = localStorage.getItem(AUTH_KEYS.city) || '';
    updateWizard();
  };

  const setupPayments = () => {
    const confirmButton = document.getElementById('confirmPaymentButton');
    const paymentOptions = document.querySelectorAll('.payment-option');
    if (!paymentOptions.length) return;

    paymentOptions.forEach((option) => {
      option.addEventListener('click', (event) => {
        if (event.target.closest('button[data-copy], button[data-open]')) {
          return;
        }
        paymentOptions.forEach((item) => item.classList.remove('selected'));
        option.classList.add('selected');
        const input = option.querySelector('input');
        if (input) input.checked = true;
      });
    });

    document.querySelectorAll('button[data-copy]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        try {
          await navigator.clipboard.writeText(button.getAttribute('data-copy') || '');
          showToast('Copied to clipboard.', 'success');
        } catch (error) {
          showToast('Copy failed. Please copy manually.', 'error');
        }
      });
    });

    document.querySelectorAll('button[data-open]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const amount = localStorage.getItem(AUTH_KEYS.bookingAmount) || '599';
        const upiLink = `upi://pay?pa=9701434006-2@OKAXIS&pn=Rajasekhar&am=${amount}&tn=Urban%20Chimney%20Service`;
        const deepLink = button.getAttribute('data-open') === 'phonepe'
          ? `phonepe://pay?pa=9701434006-2@OKAXIS&pn=Rajasekhar&am=${amount}&tn=Urban%20Chimney%20Service`
          : `tez://upi/pay?pa=9701434006-2@OKAXIS&pn=Rajasekhar&am=${amount}&tn=Urban%20Chimney%20Service`;
        window.location.href = deepLink;
        window.setTimeout(() => {
          window.location.href = upiLink;
        }, 800);
      });
    });

    if (confirmButton) {
      confirmButton.addEventListener('click', () => {
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        if (!selectedPayment) {
          showToast('Please choose a payment method.', 'error');
          return;
        }
        const paymentMethod = selectedPayment.value;
        localStorage.setItem(AUTH_KEYS.paymentMethod, paymentMethod);
        sendBookingNotificationEmail({
          id: localStorage.getItem(AUTH_KEYS.bookingId) || 'UC-1001',
          service: localStorage.getItem(AUTH_KEYS.selectedService) || 'Chimney Cleaning',
          address: localStorage.getItem(AUTH_KEYS.address) || 'Not provided',
          date: localStorage.getItem(AUTH_KEYS.date) || 'Today',
          time: localStorage.getItem(AUTH_KEYS.time) || 'As scheduled',
          mobile: localStorage.getItem(AUTH_KEYS.mobile) || 'N/A',
          customerName: localStorage.getItem(AUTH_KEYS.name) || 'Guest',
          amount: localStorage.getItem(AUTH_KEYS.bookingAmount) || '599',
          paymentMethod
        });
        showToast('Payment selected. Your booking is confirmed.', 'success');
        window.setTimeout(() => {
          window.location.href = 'success.html';
        }, 400);
      });
    }
  };

  const setupReceiptDownload = () => {
    const button = document.getElementById('downloadReceiptButton');
    if (!button) return;

    button.addEventListener('click', () => {
      const receipt = [
        'Urban Chimney Receipt',
        `Booking ID: ${localStorage.getItem(AUTH_KEYS.bookingId) || 'UC-1001'}`,
        `Customer: ${localStorage.getItem(AUTH_KEYS.name) || 'Guest'}`,
        `Service: ${localStorage.getItem(AUTH_KEYS.selectedService) || 'Chimney Cleaning'}`,
        `Date: ${localStorage.getItem(AUTH_KEYS.date) || 'Today'}`,
        `Time: ${localStorage.getItem(AUTH_KEYS.time) || 'As scheduled'}`,
        `Address: ${localStorage.getItem(AUTH_KEYS.address) || 'Not provided'}`,
        `Payment: ${localStorage.getItem(AUTH_KEYS.paymentMethod) || 'UPI'}`,
        `Amount: ₹${localStorage.getItem(AUTH_KEYS.bookingAmount) || '599'}`
      ].join('\n');
      const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'urban-chimney-receipt.txt';
      link.click();
      URL.revokeObjectURL(link.href);
      showToast('Receipt downloaded successfully.', 'success');
    });
  };

  const sendBookingNotificationEmail = (booking) => {
    const customerName = booking.customerName || localStorage.getItem(AUTH_KEYS.name) || 'Guest';
    const mobileNumber = booking.mobile || localStorage.getItem(AUTH_KEYS.mobile) || 'N/A';
    const amount = booking.amount || localStorage.getItem(AUTH_KEYS.bookingAmount) || getServiceAmount(booking.service);
    const paymentMethod = booking.paymentMethod || localStorage.getItem(AUTH_KEYS.paymentMethod) || 'Pending selection';
    const subject = `Urban Chimney Booking Confirmation - ${booking.id}`;
    const body = [
      `Customer Name: ${customerName}`,
      `Mobile Number: ${mobileNumber}`,
      `Selected Service: ${booking.service}`,
      `Booking Date: ${booking.date}`,
      `Booking Time: ${booking.time}`,
      `Address: ${booking.address}`,
      `Payment Method: ${paymentMethod}`,
      `Amount: ₹${amount}`,
      `Booking ID: ${booking.id}`
    ].join('%0A');

    const mailtoLink = `mailto:KRS.MF66@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    try {
      window.location.href = mailtoLink;
    } catch (error) {
      console.warn('Unable to open mail client.', error);
    }
  };

  const initAuth = () => {
    if (currentPage === 'index.html') {
      redirectBasedOnSession();
      return;
    }

    if (protectedPages.includes(currentPage)) {
      redirectBasedOnSession();
      window.setInterval(checkSession, 1000);
    }
  };

  const initHeaderActions = () => {
    document.querySelectorAll('#logoutButton').forEach((button) => {
      button.addEventListener('click', () => {
        clearAuthState();
        window.location.href = 'index.html';
      });
    });
  };

  const initLogin = () => {
    if (!loginForm) return;
    let otpSent = false;

    const updateSendOtpButtonState = () => {
      if (!sendOtpButton) return;
      sendOtpButton.disabled = !/^[0-9]{10}$/.test(mobileInput?.value.trim() || '');
    };

    const updateVerifyButtonState = () => {
      if (!verifyOtpButton || !otpInput) return;
      verifyOtpButton.disabled = !otpSent || otpInput.value.trim().length !== 6;
    };

    if (mobileInput) {
      mobileInput.addEventListener('input', () => {
        updateSendOtpButtonState();
        if (!otpSent) {
          toggleOtpFields(false);
        }
      });
    }

    if (otpInput) {
      otpInput.addEventListener('input', updateVerifyButtonState);
    }

    if (sendOtpButton) {
      sendOtpButton.addEventListener('click', async () => {
        const mobile = mobileInput?.value.trim() || '';
        if (!/^[0-9]{10}$/.test(mobile)) {
          setFormMessage('Please enter a valid 10-digit mobile number.', 'error');
          showToast('Please enter a valid 10-digit mobile number.', 'error');
          return;
        }

        showLoading('Sending OTP...');
        const result = await requestOtp(mobile);
        hideLoading();
        otpSent = true;
        toggleOtpFields(true);
        if (otpInput) {
          otpInput.value = '';
          otpInput.focus();
        }
        updateVerifyButtonState();
        startResendCountdown(sendOtpButton);
        setFormMessage(result.message, 'success');
      });
    }

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const mobile = mobileInput?.value.trim() || '';
      const otp = otpInput?.value.trim() || '';

      if (!/^[0-9]{10}$/.test(mobile)) {
        setFormMessage('Please enter a valid 10-digit mobile number.', 'error');
        return;
      }
      if (!otpSent) {
        setFormMessage('Please request the OTP first.', 'error');
        return;
      }
      if (!/^[0-9]{6}$/.test(otp)) {
        setFormMessage('Please enter a valid 6-digit OTP.', 'error');
        return;
      }

      showLoading('Verifying OTP...');
      const isValidOtp = await verifyOtp(otp);
      hideLoading();
      if (!isValidOtp) {
        setFormMessage('Incorrect OTP. Use 123456 for the demo.', 'error');
        return;
      }

      saveAuthSession(mobile);
      localStorage.setItem(AUTH_KEYS.name, 'Guest');
      localStorage.setItem(AUTH_KEYS.city, 'Not provided');
      setFormMessage('Login successful. Redirecting to your dashboard...', 'success');
      showToast('Login successful. Redirecting to your dashboard...', 'success');
      window.setTimeout(() => window.location.href = 'home.html', 500);
    });

    updateSendOtpButtonState();
    updateVerifyButtonState();
    toggleOtpFields(false);
  };

  const initLocation = () => {
    if (!locationButton || !locationField) return;
    locationButton.addEventListener('click', () => {
      if (!navigator.geolocation) {
        showToast('Geolocation is not supported on this device.', 'error');
        return;
      }
      showLoading('Finding your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          hideLoading();
          locationField.value = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
          showToast('Location attached successfully.', 'success');
        },
        () => {
          hideLoading();
          showToast('Location access was denied. Please add it manually.', 'error');
        }
      );
    });
  };

  initAuth();
  initHeaderActions();
  initLogin();
  initLocation();
  fillProfileFields();
  renderBookingHistory();
  renderTracking();
  renderSuccessPage();
  renderHomeDashboard();
  setupBookingWizard();
  setupPayments();
  setupReceiptDownload();

  const toastStack = document.getElementById('toastStack');
  if (!toastStack) {
    const stack = document.createElement('div');
    stack.id = 'toastStack';
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }

  window.addEventListener('beforeunload', hideLoading);
});
