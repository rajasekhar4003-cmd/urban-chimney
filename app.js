document.addEventListener('DOMContentLoaded', () => {
  const AUTH_KEYS = {
    active: 'urbanChimneyAuth',
    loginTime: 'urbanChimneyLoginTime',
    sessionExpiry: 'urbanChimneySessionExpiry',
    mobile: 'customerMobile',
    name: 'customerName',
    city: 'customerCity'
  };
  const SESSION_DURATION_MS = 30 * 60 * 1000;
  const DEMO_OTP = '1234';
  const protectedPages = ['home.html', 'booking.html', 'payment.html', 'profile.html', 'track.html', 'success.html'];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const loginForm = document.getElementById('loginForm');
  const bookingForm = document.getElementById('bookingForm');
  const paymentForm = document.getElementById('paymentForm');
  const locationButton = document.getElementById('locationButton');
  const locationField = document.getElementById('location');
  const mobileInput = document.getElementById('mobile');
  const otpInput = document.getElementById('otp');
  const sendOtpButton = document.getElementById('sendOtpButton');
  const verifyOtpButton = document.getElementById('verifyOtpButton');
  const formMessage = document.getElementById('formMessage');

  const showMessage = (message, type = 'info') => {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
  };

  const clearAuthState = () => {
    Object.values(AUTH_KEYS).forEach((key) => localStorage.removeItem(key));
  };

  const saveAuthSession = (mobile) => {
    localStorage.setItem(AUTH_KEYS.active, 'active');
    localStorage.setItem(AUTH_KEYS.mobile, mobile);
    localStorage.setItem(AUTH_KEYS.loginTime, String(Date.now()));
    localStorage.setItem(AUTH_KEYS.sessionExpiry, String(Date.now() + SESSION_DURATION_MS));
    localStorage.setItem(AUTH_KEYS.name, 'Guest');
    localStorage.setItem(AUTH_KEYS.city, 'Not provided');
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

  const addLogoutButton = () => {
    const headerInner = document.querySelector('.header-inner');
    if (!headerInner || document.getElementById('logoutButton')) return;

    const logoutButton = document.createElement('button');
    logoutButton.type = 'button';
    logoutButton.id = 'logoutButton';
    logoutButton.className = 'nav-logout';
    logoutButton.textContent = 'Logout';
    headerInner.appendChild(logoutButton);
  };

  const requestOtp = async (mobile) => {
    // Replace this demo implementation with Firebase Phone Auth later.
    return new Promise((resolve) => {
      setTimeout(() => resolve({ ok: true, message: `Demo OTP sent to +91 ${mobile}. Use ${DEMO_OTP} to continue.` }), 250);
    });
  };

  const verifyOtp = async (mobile, otp) => {
    // Replace this demo implementation with Firebase Phone Auth later.
    return new Promise((resolve) => {
      setTimeout(() => resolve(otp === DEMO_OTP), 250);
    });
  };

  const startResendCountdown = (button, seconds = 30) => {
    if (!button) return;
    button.disabled = true;
    let remaining = seconds;
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

  if (protectedPages.includes(currentPage)) {
    addLogoutButton();
    redirectBasedOnSession();
  } else if (currentPage === 'index.html') {
    redirectBasedOnSession();
  }

  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearAuthState();
      window.location.href = 'index.html';
    });
  }

  if (loginForm) {
    let otpSent = false;

    const updateVerifyButtonState = () => {
      if (!verifyOtpButton || !otpInput) return;
      const otpValue = otpInput.value.trim();
      verifyOtpButton.disabled = otpValue.length !== 4;
    };

    if (otpInput) {
      otpInput.addEventListener('input', updateVerifyButtonState);
      updateVerifyButtonState();
    }

    if (sendOtpButton) {
      sendOtpButton.addEventListener('click', async () => {
        const mobile = mobileInput ? mobileInput.value.trim() : '';

        if (!/^[0-9]{10}$/.test(mobile)) {
          showMessage('Please enter a valid 10-digit mobile number.', 'error');
          return;
        }

        const result = await requestOtp(mobile);
        if (result.ok) {
          otpSent = true;
          if (otpInput) {
            otpInput.value = '';
            otpInput.focus();
          }
          updateVerifyButtonState();
          startResendCountdown(sendOtpButton);
          showMessage(result.message, 'success');
        } else {
          showMessage(result.message || 'Unable to send OTP right now.', 'error');
        }
      });
    }

    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const mobile = mobileInput ? mobileInput.value.trim() : '';
      const otp = otpInput ? otpInput.value.trim() : '';

      if (!/^[0-9]{10}$/.test(mobile)) {
        showMessage('Please enter a valid 10-digit mobile number.', 'error');
        return;
      }

      if (!otpSent) {
        showMessage('Please request the OTP first.', 'error');
        return;
      }

      if (!/^[0-9]{4}$/.test(otp)) {
        showMessage('Please enter a valid 4-digit OTP.', 'error');
        return;
      }

      const isValidOtp = await verifyOtp(mobile, otp);
      if (!isValidOtp) {
        showMessage('Incorrect OTP. Use 1234 for the demo.', 'error');
        return;
      }

      saveAuthSession(mobile);
      showMessage('Login successful. Redirecting to your home page...', 'success');

      setTimeout(() => {
        window.location.href = 'home.html';
      }, 600);
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const customerName = document.getElementById('bookingName').value.trim();
      const mobile = document.getElementById('bookingMobile').value.trim();
      const city = document.getElementById('bookingCity').value;
      const service = document.getElementById('service').value;
      const address = document.getElementById('address').value.trim();
      const date = document.getElementById('date').value;
      const time = document.getElementById('time').value;

      if (!customerName || !mobile || !city || !service || !address || !date || !time) {
        alert('Please complete all required fields before booking');
        return;
      }

      localStorage.setItem('customerName', customerName);
      localStorage.setItem('customerMobile', mobile);
      localStorage.setItem('customerCity', city);
      localStorage.setItem('selectedService', service);
      localStorage.setItem('address', address);
      localStorage.setItem('date', date);
      localStorage.setItem('time', time);
      localStorage.setItem('location', locationField ? locationField.value : '');

      window.location.href = 'payment.html';
    });
  }

  if (locationButton && locationField) {
    locationButton.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported on this device');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const mapLink = `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`;
          locationField.value = mapLink;
          alert('Location added successfully');
        },
        (error) => {
          if (error.code === 1) {
            alert('Location permission denied');
          } else if (error.code === 2) {
            alert('Location unavailable');
          } else {
            alert('Unable to get your location right now');
          }
        }
      );
    });
  }

  if (paymentForm) {
    paymentForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const selectedPayment = document.querySelector('input[name="payment"]:checked');
      if (!selectedPayment) {
        alert('Please choose a payment method');
        return;
      }

      localStorage.setItem('paymentMethod', selectedPayment.value);
      window.location.href = 'success.html';
    });
  }

  document.querySelectorAll('.payment-option').forEach((option) => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach((item) => item.classList.remove('selected'));
      option.classList.add('selected');
      const input = option.querySelector('input');
      if (input) {
        input.checked = true;
      }
    });
  });

  const profileName = document.getElementById('profileName');
  if (profileName) {
    profileName.value = localStorage.getItem('customerName') || 'Guest';
  }

  const profileMobile = document.getElementById('profileMobile');
  if (profileMobile) {
    profileMobile.value = localStorage.getItem('customerMobile') || 'Not available';
  }

  const profileCity = document.getElementById('profileCity');
  if (profileCity) {
    profileCity.value = localStorage.getItem('customerCity') || 'Not available';
  }

  const bookingIdOutput = document.getElementById('bookingId');
  const customerOutput = document.getElementById('customer');
  const serviceOutput = document.getElementById('serviceOutput');
  const addressOutput = document.getElementById('addressOutput');
  const dateOutput = document.getElementById('dateOutput');
  const timeOutput = document.getElementById('timeOutput');

  if (bookingIdOutput) {
    bookingIdOutput.textContent = localStorage.getItem('bookingId') || 'Pending';
  }

  if (customerOutput) {
    customerOutput.textContent = localStorage.getItem('customerName') || 'Guest';
  }

  if (serviceOutput) {
    serviceOutput.textContent = localStorage.getItem('selectedService') || 'Not selected';
  }

  if (addressOutput) {
    addressOutput.textContent = localStorage.getItem('address') || 'Not provided';
  }

  if (dateOutput) {
    dateOutput.textContent = localStorage.getItem('date') || 'Not provided';
  }

  if (timeOutput) {
    timeOutput.textContent = localStorage.getItem('time') || 'Not provided';
  }

  const successService = document.getElementById('successService');
  const successPayment = document.getElementById('successPayment');
  const successBookingId = document.getElementById('successBookingId');

  if (successService) {
    successService.textContent = localStorage.getItem('selectedService') || 'Not selected';
  }

  if (successPayment) {
    successPayment.textContent = localStorage.getItem('paymentMethod') || 'Cash on delivery';
  }

  if (successBookingId) {
    const bookingId = localStorage.getItem('bookingId') || `UC${Math.floor(100000 + Math.random() * 900000)}`;
    successBookingId.textContent = bookingId;
    localStorage.setItem('bookingId', bookingId);
  }
});
