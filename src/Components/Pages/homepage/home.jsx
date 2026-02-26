import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaLock, 
  FaGoogle, 
  FaFacebookSquare, 
  FaLinkedin, 
  FaRedo,
  FaEye,
  FaEyeSlash,
  FaGithub
} from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { Link } from 'react-router-dom';
import authService from '../../../services/authService';
import LeftSection from './LeftSection';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  
  // State for toggling between login/register
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Registration state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // OTP state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  
  const otpInputRefs = useRef([]);
  const timerRef = useRef(null);

  // Handle login input changes
  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle registration input changes
  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle toggle between login and register
  const handleToggle = (active) => {
    setIsActive(active);
    setErrorMessage('');
    setSuccessMessage('');
    if (!active) {
      setShowOtp(false);
      setOtp(['', '', '', '']);
    }
  };

  // Handle login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('🔐 Login attempt:', loginData.email);
      const response = await authService.login(loginData);

      console.log("FULL LOGIN RESPONSE:", response);
      console.log("TOKEN FROM RESPONSE:", response?.data?.data?.token);

      console.log('✅ Login successful:', response);
      setSuccessMessage('Login successful! Redirecting to dashboard...');
      setLoginData({ email: '', password: '' });
      
      // setTimeout(() => {
      //   navigate('/dashboard', { replace: true });
      // }, 1500);

      console.log("🚀 Navigating to dashboard...");
      window.dispatchEvent(new Event("storage"));
      navigate('/dashboard');

      
    } catch (error) {
      console.error('❌ Login error:', error);
      setErrorMessage(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle register submit (send OTP)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    if (!registerData.username || !registerData.email || !registerData.password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    if (registerData.username.length < 3) {
      setErrorMessage('Username must be at least 3 characters');
      return;
    }

    if (registerData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      console.log('📧 Sending OTP to:', registerData.email);
      const response = await authService.sendOTP(registerData.email);
      
      console.log('✅ OTP sent:', response);
      setSuccessMessage('OTP sent successfully! Check your email or console.');
      setShowOtp(true);
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

  // Handle OTP submit
  const handleOtpSubmit = async () => {
    const otpValue = otp.join("");
    
    if (otpValue.length !== 4) {
      setErrorMessage("Please enter a valid 4-digit OTP");
      return;
    }

    if (otpAttempts >= 3) {
      setErrorMessage("Maximum OTP attempts reached. Please try again after some time.");
      setIsResendDisabled(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const userData = {
        ...registerData,
        otp: otpValue
      };

      console.log('📝 Registering user:', userData.email);
      const response = await authService.verifyOTPAndRegister(userData);
      
      console.log('✅ Registration successful:', response);
      setSuccessMessage('Registration successful! Welcome to ShikshakAI.');
      
      setRegisterData({ username: '', email: '', password: '' });
      setOtp(['', '', '', '']);
      setShowOtp(false);
      setOtpAttempts(0);
      
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      setErrorMessage(error.message || 'Registration failed. Please try again.');
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
      const response = await authService.sendOTP(registerData.email);
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

  // Handle back to register
  const handleBackToRegister = () => {
    setShowOtp(false);
    setOtp(['', '', '', '']);
    setErrorMessage('');
    setSuccessMessage('');
    stopTimer();
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
    <div className="auth-container">
      <LeftSection/>
      
      <div className="right-section">
        <div className={`container ${isActive ? "active" : ""}`}>
          
          {/* Login Form */}
          <div className="login">
            <form onSubmit={handleLoginSubmit}>
              <h1>Login</h1>
              
              {errorMessage && !successMessage && (
                <div className="error-message show">{errorMessage}</div>
              )}
              
              {successMessage && (
                <div className="success-message show">{successMessage}</div>
              )}
              
              <div className="input-box">
                <input 
                  type="text" 
                  name="email" 
                  placeholder="Email" 
                  required 
                  value={loginData.email}
                  onChange={handleLoginInputChange}
                  disabled={isLoading}
                />
                <MdEmail className="cred-logo" />
              </div>

              <div className="input-box password-input-wrapper">
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="Password" 
                  required 
                  value={loginData.password}
                  onChange={handleLoginInputChange}
                  disabled={isLoading}
                />
                <FaLock className="cred-logo" />
                <div 
                  className="password-toggle-container"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? (
                    <FaEyeSlash className="password-toggle-icon" />
                  ) : (
                    <FaEye className="password-toggle-icon" />
                  )}
                  <span className="password-toggle-text">
                    {showLoginPassword ? "Hide" : "Show"}
                  </span>
                </div>
              </div>

              <div className="forget-link">
                <Link to="/forgetpassword">Forgot Password?</Link>
              </div>

              <button 
                type="submit" 
                className="btn"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
              
              <p>or login with social platforms</p>
              <div className="social-icons">
                <a href="#"><FaGoogle /></a>
                <a href="#"><FaFacebookSquare /></a>
                <a href="#"><FaGithub /></a>
                <a href="#"><FaLinkedin /></a>
              </div>
            </form>
          </div>

          {/* Register Form */}
          <div className="login register">
            <form onSubmit={!showOtp ? handleRegisterSubmit : (e) => e.preventDefault()}>
              <h1>{showOtp ? "Verify OTP" : "Register"}</h1>
              
              {errorMessage && (
                <div className="error-message show">{errorMessage}</div>
              )}
              
              {successMessage && (
                <div className="success-message show">{successMessage}</div>
              )}
              
              {!showOtp ? (
                <>
                  <div className="input-box">
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      required
                      value={registerData.username}
                      onChange={handleRegisterInputChange}
                      disabled={isLoading}
                    />
                    <FaUser className="cred-logo" />
                  </div>

                  <div className="input-box">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      required
                      value={registerData.email}
                      onChange={handleRegisterInputChange}
                      disabled={isLoading}
                    />
                    <MdEmail className="cred-logo" />
                  </div>

                  <div className="input-box password-input-wrapper">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      required
                      value={registerData.password}
                      onChange={handleRegisterInputChange}
                      disabled={isLoading}
                    />
                    <FaLock className="cred-logo" />
                    <div 
                      className="password-toggle-container"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      {showRegisterPassword ? (
                        <FaEyeSlash className="password-toggle-icon" />
                      ) : (
                        <FaEye className="password-toggle-icon" />
                      )}
                      <span className="password-toggle-text">
                        {showRegisterPassword ? "Hide" : "Show"}
                      </span>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending OTP..." : "Register"}
                  </button>
                  
                  <p>or register with social platforms</p>
                  <div className="social-icons">
                    <a href="#"><FaGoogle /></a>
                    <a href="#"><FaFacebookSquare /></a>
                    <a href="#"><FaGithub/></a>
                    <a href="#"><FaLinkedin /></a>
                  </div>
                </>
              ) : (
                <>
                  <div className="otp-email">
                    OTP sent to <span>{registerData.email}</span>
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
                    OTP attempts: {otpAttempts}/3
                    {otpAttempts >= 3 && " - Maximum attempts reached"}
                  </div>

                  {isOtpExpired && (
                    <button
                      type="button"
                      className="resend-btn"
                      onClick={handleResendOtp}
                      disabled={isResendDisabled || otpAttempts >= 3 || isLoading}
                    >
                      <FaRedo /> Generate Again
                    </button>
                  )}

                  <div className="otp-buttons">
                    <button
                      type="button"
                      className="btn back-btn"
                      onClick={handleBackToRegister}
                      disabled={isLoading}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={handleOtpSubmit}
                      disabled={otp.join("").length !== 4 || otpAttempts >= 3 || isLoading || isOtpExpired}
                    >
                      {isLoading ? "Verifying..." : "Confirm"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Toggle Panels */}
          <div className="toggle-box">
            <div className="toggle-panel toggle-left">
              <h1>Hello, Welcome!</h1>
              <p>Don't have an account?</p>
              <button
                className="btn register-btn"
                onClick={() => handleToggle(true)}
                disabled={isLoading}
              >
                Register
              </button>
            </div>

            <div className="toggle-panel toggle-right">
              <h1>Welcome Back</h1>
              <p>Already have an account?</p>
              <button
                className="btn login-btn"
                onClick={() => handleToggle(false)}
                disabled={isLoading}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;