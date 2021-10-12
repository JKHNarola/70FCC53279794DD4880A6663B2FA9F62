import { decrypt, encrypt } from "./encrypt-decrypt";

const LocalStorageService = {
    set: (key, value) => {
        if (typeof value !== "string") value = JSON.stringify(value);
        localStorage.setItem(key, JSON.stringify(encrypt(value)));
    },
    get: (key) => {
        let val = localStorage.getItem(key);
        try {
            return JSON.parse(decrypt(JSON.parse(val)));
        }
        catch (e) {
            return decrypt(JSON.parse(val));
        }
    },
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

export default LocalStorageService;