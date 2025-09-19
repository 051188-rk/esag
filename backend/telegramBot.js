const TelegramBot = require('node-telegram-bot-api');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const { generateOrderStatusUpdate } = require('./utils/aiService');

const token = process.env.TELEGRAM_BOT_TOKEN;

function initializeTelegramBot() {
  if (!token) {
    console.warn("Telegram Bot Token not found. Bot will not be started.");
    return;
  }
  
  const bot = new TelegramBot(token, { polling: true });
  console.log("Telegram Bot is running...");

  // Helper function to get the user associated with a chat ID
  const getUserByChatId = async (chatId) => {
    return User.findOne({ telegramChatId: chatId });
  };

  // --- Bot Commands ---

  // /start command - The first command a user sends
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 
      "Welcome to ShopEase Bot! 🛍️\n\nTo get started, please log in to your account using the format:\n`/login your-email@example.com your_password`"
    );
  });

  // /login command - To link Telegram with their app account
  bot.onText(/\/login (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const email = match[1];
    const password = match[2];

    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return bot.sendMessage(chatId, "❌ Invalid email or password. Please try again.");
      }
      
      user.telegramChatId = chatId;
      await user.save();

      bot.sendMessage(chatId, `✅ Hello ${user.name}! You are successfully logged in. You can now use other commands like /products.`);
    } catch (error) {
      console.error("Telegram login error:", error);
      bot.sendMessage(chatId, "Sorry, something went wrong during login.");
    }
  });

  // /products command
  bot.onText(/\/products/, async (msg) => {
    const user = await getUserByChatId(msg.chat.id);
    if (!user) return bot.sendMessage(msg.chat.id, "Please /login first.");

    try {
      const products = await Product.find({ is_active: true }).limit(10).lean();
      if (products.length === 0) {
        return bot.sendMessage(msg.chat.id, "No products found at the moment.");
      }

      let response = "Here are some of our products:\n\n";
      products.forEach(p => {
        response += `📦 *${p.name}* - ₹${p.price}\n`;
        response += `   ID: \`${p._id}\`\n\n`;
      });
      response += "To add an item, use `/addtocart <product_id>`";

      bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(msg.chat.id, "Sorry, I couldn't fetch the products.");
    }
  });

  // /addtocart command
  bot.onText(/\/addtocart (.+)/, async (msg, match) => {
    const user = await getUserByChatId(msg.chat.id);
    if (!user) return bot.sendMessage(msg.chat.id, "Please /login first.");

    const productId = match[1];
    try {
      const product = await Product.findById(productId);
      if (!product || product.stock_quantity < 1) {
        return bot.sendMessage(msg.chat.id, "Product not found or is out of stock.");
      }

      let cart = await Cart.findOne({ user: user._id });
      if (!cart) cart = new Cart({ user: user._id, items: [] });
      
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ product: productId, quantity: 1, price_at_time: product.price });
      }
      await cart.save();

      bot.sendMessage(msg.chat.id, `🛒 Added *${product.name}* to your cart.`, { parse_mode: 'Markdown' });
    } catch (error) {
      bot.sendMessage(msg.chat.id, "Sorry, I couldn't add that to your cart. Please check the Product ID.");
    }
  });

  // /checkout command
  bot.onText(/\/checkout/, async (msg) => {
    const user = await getUserByChatId(msg.chat.id);
    if (!user) return bot.sendMessage(msg.chat.id, "Please /login first.");
    
    try {
      const cart = await Cart.findOne({ user: user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return bot.sendMessage(msg.chat.id, "Your cart is empty. Use /products to find items to add.");
      }
      
      // Simplified checkout for the bot
      const total_amount = cart.total_amount;
      const order = new Order({
        user: user._id,
        items: cart.items.map(item => ({
          product: item.product._id, name: item.product.name, image_url: item.product.image_url,
          quantity: item.quantity, price: item.price_at_time
        })),
        shipping_address: user.address,
        payment_method: 'online', // Default for bot
        total_amount: total_amount,
        subtotal: total_amount,
      });

      await order.save();
      cart.items = [];
      await cart.save();

      bot.sendMessage(msg.chat.id, `✅ Order placed successfully!\nYour Order ID is: \`${order.order_id}\``, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error(error);
      bot.sendMessage(msg.chat.id, "Sorry, something went wrong during checkout.");
    }
  });

  // Order Tracking via natural language
  bot.onText(/where is my order #(.+)/i, async (msg, match) => {
    const user = await getUserByChatId(msg.chat.id);
    if (!user) return bot.sendMessage(msg.chat.id, "Please /login first.");

    const orderId = match[1].trim();
    try {
      const order = await Order.findOne({ order_id: orderId, user: user._id });
      if (!order) {
        return bot.sendMessage(msg.chat.id, "I couldn't find that order for your account.");
      }

      const statusUpdate = await generateOrderStatusUpdate(order);
      bot.sendMessage(msg.chat.id, statusUpdate);
    } catch (error) {
      bot.sendMessage(msg.chat.id, "Sorry, I couldn't get the status for that order.");
    }
  });
}

module.exports = { initializeTelegramBot };