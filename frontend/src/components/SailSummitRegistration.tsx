import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  jobTitle: string;
  phone: string;
  dietaryRestrictions: string;
  accessibilityNeeds: string;
  emergencyContact: string;
  emergencyPhone: string;
  sessionInterests: string[];
  networkingPreferences: string;
  tshirtSize: string;
}

const SailSummitRegistration: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    jobTitle: '',
    phone: '',
    dietaryRestrictions: '',
    accessibilityNeeds: '',
    emergencyContact: '',
    emergencyPhone: '',
    sessionInterests: [],
    networkingPreferences: '',
    tshirtSize: 'M'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const sessionOptions = [
    'AI/ML in Healthcare',
    'Digital Transformation',
    'Data Analytics & Insights',
    'Cloud Infrastructure',
    'Cybersecurity',
    'Innovation Leadership',
    'Regulatory Compliance',
    'Patient Experience',
    'Interoperability',
    'Future of Healthcare Technology'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.organization.trim()) newErrors.organization = 'Organization is required';
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (session: string) => {
    setFormData(prev => ({
      ...prev,
      sessionInterests: prev.sessionInterests.includes(session)
        ? prev.sessionInterests.filter(s => s !== session)
        : [...prev.sessionInterests, session]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Registration submitted:', formData);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="registration-page">
        <div className="bg-animation" />
        
        <nav>
          <div className="nav-container">
            <Link to="/" className="logo" aria-label="gitagu home">
              <img src={logo} alt="gitagu logo" className="logo-img" />
            </Link>
            <div className="nav-links">
              <Link to="/">Home</Link>
            </div>
          </div>
        </nav>

        <div className="registration-success">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h1>Registration Successful!</h1>
            <p>Thank you for registering for SAIL Summit (HLS) in Chicago.</p>
            <p>You will receive a confirmation email shortly with event details and your registration information.</p>
            <Link to="/" className="btn-primary">Return to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-page">
      <div className="bg-animation" />
      
      <nav>
        <div className="nav-container">
          <Link to="/" className="logo" aria-label="gitagu home">
            <img src={logo} alt="gitagu logo" className="logo-img" />
          </Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
          </div>
        </div>
      </nav>

      <div className="registration-container">
        <div className="registration-header">
          <h1 className="registration-title">SAIL Summit (HLS) Registration</h1>
          <p className="registration-subtitle">Chicago • Healthcare Leadership Summit</p>
          <div className="event-details">
            <div className="event-detail">
              <span className="detail-icon">📅</span>
              <span>March 15-17, 2025</span>
            </div>
            <div className="event-detail">
              <span className="detail-icon">📍</span>
              <span>McCormick Place, Chicago, IL</span>
            </div>
            <div className="event-detail">
              <span className="detail-icon">🎯</span>
              <span>Healthcare Innovation & Leadership</span>
            </div>
          </div>
        </div>

        <form className="registration-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2 className="section-title">Personal Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <div className="form-error">{errors.firstName}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <div className="form-error">{errors.lastName}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Organization *
                </label>
                <input
                  type="text"
                  name="organization"
                  className={`form-input ${errors.organization ? 'error' : ''}`}
                  value={formData.organization}
                  onChange={handleInputChange}
                  placeholder="Your organization or company"
                />
                {errors.organization && <div className="form-error">{errors.organization}</div>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  className={`form-input ${errors.jobTitle ? 'error' : ''}`}
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="Your current job title"
                />
                {errors.jobTitle && <div className="form-error">{errors.jobTitle}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Your phone number"
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Session Interests</h2>
            <p className="section-description">Select the sessions you're most interested in attending:</p>
            
            <div className="checkbox-grid">
              {sessionOptions.map((session) => (
                <label key={session} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.sessionInterests.includes(session)}
                    onChange={() => handleCheckboxChange(session)}
                  />
                  <span className="checkbox-label">{session}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Additional Information</h2>
            
            <div className="form-group">
              <label className="form-label">
                T-Shirt Size
              </label>
              <select
                name="tshirtSize"
                className="form-input"
                value={formData.tshirtSize}
                onChange={handleInputChange}
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Dietary Restrictions
              </label>
              <textarea
                name="dietaryRestrictions"
                className="form-textarea"
                value={formData.dietaryRestrictions}
                onChange={handleInputChange}
                placeholder="Please list any dietary restrictions or allergies"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Accessibility Needs
              </label>
              <textarea
                name="accessibilityNeeds"
                className="form-textarea"
                value={formData.accessibilityNeeds}
                onChange={handleInputChange}
                placeholder="Please describe any accessibility accommodations needed"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  className="form-input"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Emergency contact full name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  className="form-input"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  placeholder="Emergency contact phone number"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Networking Preferences
              </label>
              <textarea
                name="networkingPreferences"
                className="form-textarea"
                value={formData.networkingPreferences}
                onChange={handleInputChange}
                placeholder="Tell us about your networking goals and interests for the summit"
                rows={3}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className={`btn-primary registration-submit ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Submitting Registration...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SailSummitRegistration;
