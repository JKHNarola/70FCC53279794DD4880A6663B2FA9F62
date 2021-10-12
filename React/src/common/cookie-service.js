import Cookies from 'universal-cookie';
const cookies = new Cookies();

const CookieService = {
    set: (key, value, expirationtimemins = 1440) => {
        if (expirationtimemins === null || expirationtimemins <= 0)
            expirationtimemins = 1440;
        let d = new Date();
        d.setTime(d.getTime() + (expirationtimemins * 60 * 1000));
        cookies.set(key, value, { path: "/", expires: d });
    },
    get: (key) => {
        return cookies.get(key);
    },
    remove: (key) => {
        cookies.remove(key);
    }
};

export default CookieService;