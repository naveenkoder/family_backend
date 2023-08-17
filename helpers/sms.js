import axios from 'axios';
const authkey = process.env.SMS_AUTH_KEY;

export const sendSMS = (mobile, otp) => {
    let url = `https://control.msg91.com/api/v5/otp?template_id=64cf70d0d6fc051350187803&mobile=91${mobile}&otp=${otp}`;
    return axios.get(
        url,
        { headers: { authkey } }
    )
}