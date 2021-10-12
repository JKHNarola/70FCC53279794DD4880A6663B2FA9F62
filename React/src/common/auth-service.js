import { loginPageUrl } from "./app-consts";
import LocalStorageService from "./localstorage-service";
const sessionExpireMins = 60;

const AuthService = {
    isUserLoggedIn: () => {
        try {
            let user = LocalStorageService.get("d");
            if (!user || (new Date(user.expiresAt).getTime() <= new Date().getTime())) {
                window.location.href = loginPageUrl;
                return false;
            }
            else return true;
        }
        catch (e) {
            window.location.href = loginPageUrl;
            return false;
        }
    },
    setLoggedInUser: () => {
        let d = new Date();
        d.setTime(d.getTime() + (sessionExpireMins * 60 * 1000));
        LocalStorageService.set("d", { id: 4564654, expiresAt: d });
    },
    removeLoggedInUser: () => {
        LocalStorageService.remove("d");
    },
    logOut: () => {
        LocalStorageService.remove("d");
        window.location.href = loginPageUrl;
    }
};

export default AuthService;