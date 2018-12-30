
export class CookiesUtility {

    static RecentComputersListCookieName: string = "recent-computers-list";
    static AutoOpenRDPFileCookieName: string = "auto-open-rdpFile";

    static addRecentComputer(computerName: string): void {

        let val = CookiesUtility.getCookie(CookiesUtility.RecentComputersListCookieName);
        if (val == null) {
            val = "";
        }
        let names = val.split("|");
        names.push(computerName);
        let distinctNames = names.filter((value, index, self) => self.indexOf(value) === index);
        CookiesUtility.setCookie(CookiesUtility.RecentComputersListCookieName, distinctNames.join("|"), 100);
    };

    static removeRecentComputer(computerName: string): void {
        let val = CookiesUtility.getCookie(CookiesUtility.RecentComputersListCookieName);
        if (val == null) {
            val = "";
        }
        let names = val.split("|");
        names = names.filter((value, index, self) => value !== computerName);
        CookiesUtility.setCookie(CookiesUtility.RecentComputersListCookieName, names.join("|"), 100);
    }

    static clearRecentComputersList(): void {
        CookiesUtility.eraseCookie(CookiesUtility.RecentComputersListCookieName);
    }

    static setOpenRdpFileValue(val: boolean): void {
        CookiesUtility.setCookie(CookiesUtility.AutoOpenRDPFileCookieName, val.toString(), 100);
    }

    static getOpenRdpFileValue(): boolean  {
        const val = CookiesUtility.getCookie(CookiesUtility.AutoOpenRDPFileCookieName);
        return val === "true";
    }

    static setCookie(cookieName: string, value: string, days?: number): void {

        let expires = "";
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = `; expires=${date.toUTCString()}`;
        }
        document.cookie = `${cookieName}=${(value || "")}${expires}; path=/`;
    };

    static getCookie(cookieName: string): string {

        let nameEQ = cookieName + "=";
        let ca = document.cookie.split(';');

        for (let i = 0; i < ca.length; i++) {

            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1, c.length);
            }

            if (c.indexOf(nameEQ) == 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    };

    static eraseCookie(cookieName: string): void {

        document.cookie = `${cookieName}=;Max-Age=-99999999;`;
    };
}