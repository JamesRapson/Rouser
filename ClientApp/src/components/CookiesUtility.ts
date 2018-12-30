
export class CookiesUtility {

    static addRecentComputer(computerName: string): void {

        let val = CookiesUtility.getCookie("recent-computers-list");
        if (val == null) {
            val = "";
        }
        let names = val.split("|");
        names.push(computerName);
        let distinctItems = names.filter((value, index, self) => self.indexOf(value) === index);
        CookiesUtility.setCookie("recent-computers-list", distinctItems.join("|"), 100);
    };

    static clearRecentComputersList(): void {
        CookiesUtility.eraseCookie("recent-computers-list");
    }

    static setCookie(cookieName: string, value: string, days?: number): void {

        let expires = "";
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = cookieName + "=" + (value || "") + expires + "; path=/";
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

        document.cookie = cookieName + '=; Max-Age=-99999999;';
    };
}