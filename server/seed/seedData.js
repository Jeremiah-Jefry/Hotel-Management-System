const { sequelize } = require('../config/db');
const { User, Room, Booking, Payment } = require('../models');
require('dotenv').config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Sync database (force: true will drop and recreate tables)
    await sequelize.sync({ force: true });
    console.log('✅ Database tables created');

    // Create Users
    const admin = await User.create({
      name: 'Hotel Admin',
      email: 'admin@hotelease.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 9876543210'
    });

    const guest1 = await User.create({
      name: 'Rahul Sharma',
      email: 'guest1@gmail.com',
      password: 'Guest@123',
      role: 'guest',
      phone: '+91 9876543211'
    });

    const guest2 = await User.create({
      name: 'Priya Patel',
      email: 'guest2@gmail.com',
      password: 'Guest@123',
      role: 'guest',
      phone: '+91 9876543212'
    });

    console.log('✅ Users created (1 admin + 2 guests)');

    // Create Rooms
    const rooms = await Room.bulkCreate([
      // Standard Rooms (101-104)
      {
        room_number: '101',
        room_type: 'Standard',
        price_per_night: 1500.00,
        max_occupancy: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Daily Housekeeping', 'Tea/Coffee Maker'],
        description: 'A comfortable standard room with modern amenities, perfect for solo travelers or couples. Features a queen-size bed, work desk, and an en-suite bathroom with hot water.',
        image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
        is_available: true
      },
      {
        room_number: '102',
        room_type: 'Standard',
        price_per_night: 1500.00,
        max_occupancy: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Daily Housekeeping', 'Tea/Coffee Maker'],
        description: 'Cozy standard room with warm interiors and all essential amenities. Enjoy a peaceful stay with a garden-facing window and comfortable bedding.',
        image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
        is_available: true
      },
      {
        room_number: '103',
        room_type: 'Standard',
        price_per_night: 1500.00,
        max_occupancy: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Daily Housekeeping', 'Tea/Coffee Maker'],
        description: 'Well-appointed standard room designed for comfort. Includes a plush bed, modern bathroom, and a small seating area for relaxation.',
        image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        is_available: true
      },
      {
        room_number: '104',
        room_type: 'Standard',
        price_per_night: 1500.00,
        max_occupancy: 2,
        amenities: ['WiFi', 'AC', 'TV', 'Daily Housekeeping', 'Tea/Coffee Maker'],
        description: 'Bright and spacious standard room with contemporary decor. Perfect for a comfortable stay with all the amenities you need.',
        image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
        is_available: true
      },
      // Deluxe Rooms (201-204)
      {
        room_number: '201',
        room_type: 'Deluxe',
        price_per_night: 2500.00,
        max_occupancy: 3,
        amenities: ['WiFi', 'AC', 'TV', 'Mini Fridge', 'City View', 'Room Service', 'Bathrobes', 'Premium Toiletries'],
        description: 'Spacious deluxe room with stunning city views. Features a king-size bed, mini fridge, premium toiletries, and 24-hour room service. Perfect for those seeking premium comfort.',
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        is_available: true
      },
      {
        room_number: '202',
        room_type: 'Deluxe',
        price_per_night: 2500.00,
        max_occupancy: 3,
        amenities: ['WiFi', 'AC', 'TV', 'Mini Fridge', 'City View', 'Room Service', 'Bathrobes', 'Premium Toiletries'],
        description: 'Elegantly furnished deluxe room with panoramic city views. A king-size bed, spacious bathroom with rain shower, and a cozy reading nook make this room ideal for relaxation.',
        image_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
        is_available: true
      },
      {
        room_number: '203',
        room_type: 'Deluxe',
        price_per_night: 2500.00,
        max_occupancy: 3,
        amenities: ['WiFi', 'AC', 'TV', 'Mini Fridge', 'City View', 'Room Service', 'Bathrobes', 'Premium Toiletries'],
        description: 'Modern deluxe room with sophisticated decor and skyline views. Enjoy premium bedding, a work desk with ergonomic chair, and a well-stocked minibar.',
        image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
        is_available: true
      },
      {
        room_number: '204',
        room_type: 'Deluxe',
        price_per_night: 2500.00,
        max_occupancy: 3,
        amenities: ['WiFi', 'AC', 'TV', 'Mini Fridge', 'City View', 'Room Service', 'Bathrobes', 'Premium Toiletries'],
        description: 'Luxurious deluxe room featuring floor-to-ceiling windows with breathtaking views. Complete with king bed, marble bathroom, and exclusive room service menu.',
        image_url: 'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800',
        is_available: true
      },
      // Suite Rooms (301-302)
      {
        room_number: '301',
        room_type: 'Suite',
        price_per_night: 4000.00,
        max_occupancy: 4,
        amenities: ['WiFi', 'AC', 'TV', 'Jacuzzi', 'Living Area', 'Premium Minibar', 'Butler Service', 'Panoramic View', 'Espresso Machine', 'Smart TV'],
        description: 'Our flagship presidential suite offers unmatched luxury. Features a separate living area with plush sofas, a jacuzzi bath, premium minibar, dedicated butler service, and a panoramic balcony with sunset views.',
        image_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
        is_available: true
      },
      {
        room_number: '302',
        room_type: 'Suite',
        price_per_night: 4000.00,
        max_occupancy: 4,
        amenities: ['WiFi', 'AC', 'TV', 'Jacuzzi', 'Living Area', 'Premium Minibar', 'Butler Service', 'Panoramic View', 'Espresso Machine', 'Smart TV'],
        description: 'An exquisite suite with opulent furnishings and world-class amenities. Enjoy a king-size bed, private jacuzzi, spacious living area, walk-in closet, and personalized concierge service throughout your stay.',
        image_url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800',
        is_available: true
      }
    ]);

    console.log(`✅ ${rooms.length} rooms created`);
    console.log('   - 4 Standard (101-104) @ ₹1,500/night');
    console.log('   - 4 Deluxe (201-204) @ ₹2,500/night');
    console.log('   - 2 Suite (301-302) @ ₹4,000/night');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Admin:  admin@hotelease.com / Admin@123');
    console.log('   Guest1: guest1@gmail.com / Guest@123');
    console.log('   Guest2: guest2@gmail.com / Guest@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
