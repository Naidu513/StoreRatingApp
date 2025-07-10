export const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

export const validateName = (name) => {
    if (!name || name.trim().length === 0) return 'Name is required.';
    if (name.length < 20 || name.length > 60) return 'Name must be between 20 and 60 characters.';
    return '';
};

export const validateEmail = (email) => {
    if (!email || email.trim().length === 0) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format.';
    return '';
};

export const validatePassword = (password) => {
    if (!password || password.trim().length === 0) return 'Password is required.';
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,16}$)/;
    if (!passwordRegex.test(password)) {
        return 'Password must be 8-16 characters, include at least one uppercase letter and one special character.';
    }
    return '';
};

export const validateAddress = (address) => {
    if (!address || address.trim().length === 0) return 'Address is required.';
    if (address.length > 400) return 'Address must not exceed 400 characters.';
    return '';
};

export const validateRating = (rating) => {
    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return 'Rating must be a number between 1 and 5.';
    }
    return '';
};