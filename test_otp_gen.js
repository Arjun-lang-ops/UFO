
import otpGenerator from 'otp-generator';

console.log('Testing OTP Generator...');
const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
console.log('Generated OTP:', otp);

if (/^\d{6}$/.test(otp)) {
    console.log('SUCCESS: OTP is 6 digits.');
} else {
    console.error('FAILURE: OTP format is incorrect.');
    process.exit(1);
}
