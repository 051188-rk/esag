const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/ecommerce_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('products');

    const totalCount = await collection.countDocuments();
    console.log('Total products in collection:', totalCount);

    const sampleDocs = await collection.find({}).limit(3).toArray();
    console.log('Sample documents:');
    console.log(JSON.stringify(sampleDocs, null, 2));

    const withIsActive = await collection.countDocuments({ is_active: true });
    const withIsActiveFalse = await collection.countDocuments({ is_active: false });
    const withoutIsActive = await collection.countDocuments({ is_active: { $exists: false } });

    console.log('Products with is_active: true:', withIsActive);
    console.log('Products with is_active: false:', withIsActiveFalse);
    console.log('Products without is_active field:', withoutIsActive);

    const fieldsToCheck = ['name', 'category', 'price', 'brand', 'description'];
    for (const field of fieldsToCheck) {
      const count = await collection.countDocuments({ [field]: { $exists: true } });
      console.log(`Products with ${field} field:`, count);
    }

    process.exit(0);

  } catch (error) {
    console.error('Debug error:', error);
    process.exit(1);
  }
});
