import { PAGES } from "./constants.js";
import storageService from "../storage/index.js";

export const auth = {
    redirectTo: (page) => {
        window.location.replace(page)
    },
    redirectToAdmin: () => auth.redirectTo(PAGES.ADMIN),
    redirectToLogin: () => auth.redirectTo(PAGES.LOGIN),
    checkAndRedirect: (options = {}) => {
        const { redirectTo = null, redirectIf = true } = options
        const hasSession = !!storageService.session.getAdmin()
        if (hasSession === redirectIf && redirectTo) {
            auth.redirectTo(redirectTo)
            return false
        }
        return hasSession
    }
}