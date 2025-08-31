export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateProfileData = (data: any): ValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name || !data.name.trim()) {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }

  // Email validation
  if (!data.email || !data.email.trim()) {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
  }

  // Phone validation (Indian mobile number)
  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'Phone number is required';
  } else {
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = data.phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9';
    }
  }

  // Role validation
  const validRoles = ['Property 360', 'Builder', 'Advocate', 'Landowner', 'Society', 'Interior', 'Consulting'];
  if (!data.role) {
    errors.role = 'Please select a service role';
  } else if (!validRoles.includes(data.role)) {
    errors.role = 'Please select a valid service role';
  }

  // Optional field validations
  if (data.serviceName && data.serviceName.length > 200) {
    errors.serviceName = 'Service name must be less than 200 characters';
  }

  if (data.bio && data.bio.length > 1000) {
    errors.bio = 'Bio must be less than 1000 characters';
  }

  if (data.location && data.location.length > 100) {
    errors.location = 'Location must be less than 100 characters';
  }

  if (data.price && data.price.length > 50) {
    errors.price = 'Price must be less than 50 characters';
  }

  // Password validation (for registration)
  if (data.password !== undefined) {
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    } else if (data.password.length > 128) {
      errors.password = 'Password must be less than 128 characters';
    }
  }

  if (data.confirmPassword !== undefined) {
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeProfileData = (data: any) => {
  return {
    name: data.name?.trim() || '',
    email: data.email?.trim().toLowerCase() || '',
    phone: data.phone?.replace(/\D/g, '') || '',
    role: data.role || '',
    serviceName: data.serviceName?.trim() || '',
    bio: data.bio?.trim() || '',
    location: data.location?.trim() || '',
    price: data.price?.trim() || '',
    profileImage: data.profileImage || '',
    bannerImage: data.bannerImage || ''
  };
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const validateImageUrl = (url: string): boolean => {
  if (!url) return true; // Empty URL is valid (optional field)
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};