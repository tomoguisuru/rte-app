import ENV from 'client-app/config/environment';
import pako from 'pako';
import hmacSHA256 from 'crypto-js/hmac-sha256';

import moment from 'moment';

function AuthParams() {
    const tmp = {
        _owner: ENV.OWNER_ID,
        _timestamp: moment().unix(),
    }

    const json_str = JSON.stringify(tmp)

    const comp = pako.deflate(json_str, {level: 9})
    const compStr = String.fromCharCode(...comp)

    var msg = btoa(compStr);

    const sig = hmacSHA256(msg, ENV.API_KEY).toString();

    return {msg, sig};
}

export default AuthParams;