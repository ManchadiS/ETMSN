async function run() {
  try {
    console.log('Starting seed...');
    // 1. Create Restaurant 1
    const r1Res = await fetch('http://localhost:3000/api/v1/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Engineering Tadka - Main HQ', address: 'Sector 5, Salt Lake, Kolkata' })
    });
    const rest1 = await r1Res.json();
    console.log('Created restaurant 1:', rest1);
    
    // 2. Create Restaurant 2
    const r2Res = await fetch('http://localhost:3000/api/v1/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Engineering Tadka - Cafe & Bistro', address: 'Park Street, Kolkata' })
    });
    const rest2 = await r2Res.json();
    console.log('Created restaurant 2:', rest2);

    const id1 = rest1.id;
    const id2 = rest2.id;

    if (!id1 || !id2) {
      throw new Error('Restaurant IDs missing');
    }

    // 3. Create Food items for Restaurant 1
    const foods1 = [
      { name: 'Butter Chicken', price: 380, category: 'Main Course', description: 'Rich creamy chicken gravy cooked with butter', restaurantId: id1 },
      { name: 'Paneer Tikka', price: 280, category: 'Starters', description: 'Spiced paneer cubes grilled in tandoor', restaurantId: id1 },
      { name: 'Garlic Naan', price: 60, category: 'Bread', description: 'Indian bread with minced garlic baked in tandoor', restaurantId: id1 },
      { name: 'Jeera Rice', price: 120, category: 'Main Course', description: 'Basmati rice cooked with cumin seeds', restaurantId: id1 },
      { name: 'Chicken Biryani', price: 320, category: 'Main Course', description: 'Fragrant rice layered with spiced chicken', restaurantId: id1 },
      { name: 'Mango Lassi', price: 90, category: 'Beverages', description: 'Traditional sweet yogurt drink flavored with mango', restaurantId: id1 },
      { name: 'Masala Chai', price: 40, category: 'Beverages', description: 'Spiced Indian tea with ginger', restaurantId: id1 },
      { name: 'Gulab Jamun', price: 80, category: 'Desserts', description: 'Deep fried dough balls soaked in sugar syrup', restaurantId: id1 }
    ];

    for (const food of foods1) {
      const res = await fetch('http://localhost:3000/api/v1/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(food)
      });
      console.log('Seeded food item R1:', food.name, res.status);
    }

    // 4. Create Food items for Restaurant 2
    const foods2 = [
      { name: 'Chicken Alfredo Pasta', price: 340, category: 'Main Course', description: 'Alfredo sauce with tender chicken over penne', restaurantId: id2 },
      { name: 'Mushroom Risotto', price: 310, category: 'Main Course', description: 'Creamy arborio rice with mixed mushrooms', restaurantId: id2 },
      { name: 'Bruschetta', price: 180, category: 'Starters', description: 'Grilled bread rubbed with garlic and topped with tomatoes', restaurantId: id2 },
      { name: 'Cappuccino', price: 110, category: 'Beverages', description: 'Double espresso with steamed milk foam', restaurantId: id2 },
      { name: 'Chocolate Brownie', price: 150, category: 'Desserts', description: 'Warm fudge brownie served with vanilla ice cream', restaurantId: id2 }
    ];

    for (const food of foods2) {
      const res = await fetch('http://localhost:3000/api/v1/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(food)
      });
      console.log('Seeded food item R2:', food.name, res.status);
    }

    console.log('Seeding finished successfully!');
  } catch (err) {
    console.error('Seeding script failed:', err);
  }
}

run();
