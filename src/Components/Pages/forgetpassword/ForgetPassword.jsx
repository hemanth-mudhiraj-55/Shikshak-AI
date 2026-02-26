import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaUser, FaRedo, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { Link } from 'react-router-dom';
import authService from '../../../services/authService';
import './ForgetPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  // Step states: 'email' -> 'otp' -> 'newPassword'
  const [currentStep, setCurrentStep] = useState('email');
  
  // Loading and message states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Email/Username state
  const [userIdentifier, setUserIdentifier] = useState('');
  const [identifierType, setIdentifierType] = useState('email'); // 'email' or 'username'
  
  // OTP states
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  
  // New Password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const otpInputRefs = useRef([]);
  const timerRef = useRef(null);

  // Detect if input is email or username
  const detectIdentifierType = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? 'email' : 'username';
  };

  // Handle identifier input change
  const handleIdentifierChange = (e) => {
    const value = e.target.value;
    setUserIdentifier(value);
    setIdentifierType(detectIdentifierType(value));
  };

  // Handle send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!userIdentifier) {
      setErrorMessage('Please enter your email or username');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log(`🔐 Forgot password request for ${identifierType}:`, userIdentifier);
      
      // Call your backend API to send OTP
      const response = await authService.forgotPassword({
        [identifierType]: userIdentifier
      });
      
      console.log('✅ OTP sent:', response);
      setSuccessMessage('OTP sent successfully! Check your email.');
      
      // Move to OTP step
      setCurrentStep('otp');
      startTimer();
      
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      setErrorMessage(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP change
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP key down
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle verify OTP
  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    
    if (otpValue.length !== 4) {
      setErrorMessage("Please enter a valid 4-digit OTP");
      return;
    }

    if (otpAttempts >= 3) {
      setErrorMessage("Maximum OTP attempts reached. Please try again later.");
      setIsResendDisabled(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await authService.verifyOTP({
        [identifierType]: userIdentifier,
        otp: otpValue
      });
      
      console.log('✅ OTP verified:', response);
      setSuccessMessage('OTP verified successfully! Please set your new password.');
      
      // Move to new password step
      setCurrentStep('newPassword');
      stopTimer();
      
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      setErrorMessage(error.message || 'Invalid OTP. Please try again.');
      setOtpAttempts(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (otpAttempts >= 3) {
      setErrorMessage("Maximum attempts reached. Please try again later.");
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await authService.forgotPassword({
        [identifierType]: userIdentifier
      });
      
      console.log('✅ OTP resent:', response);
      setSuccessMessage('OTP resent successfully!');
      setOtp(['', '', '', '']);
      setOtpAttempts(prev => prev + 1);
      startTimer();
      
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      setErrorMessage(error.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setErrorMessage('Please enter both password fields');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await authService.resetPassword({
        [identifierType]: userIdentifier,
        otp: otp.join(""),
        newPassword: newPassword
      });
      
      console.log('✅ Password reset successful:', response);
      setSuccessMessage('Password reset successfully! Redirecting to login...');
      
      // Clear form
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setErrorMessage(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back to email step
  const handleBackToEmail = () => {
    setCurrentStep('email');
    setOtp(['', '', '', '']);
    setErrorMessage('');
    setSuccessMessage('');
    stopTimer();
    setOtpAttempts(0);
  };

  // Timer functions
  const startTimer = () => {
    setTimeLeft(300);
    setIsOtpExpired(false);
    stopTimer();
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          setIsOtpExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        
        {/* Back to Login Button */}
        <button className="back-to-login-btn" onClick={() => navigate('/')}>
          <FaArrowLeft /> Back to Login
        </button>

        {/* Header */}
        <div className="forgot-header">
          <h1>Forgot Password?</h1>
          <p>No worries! We'll help you reset it.</p>
        </div>

        {/* Error & Success Messages */}
        {errorMessage && (
          <div className="error-message show">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="success-message show">{successMessage}</div>
        )}

        {/* Step 1: Email/Username Input */}
        {currentStep === 'email' && (
          <form onSubmit={handleSendOTP} className="forgot-form">
            <div className="input-box">
              <input
                type="text"
                placeholder="Enter your email or username"
                value={userIdentifier}
                onChange={handleIdentifierChange}
                disabled={isLoading}
                autoFocus
              />
              {identifierType === 'email' ? (
                <MdEmail className="input-icon" />
              ) : (
                <FaUser className="input-icon" />
              )}
            </div>
            
            <button 
              type="submit" 
              className="btn send-otp-btn"
              disabled={isLoading || !userIdentifier}
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {currentStep === 'otp' && (
          <div className="otp-verification-section">
            <div className="otp-info">
              <p>OTP sent to <strong>{userIdentifier}</strong></p>
              <button className="edit-email-btn" onClick={handleBackToEmail}>
                Edit
              </button>
            </div>

            <div className="otp-container">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  className="otp-input"
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  maxLength="1"
                  inputMode="numeric"
                  disabled={isLoading || isOtpExpired}
                />
              ))}
            </div>

            <div className="timer-container">
              {!isOtpExpired ? (
                <span>Time remaining: <span className="timer">{formatTime(timeLeft)}</span></span>
              ) : (
                <div className="timer-expired">OTP expired!</div>
              )}
            </div>

            <div className="attempts-warning">
              Attempts: {otpAttempts}/3
              {otpAttempts >= 3 && " - Maximum attempts reached"}
            </div>

            {isOtpExpired && (
              <button
                type="button"
                className="resend-btn"
                onClick={handleResendOtp}
                disabled={isResendDisabled || otpAttempts >= 3 || isLoading}
              >
                <FaRedo /> Resend OTP
              </button>
            )}

            <button
              type="button"
              className="btn verify-otp-btn"
              onClick={handleVerifyOTP}
              disabled={otp.join("").length !== 4 || otpAttempts >= 3 || isLoading || isOtpExpired}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <button className="back-btn" onClick={handleBackToEmail}>
              Back
            </button>
          </div>
        )}

        {/* Step 3: New Password */}
        {currentStep === 'newPassword' && (
          <form onSubmit={handleResetPassword} className="forgot-form">
            <div className="input-box password-input-wrapper">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
              <FaLock className="input-icon" />
              <div 
                className="password-toggle-container"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                <span className="password-toggle-text">
                  {showNewPassword ? "Hide" : "Show"}
                </span>
              </div>
            </div>

            <div className="input-box password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <FaLock className="input-icon" />
              <div 
                className="password-toggle-container"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                <span className="password-toggle-text">
                  {showConfirmPassword ? "Hide" : "Show"}
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn reset-password-btn"
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="forgot-footer">
          <Link to="/">Remember your password? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;