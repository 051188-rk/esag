const TelegramBot = require('node-telegram-bot-api');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const { generateOrderStatusUpdate } = require('./utils/aiService');

const token = process.env.TELEGRAM_BOT_TOKEN;

function initializeTelegramBot() {
  if (!token) {
    console.warn("❌ Telegram Bot Token not found. Bot will not be started.");
    return;
  }
  
  const bot = new TelegramBot(token, { polling: true });
  console.log("✅ Telegram Bot is running and polling for messages...");

  // --- Helper Functions ---
  const getUserByChatId = (chatId) => User.findOne({ telegramChatId: chatId });

  const requireLogin = async (chatId) => {
    const user = await getUserByChatId(chatId);
    if (!user) {
      bot.sendMessage(chatId, "⚠️ You need to be logged in to do that. Please use the `/login your-email@example.com your_password` command first.");
      return null;
    }
    return user;
  };

  // --- Main Command Handlers ---

  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, 
      "Welcome to the ShopEase Bot! 🛍️\n\nHere are the commands you can use:\n\n/login <email> <password> - Connect your account\n/categories - Browse products by category\n/addtocart <product_id> [quantity] - Add an item to your cart\n/mycart - View your current cart\n/checkout - Place an order (paid online)\n/payondelivery - Place an order with Cash on Delivery\n/myorders - View your past orders\n/trackorder #<order_id> - Get the status of an order\n/logout - Disconnect your account"
    );
  });

  bot.onText(/\/login (.+) (.+)/, async (msg, match) => {
    const [chatId, email, password] = [msg.chat.id, match[1], match[2]];
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return bot.sendMessage(chatId, "❌ Invalid email or password.");
      }
      user.telegramChatId = chatId;
      await user.save();
      bot.sendMessage(chatId, `✅ Hello ${user.name}! You are successfully logged in.`);
    } catch (e) { bot.sendMessage(chatId, "An error occurred during login."); }
  });
  
  bot.onText(/\/logout/, async (msg) => {
    const user = await requireLogin(msg.chat.id);
    if (!user) return;
    user.telegramChatId = undefined;
    await user.save();
    bot.sendMessage(msg.chat.id, "✅ You have been successfully logged out.");
  });

  bot.onText(/\/categories/, async (msg) => {
    if (!(await requireLogin(msg.chat.id))) return;
    try {
      const categories = await Product.distinct('category');
      const keyboard = {
        inline_keyboard: categories.map(cat => ([{
          text: cat,
          callback_data: `category_${cat}_1` // Start at page 1
        }]))
      };
      bot.sendMessage(msg.chat.id, "Please choose a category:", { reply_markup: keyboard });
    } catch (e) { bot.sendMessage(msg.chat.id, "Couldn't fetch categories."); }
  });

  bot.onText(/\/addtocart (\w+) ?(\d+)?/, async (msg, match) => {
    const user = await requireLogin(msg.chat.id);
    if (!user) return;
    const [productId, quantity] = [match[1], parseInt(match[2] || '1')];
    try {
      const product = await Product.findById(productId);
      if (!product || product.stock_quantity < quantity) {
        return bot.sendMessage(msg.chat.id, "Product not found or is out of stock.");
      }
      let cart = await Cart.findOne({ user: user._id });
      if (!cart) cart = new Cart({ user: user._id, items: [] });
      const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity, price_at_time: product.price });
      }
      await cart.save();
      bot.sendMessage(msg.chat.id, `🛒 Added ${quantity} x *${product.name}* to your cart.`, { parse_mode: 'Markdown' });
    } catch (e) { bot.sendMessage(msg.chat.id, "Couldn't add to cart. Check the Product ID."); }
  });
  
  bot.onText(/\/mycart/, async (msg) => {
    const user = await requireLogin(msg.chat.id);
    if (!user) return;
    try {
      const cart = await Cart.findOne({ user: user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return bot.sendMessage(msg.chat.id, "Your cart is empty. Use /categories to find products!");
      }
      let response = "*Your Shopping Cart:*\n\n";
      cart.items.forEach(item => {
        response += `*${item.product.name}*\n`;
        response += `  Qty: ${item.quantity} x ₹${item.price_at_time} = ₹${item.quantity * item.price_at_time}\n\n`;
      });
      response += `*Total: ₹${cart.total_amount}*\n\n`;
      response += "Use /checkout or /payondelivery to place your order.";
      bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    } catch (e) {
      console.error(e);
      bot.sendMessage(msg.chat.id, "Sorry, I couldn't retrieve your cart.");
    }
  });

  const checkoutHandler = async (msg, paymentMethod) => {
    const user = await requireLogin(msg.chat.id);
    if (!user) return;
    try {
      const cart = await Cart.findOne({ user: user._id });
      if (!cart || cart.items.length === 0) return bot.sendMessage(msg.chat.id, "Your cart is empty.");
      
      const total_amount = cart.total_amount + (paymentMethod === 'cod' ? 25 : 0);
      const order = new Order({
        user: user._id,
        items: cart.items.map(i => ({...i.toObject()})),
        shipping_address: user.address,
        payment_method: paymentMethod,
        total_amount, subtotal: cart.total_amount,
        cod_fee: paymentMethod === 'cod' ? 25 : 0
      });

      await order.save();
      cart.items = [];
      await cart.save();
      bot.sendMessage(msg.chat.id, `✅ Order placed successfully!\nYour Order ID is: \`${order.order_id}\``, { parse_mode: 'Markdown' });
    } catch (e) { console.error(e); bot.sendMessage(msg.chat.id, "Checkout failed."); }
  };

  bot.onText(/\/checkout/, (msg) => checkoutHandler(msg, 'online'));
  bot.onText(/\/payondelivery/, (msg) => checkoutHandler(msg, 'cod'));

  bot.onText(/\/myorders/, async (msg) => {
    const user = await requireLogin(msg.chat.id);
    if (!user) return;
    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(5);
    if (orders.length === 0) return bot.sendMessage(msg.chat.id, "You have no past orders.");
    let response = "*Your 5 most recent orders:*\n\n";
    orders.forEach(o => {
      response += `*ID:* \`${o.order_id}\`\n*Status:* ${o.order_status}\n*Total:* ₹${o.total_amount}\n*Date:* ${o.createdAt.toLocaleDateString()}\n\n`;
    });
    bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
  });

  bot.onText(/\/trackorder #?(.+)/i, async (msg, match) => {
    const user = await requireLogin(msg.chat.id);
    if (!user) return;
    try {
      const order = await Order.findOne({ order_id: match[1].trim(), user: user._id });
      if (!order) return bot.sendMessage(msg.chat.id, "Could not find that order for your account.");
      const statusUpdate = await generateOrderStatusUpdate(order);
      bot.sendMessage(msg.chat.id, statusUpdate);
    } catch (e) { bot.sendMessage(msg.chat.id, "Couldn't get the order status."); }
  });

  // --- Callback Query Handler (for Inline Buttons) ---
  bot.on('callback_query', async (callbackQuery) => {
    const { data, message } = callbackQuery;
    const chatId = message.chat.id;

    if (data.startsWith('category_')) {
      const [_, category, pageStr] = data.split('_');
      const page = parseInt(pageStr);
      const limit = 12;

      bot.answerCallbackQuery(callbackQuery.id);
      
      try {
        const products = await Product.find({ category, is_active: true })
          .skip((page - 1) * limit)
          .limit(limit);
        
        const totalProducts = await Product.countDocuments({ category, is_active: true });
        
        if (products.length === 0) return bot.sendMessage(chatId, `No products found in ${category}.`);

        let response = `*Products in ${category} (Page ${page}):*\n\n`;
        products.forEach(p => {
          response += `📦 *${p.name}* - ₹${p.price}\n   ID: \`${p._id}\`\n\n`;
        });

        const keyboard = { inline_keyboard: [] };
        const hasNextPage = (page * limit) < totalProducts;

        if (hasNextPage) {
          keyboard.inline_keyboard.push([{
            text: 'Next Page →',
            callback_data: `category_${category}_${page + 1}`
          }]);
        }

        bot.sendMessage(chatId, response, { 
            parse_mode: 'Markdown',
            reply_markup: hasNextPage ? keyboard : {} 
        });

      } catch (e) { bot.sendMessage(chatId, "Failed to fetch products."); }
    }
  });
}

module.exports = { initializeTelegramBot };