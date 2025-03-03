import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Vintage Rolex Submariner",
      price: 8999.99,
      originalPrice: 10999.99,
      quantity: 1,
      image: "/api/placeholder/100/100",
      seller: "Luxury Time Pieces",
      condition: "Excellent"
    },
    {
      id: 2,
      name: "Ming Dynasty Vase",
      price: 4589.99,
      originalPrice: 5000.00,
      quantity: 1,
      image: "/api/placeholder/100/100",
      seller: "Asian Antiques Co",
      condition: "Good"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const updateQuantity = (id, change) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCartItems(items => items.filter(item => item.id !== id));
      setLoading(false);
    }, 500);
  };

  const applyPromoCode = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPromoApplied(true);
      setLoading(false);
    }, 800);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 29.99;
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const totalAmount = subtotal + shipping - discount;
  const totalSavings = cartItems.reduce((sum, item) => 
    sum + ((item.originalPrice - item.price) * item.quantity), 0) + discount;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#76ABAE' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button className="text-white hover:text-gray-200 flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingCart className="w-8 h-8" />
            Your Cart
          </h1>
        </div>

        {totalSavings > 0 && (
          <Alert className="mb-6 bg-green-100 text-green-800 border-green-200">
            <AlertDescription>
              You're saving ${totalSavings.toFixed(2)} on this order!
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <Card key={item.id} className="bg-white/90 backdrop-blur hover:bg-white/95 transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded-lg shadow-md"
                      />
                      {item.originalPrice > item.price && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          SALE
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-gray-500 text-sm">Sold by: {item.seller}</p>
                      <p className="text-gray-500 text-sm">Condition: {item.condition}</p>
                      
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-lg text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="px-3 py-2 hover:bg-gray-100 border-r"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="w-12 text-center py-2 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="px-3 py-2 hover:bg-gray-100 border-l"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex items-center gap-2 px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur sticky top-4">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  
                  {promoApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount (10%)</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Including all taxes</p>
                  </div>
                  
                  {!promoApplied && (
                    <div className="pt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Promo code"
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                        />
                        <button
                          onClick={applyPromoCode}
                          disabled={!promoCode || loading}
                          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <button className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold flex items-center justify-center gap-2">
                    Proceed to Checkout
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {cartItems.length === 0 && (
          <Card className="bg-white/90 backdrop-blur">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Looks like you haven't added any items yet.</p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Continue Shopping
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CartPage;