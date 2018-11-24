// Cart API

module.exports = {
    get: (cookies) => {
        let cart = 0;
        if (cookies['cart']) cookies["cart"].forEach((item) =>
            cart += parseInt(item["quantity"]));
        return String(cart);
    },
    set: (cookies, body, res) => {
        return new Promise(resolve=>{
            let cart = [];
            if ('cart' in cookies) cart = cookies['cart'];
            cart.push(body);
            res.cookie('cart', cart, {maxAge: 864000000, httpOnly: false});
            resolve(cart);
        })
    },
    update: (cookies, body, res) =>{
        let i = 0;
        if (typeof(body.item) === 'string') {
            cookies[i].product = body.item;
            cookies[i].color = body.color;
            cookies[i].size = body.size;
            cookies[i].quantity = body.quantity;
            cookies[i].price = body.price;
        }
        else {
            for (i = 0; i < body.item.length; i++) {
                cookies[i].product = body.item[i];
                cookies[i].color = body.color[i];
                cookies[i].size = body.size[i];
                cookies[i].quantity = body.quantity[i];
                cookies[i].price = body.price[i];
            }
        }
        res.cookie("cart", cookies, {maxAge: 864000000, httpOnly: false});
        },
    delete: (req, res)=>{
        let cart = req.cookies['cart'];
        cart.splice(req.query.delete, 1);
        console.log(cart);
        res.cookie('cart', cart, {maxAge: 864000000, httpOnly: false});
        return 'success';
    }
};