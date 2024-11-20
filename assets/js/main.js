/**
 * ShoppingCart Class
 * This class provides functionality for managing a shopping cart, including adding items,
 * calculating totals, and displaying recently bought items.
 *
 * @class ShoppingCart
 */
const ShoppingCart = new (class {
    /**
     * Stores items added in the cart.
     * @private
     * @type {Array<Object>}
     */
    #items = []

    /**
     * Static Data for recently bought items.
     * @private
     * @type {Object}
     */
    #staticData = {
        recentlyBought: [{
            title: 'Festive Looks',
            text: 'Rust Red Ribbed Velvet Long Sleeve Body Suit',
            color: 'Rust Red',
            size: 'S',
            price: 38,
            imgSrc: '/assets/img/sc-r1.png'
        }, {
            title: 'Chevron Flap',
            text: 'Crossbody Bag',
            color: 'Black',
            size: 'M',
            price: 7.34,
            discount: 5.77,
            imgSrc: '/assets/img/sc-r2.png'
        }, {
            title: 'Manila Tan',
            text: 'Multi Plaid Oversized Fringe Scarf',
            color: 'Maroon',
            size: 'S',
            price: 39,
            discount: 29,
            imgSrc: '/assets/img/sc-r3.png'
        }, {
            title: 'Diamante Puff',
            text: 'Sleeve Dress - Black',
            color: 'Black',
            size: 'S',
            price: 45.99,
            imgSrc: '/assets/img/sc-r4.png'
        }, {
            title: 'Banneth Open Front',
            text: 'Formal Dress in Black',
            color: 'Black',
            size: 'M',
            price: 99.95,
            discount: 69,
            imgSrc: '/assets/img/sc-r5.png'
        }]
    }

    /**
     * Gets the cart navigation element.
     * @private
     * @returns {HTMLElement} The cart navigation element.
     */
    get #cartNavElement() {
        return document.getElementById('app-menu-cart');
    }

    /**
     * Gets the items in the cart.
     * @returns {Array<Object>} The items currently in the cart.
     */
    get data() {
        return this.#items;
    }

    /**
     * Generates a unique ID for an item.
     * @private
     * @param {Object|string} value - The item data or string to generate an ID from.
     * @returns {string} The generated ID.
     */
    #makeID(value) {
        if (value instanceof Object) {
            value = `${value.title} ${value.text}`;
        }

        return 'SC-' + md5(value.toLowerCase().replaceAll(' ', '-').trim());
    }

    /**
     * Validates the format of an ID.
     * @private
     * @param {string} id - The ID to validate.
     * @returns {boolean} True if the ID is valid, false otherwise.
     */
    #validID(id) {
        return id !== null && String(id).length === 32;
    }

    /**
     * Updates the cart navigation display when an item quantity changes.
     * @private
     * @param {Object} item - The item that was updated.
     * @param {number} [qtyIncrement=1] - The quantity increment.
     */
    #updateCartNav(item, qtyIncrement = 1) {
        this.#items = this.#items.map((o) => {
            if (o.id === item.id) {
                o.qty = (parseInt(o.qty) + qtyIncrement);

                let navEl = o.navEl;

                if (navEl) {
                    navEl.querySelector('.cart-item-qty').innerHTML = `Qty: ${o.qty}`
                    navEl.querySelector('.cart-item-price').innerHTML = `${moneyFormatter.format(o.discount || o.price)}`
                }
            }

            return o;
        });
    }

    /**
     * Synchronizes the cart navigation item display with the current cart state.
     * @private
     * @param {Object} data - The item data to sync.
     */
    #syncCartNavItem(data) {
        let list = document.createElement('li');
        list.classList.add('cart-item');

        list.innerHTML = `
            <div class="dropdown-item rounded-2 py-3 d-flex">
                <div class="d-flex flex-column">
                    <img class="col cart-item-img me-3" src="${data.imgSrc}" />
                    <a role="button" class="btn btn-outline-dark text-capitalize small py-0 mt-2 me-3 rounded-5 cart-item-remove">remove</a>
                </div>
                <div class="col cart-item-details">
                    <h1>${data.title}</h1>
                    <p>${data.text}</p>
                    <div class="py-2">
                        <p class="cart-item-size">Size: ${data.size || 'n/a'}</p>
                        <p class="cart-item-color">Color: ${data.color || 'n/a'}</p>
                        <div class="d-flex">
                            <p class="cart-item-qty d-flex">Qty: ${data.qty}</p>
                            <a class="ms-2 text-dark cart-item-qty-up" role="button"><i class="bi bi-chevron-up"></i></a>
                            <a class="text-dark cart-item-qty-down" role="button"><i class="bi bi-chevron-down"></i></a>
                        </div>
                    </div>
                    <p class="fw-bold cart-item-price">${moneyFormatter.format(data.discount || data.price)}</p>
                </div>
            </div>
            <hr class="dropdown-divider"/>
        `;

        /*if (this.#items.length > 0) {
            let dividerLI = document.createElement('li');
            dividerLI.innerHTML = '<hr class="dropdown-divider"/>';

            this.#cartNavElement.prepend(dividerLI);
        }*/

        this.#cartNavElement.prepend(list);

        // bind quantity events
        list.querySelector('.cart-item-qty-up').onclick = e => {
            e.preventDefault();
            this.#updateCartNav(data, 1);
            this.#syncCart();
        };
        list.querySelector('.cart-item-qty-down').onclick = e => {
            e.preventDefault();
            if (data.qty > 1) {
                this.#updateCartNav(data, -1);
                this.#syncCart();
            }
        };
        list.querySelector('.cart-item-remove').onclick = e => {
            e.preventDefault();
            this.remove(data.id);
        };

        // add the list element
        this.#items = this.#items.map((o) => {
            if (o.id === data.id) {
                o.navEl = list;
            }

            return o;
        });


    }

    /**
     * Initializes the recently bought items section.
     * @private
     */
    #initRecentlyBought() {
        let pricingHTML, el = document.querySelector('.app-recent-items');

        this.#staticData.recentlyBought.forEach((data, index) => {
            data.id = data.id ? data.id : this.#makeID(data);

            if (data.discount === undefined) {
                pricingHTML = `<p class="col fw-bold smaller">${moneyFormatter.format(data.price)}</p>`;
            } else {
                pricingHTML = `
                    <p class="col-auto fw-bold smaller text-danger">${moneyFormatter.format(data.discount)}</p>
                    <p class="col fw-bold smaller"><s>${moneyFormatter.format(data.price)}</s></p>
                `;
            }

            let tpl = `
                <img alt="" class="app-card-img" src="${data.imgSrc}" />
                <p class="app-card-text-block">${data.title} ${data.text}</p>
                <div class="app-card-buttons">
                    ${pricingHTML}
                    <a role="button" data-cart-source="staticData.recentlyBought" data-cart-id="${data.id}" class="col-auto btn btn-outline-dark rounded-5 btn-buy">Buy</a>
                </div>
            `;

            let divCol = document.createElement('div');
            divCol.setAttribute('class', 'col-auto p-2');
            divCol.innerHTML = tpl;

            el.appendChild(divCol);

            data.el = divCol;

            divCol.querySelector('.btn-buy').addEventListener('click', (e) => {
                if (!this.exists(data.id)) {
                    this.add(data);

                    this.alert(`${data.title} ${data.text} - Added to your cart.`, ALERT_TYPE.SUCCESS);
                } else {
                    this.#updateCartNav(data);
                    this.#syncCart();

                    this.alert(`${data.title} ${data.text} - Quantity updated.`, ALERT_TYPE.INFO);
                }
            });
        });
    }

    /**
     * Adds an item to the cart.
     * @param {Object} item - The item to add to the cart.
     * @returns {Object} The added item.
     */
    add(item) {
        item = {id: item.id || this.#makeID(item), qty: 1, ...item};

        this.#items.push(item);

        this.#syncCartNavItem(item);
        this.#syncCart();

        return item;
    }

    /**
     * Removes item by id and return the deleted item.
     * @param {string} id The ID of the item to find.
     * @returns {Object|boolean} The deleted object or false if not found.
     */
    remove(id) {
        let index = this.#indexOfById(id);
        let temp;

        if (index > -1) {
            if (confirm(`Are you sure you want to remove this item to cart?`)) {
                temp = this.#items[index];
                this.#cartNavElement.removeChild(temp.navEl);
                this.#items.splice(index, 1);
                this.#syncCart();

                this.alert(`${temp.title} was removed in your bag.`, ALERT_TYPE.WARNING);

                return temp;
            }
        }

        return false;
    }

    #indexOfById(id) {
        return this.#items.findIndex(o => o.id === id);
    }

    /**
     * Finds an item in the cart by its ID.
     * @param {string} id - The ID of the item to find.
     * @returns {Object|null} The found item or null if not found.
     */
    findById(id) {
        if (id !== null && this.#validID(id)) {
            return this.#items.find((o) => o.id === id) ?? null;
        }

        return null;
    }

    /*#findIndexById(id) {
        return this.#items.findIndex(obj => obj.id === id);
    }*/

    /**
     * Checks if an item exists in the cart by its ID.
     * @param {string} id - The ID of the item to check.
     * @returns {boolean} True if the item exists, false otherwise.
     */
    exists(id) {
        for (const o of this.#items) {
            if (o.id === id) return true;
        }

        return false;
    }

    /**
     * Calculates the total quantity of items in the cart.
     * @returns {number} The total quantity of items.
     */
    totalQty() {
        let rv = 0;

        if (this.#items.length > 0) {
            for (const o of this.#items) {
                rv += o.qty || 1;
            }
        }

        return rv;
    }

    /**
     * Calculates the total amount of money in the cart.
     * @returns {number} The total amount.
     */
    totalAmount() {
        let rv = 0;

        if (this.#items.length > 0) {
            for (const o of this.#items) {
                rv += (o.discount || o.price || 0) * o.qty;
            }
        }

        return rv;
    }

    /**
     * Synchronizes the cart display with the current state of the cart.
     * @private
     */
    #syncCart() {
        let cartEl = ShoppingCart.#cartNavElement;
        let emptyEl = cartEl.querySelector('.cart-menu-empty-item');
        let elQty = cartEl.querySelector('.cart-item-tqty');
        let elAmt = cartEl.querySelector('.cart-item-total');
        let cartFooter = cartEl.querySelector('.cart-menu-footer');
        let tqty = this.totalQty();

        elQty.innerHTML = `My Bag (${tqty})`;
        elAmt.innerHTML = moneyFormatter.format(this.totalAmount());

        if (tqty > 0) {
            cartFooter.classList.remove('d-none');
            emptyEl.classList.add('d-none');
        } else {
            cartFooter.classList.add('d-none');
            emptyEl.classList.remove('d-none');
        }
    }

    /**
     * Initializes the shopping cart and its components.
     */
    init() {
        this.#initRecentlyBought();
        this.#syncCart();
    }

    /**
     * Displays a toast notification.
     * @private
     * @param {string} text - The message to display in the toast.
     * @param {Object} [options] - Options for the toast display.
     * @returns {void}
     */
    #toast(text, options = {class: 'text-dark bg-white'}) {
        let el = document.querySelector('.toast-container');
        let tpl = `
            <div class="d-flex align-items-start justify-content-between">
                <div class="toast-body d-flex lh-1">
                    ${text}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        let toastEl = document.createElement('div');
        toastEl.setAttribute('class', `toast fade border-0 ${options.class}`);
        toastEl.innerHTML = tpl;

        toastEl.addEventListener('hidden.bs.toast', () => {
            //el.removeChild(toastEl);
        });

        el.append(toastEl)

        let toast = new bootstrap.Toast(toastEl, {animation: true, autohide: true, delay: 7000, ...options});

        toast.show();
    }

    /**
     * Displays an alert notification.
     * @param {string} text - The message to display in the alert.
     * @param {Object} [type] - The type of alert (success, error, warning, info).
     * @param {Object} [option] - Options for the toast display.
     */
    alert(text, type = ALERT_TYPE.INFO, option = {}) {
        switch (type) {
            case ALERT_TYPE.INFO:
                text = `<i class="bi bi-info-circle-fill fs-2 me-2"></i> ${text}`;
                option = {class: 'sc-toast-info'};
                break;
            case ALERT_TYPE.SUCCESS:
                text = `<i class="bi bi-check-circle-fill fs-2 me-2"></i> ${text}`;
                option = {class: 'sc-toast-success'};
                break;
            case ALERT_TYPE.WARNING:
                text = `<i class="bi bi-exclamation-triangle-fill fs-2 me-2"></i> ${text}`;
                option = {class: 'sc-toast-warning'};
                break;
            case ALERT_TYPE.ERROR:
                text = `<i class="bi bi-x-octagon-fill fs-2 me-2"></i> ${text}`;
                option = {class: 'sc-toast-error'};
                break;
        }

        this.#toast(text, {class: 'text-white bg-success', ...option});
    }
});

/**
 * ALERT_TYPE Class
 * This class defines various alert types as static properties.
 * Each alert type is represented by a unique numeric value.
 *
 * @class ALERT_TYPE
 */
const ALERT_TYPE = class {
    /**
     * Represents a success alert type.
     * @static
     * @returns {number} The value representing a success alert (0x0).
     */
    static get SUCCESS() {
        return 0x0;
    }

    /**
     * Represents an error alert type.
     * @static
     * @returns {number} The value representing an error alert (0x1).
     */
    static get ERROR() {
        return 0x1;
    }

    /**
     * Represents a warning alert type.
     * @static
     * @returns {number} The value representing a warning alert (0x2).
     */
    static get WARNING() {
        return 0x2;
    }

    /**
     * Represents an informational alert type.
     * @static
     * @returns {number} The value representing an info alert (0x3).
     */
    static get INFO() {
        return 0x3;
    }
};

/**
 * Bootstrap Dropdown Popper
 * @type {NodeListOf<Element>}
 */
const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
[...dropdownElementList].map(dropdownToggleEl => new bootstrap.Dropdown(dropdownToggleEl, {
    display: 'static',
    boundary: 'document'
}));

/**
 * Money format
 * @type {Intl.NumberFormat}
 */
const moneyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

/**
 * MD5
 * @param value
 * @returns {string}
 */
const md5 = function (value) {
    function _md5(d) {
        return rstr2hex(binl2rstr(binl_md5(rstr2binl(d), 8 * d.length)))
    }

    function rstr2hex(d) {
        for (var _, m = "0123456789ABCDEF", f = "", r = 0; r < d.length; r++) _ = d.charCodeAt(r), f += m.charAt(_ >>> 4 & 15) + m.charAt(15 & _);
        return f
    }

    function rstr2binl(d) {
        for (var _ = Array(d.length >> 2), m = 0; m < _.length; m++) _[m] = 0;
        for (m = 0; m < 8 * d.length; m += 8) _[m >> 5] |= (255 & d.charCodeAt(m / 8)) << m % 32;
        return _
    }

    function binl2rstr(d) {
        for (var _ = "", m = 0; m < 32 * d.length; m += 8) _ += String.fromCharCode(d[m >> 5] >>> m % 32 & 255);
        return _
    }

    function binl_md5(d, _) {
        d[_ >> 5] |= 128 << _ % 32, d[14 + (_ + 64 >>> 9 << 4)] = _;
        for (var m = 1732584193, f = -271733879, r = -1732584194, i = 271733878, n = 0; n < d.length; n += 16) {
            var h = m, t = f, g = r, e = i;
            f = md5_ii(f = md5_ii(f = md5_ii(f = md5_ii(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_hh(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_gg(f = md5_ff(f = md5_ff(f = md5_ff(f = md5_ff(f, r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 0], 7, -680876936), f, r, d[n + 1], 12, -389564586), m, f, d[n + 2], 17, 606105819), i, m, d[n + 3], 22, -1044525330), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 4], 7, -176418897), f, r, d[n + 5], 12, 1200080426), m, f, d[n + 6], 17, -1473231341), i, m, d[n + 7], 22, -45705983), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 8], 7, 1770035416), f, r, d[n + 9], 12, -1958414417), m, f, d[n + 10], 17, -42063), i, m, d[n + 11], 22, -1990404162), r = md5_ff(r, i = md5_ff(i, m = md5_ff(m, f, r, i, d[n + 12], 7, 1804603682), f, r, d[n + 13], 12, -40341101), m, f, d[n + 14], 17, -1502002290), i, m, d[n + 15], 22, 1236535329), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 1], 5, -165796510), f, r, d[n + 6], 9, -1069501632), m, f, d[n + 11], 14, 643717713), i, m, d[n + 0], 20, -373897302), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 5], 5, -701558691), f, r, d[n + 10], 9, 38016083), m, f, d[n + 15], 14, -660478335), i, m, d[n + 4], 20, -405537848), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 9], 5, 568446438), f, r, d[n + 14], 9, -1019803690), m, f, d[n + 3], 14, -187363961), i, m, d[n + 8], 20, 1163531501), r = md5_gg(r, i = md5_gg(i, m = md5_gg(m, f, r, i, d[n + 13], 5, -1444681467), f, r, d[n + 2], 9, -51403784), m, f, d[n + 7], 14, 1735328473), i, m, d[n + 12], 20, -1926607734), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 5], 4, -378558), f, r, d[n + 8], 11, -2022574463), m, f, d[n + 11], 16, 1839030562), i, m, d[n + 14], 23, -35309556), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 1], 4, -1530992060), f, r, d[n + 4], 11, 1272893353), m, f, d[n + 7], 16, -155497632), i, m, d[n + 10], 23, -1094730640), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 13], 4, 681279174), f, r, d[n + 0], 11, -358537222), m, f, d[n + 3], 16, -722521979), i, m, d[n + 6], 23, 76029189), r = md5_hh(r, i = md5_hh(i, m = md5_hh(m, f, r, i, d[n + 9], 4, -640364487), f, r, d[n + 12], 11, -421815835), m, f, d[n + 15], 16, 530742520), i, m, d[n + 2], 23, -995338651), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 0], 6, -198630844), f, r, d[n + 7], 10, 1126891415), m, f, d[n + 14], 15, -1416354905), i, m, d[n + 5], 21, -57434055), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 12], 6, 1700485571), f, r, d[n + 3], 10, -1894986606), m, f, d[n + 10], 15, -1051523), i, m, d[n + 1], 21, -2054922799), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 8], 6, 1873313359), f, r, d[n + 15], 10, -30611744), m, f, d[n + 6], 15, -1560198380), i, m, d[n + 13], 21, 1309151649), r = md5_ii(r, i = md5_ii(i, m = md5_ii(m, f, r, i, d[n + 4], 6, -145523070), f, r, d[n + 11], 10, -1120210379), m, f, d[n + 2], 15, 718787259), i, m, d[n + 9], 21, -343485551), m = safe_add(m, h), f = safe_add(f, t), r = safe_add(r, g), i = safe_add(i, e)
        }
        return Array(m, f, r, i)
    }

    function md5_cmn(d, _, m, f, r, i) {
        return safe_add(bit_rol(safe_add(safe_add(_, d), safe_add(f, i)), r), m)
    }

    function md5_ff(d, _, m, f, r, i, n) {
        return md5_cmn(_ & m | ~_ & f, d, _, r, i, n)
    }

    function md5_gg(d, _, m, f, r, i, n) {
        return md5_cmn(_ & f | m & ~f, d, _, r, i, n)
    }

    function md5_hh(d, _, m, f, r, i, n) {
        return md5_cmn(_ ^ m ^ f, d, _, r, i, n)
    }

    function md5_ii(d, _, m, f, r, i, n) {
        return md5_cmn(m ^ (_ | ~f), d, _, r, i, n)
    }

    function safe_add(d, _) {
        var m = (65535 & d) + (65535 & _);
        return (d >> 16) + (_ >> 16) + (m >> 16) << 16 | 65535 & m
    }

    function bit_rol(d, _) {
        return d << _ | d >>> 32 - _
    }

    return _md5(value);
}

// Wait for state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ShoppingCart.init());
} else {
    ShoppingCart.init();
}
