body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #76ABAE;
}

.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.back-button {
    background: none;
    border: none;
    font-size: 16px;
    color: #fff;
    cursor: pointer;
}

.cart-title {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 24px;
    margin: 0;
}

.cart-grid {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.cart-items {
    flex: 1;
    margin-right: 20px;
}

.cart-item {
    background-color: #fff;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.item-image img {
    max-width: 100px;
    border-radius: 8px;
}

.item-details {
    flex: 1;
    margin-left: 15px;
}

.item-name {
    font-size: 18px;
    margin: 0;
}

.item-info {
    font-size: 14px;
    color: #777;
}

.price-section {
    margin-top: 10px;
}

.current-price {
    font-size: 18px;
    color: #000;
    font-weight: bold;
}

.original-price {
    font-size: 14px;
    text-decoration: line-through;
    color: #888;
}

.remove-button {
    background: none;
    border: none;
    font-size: 14px;
    color: #ff4f4f;
    cursor: pointer;
}

.order-summary {
    width: 300px;
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
}

.summary-card h3 {
    margin-top: 0;
    font-size: 22px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin: 10px 0;
}

.summary-row.total {
    font-weight: bold;
}

.promo-section {
    margin-top: 20px;
}

.promo-input {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.promo-input input {
    padding: 8px;
    font-size: 14px;
    width: 70%;
    border-radius: 4px;
    border: 1px solid #ccc;
}

.promo-input button {
    background-color: #ff4f4f;
    color: #fff;
    border: none;
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 4px;
    cursor: pointer;
}

.checkout-button {
    background-color: #ff4f4f;
    color: #fff;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    width: 100%;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 20px;
}

.empty-cart {
    text-align: center;
    color: #fff;
}

.empty-cart button {
    background-color: #ff4f4f;
    color: #fff;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 4px;
    cursor: pointer;
}
