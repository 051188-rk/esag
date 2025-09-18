import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import Loading from '../Common/Loading';
import './DummyPayment.css';

const Payment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    const { clearCart } = useCart();
    
    const totalAmount = location.state?.totalAmount || 0;
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('upi');

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Call API to confirm payment
            await api.put(`/orders/${orderId}/payment`);

            toast.success('Payment successful!');
            
            // Invalidate queries to refetch cart and orders
            queryClient.invalidateQueries('user-orders');
            await clearCart();

            navigate('/orders', { 
                replace: true,
                state: { newOrderId: orderId }
            });

        } catch (error) {
            toast.error('Payment failed. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="payment-page">
            <div className="payment-container">
                <div className="payment-header">
                    <h1>Complete Your Payment</h1>
                    <p>Order ID: {orderId}</p>
                </div>

                <div className="payment-body">
                    <div className="payment-methods-tabs">
                        <button className={selectedMethod === 'card' ? 'active' : ''} onClick={() => setSelectedMethod('card')}>Credit/Debit Card</button>
                        <button className={selectedMethod === 'upi' ? 'active' : ''} onClick={() => setSelectedMethod('upi')}>UPI</button>
                        <button className={selectedMethod === 'netbanking' ? 'active' : ''} onClick={() => setSelectedMethod('netbanking')}>Net Banking</button>
                    </div>

                    <div className="payment-form">
                        {/* Dummy form content based on selected method */}
                        {selectedMethod === 'card' && (
                            <div className="card-form">
                                <input type="text" placeholder="Card Number" />
                                <input type="text" placeholder="Cardholder Name" />
                                <div className="card-details">
                                    <input type="text" placeholder="MM/YY" />
                                    <input type="password" placeholder="CVV" />
                                </div>
                            </div>
                        )}
                        {selectedMethod === 'upi' && (
                            <div className="upi-form">
                                <input type="text" placeholder="Enter UPI ID (e.g., yourname@okbank)" />
                                <p>Or scan the QR code with your UPI app</p>
                                <div className="qr-code"></div>
                            </div>
                        )}
                        {selectedMethod === 'netbanking' && (
                            <div className="netbanking-form">
                                <select>
                                    <option>Select Your Bank</option>
                                    <option>State Bank of India</option>
                                    <option>HDFC Bank</option>
                                    <option>ICICI Bank</option>
                                    <option>Axis Bank</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="payment-footer">
                    <div className="total-amount">
                        <span>Total Payable:</span>
                        <strong>₹{totalAmount.toLocaleString()}</strong>
                    </div>
                    <button onClick={handlePayment} disabled={isLoading} className="pay-now-btn">
                        {isLoading ? <Loading size="small" /> : `Pay Now`}
                    </button>
                    <p className="secure-note">This is a dummy payment gateway for demonstration purposes.</p>
                </div>
            </div>
        </div>
    );
};

export default Payment;
