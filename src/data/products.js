const products = [
    // --- Mobility ---
    {
        _id: '1',
        name: 'Mobb Aluminum Rolling Walker 8" Wheels - Blue',
        category: 'Mobility',
        price: 189.99,
        image: 'https://www.scottsmedicalsupply.com/cdn/shop/collections/chair_medium.jpg?v=1513020067',
        description: 'Lightweight aluminum frame with 8" wheels for superior mobility.',
        rating: 4.8,
        reviews: 12,
        isNewArrival: true,
        isSale: false
    },
    {
        _id: '2',
        name: 'Drive Airgo Ultra-Light 6 Rollator',
        category: 'Mobility',
        price: 199.95,
        image: 'https://www.scottsmedicalsupply.com/cdn/shop/products/airgoultralight_large.jpg?v=1532370914',
        description: 'Ultra-light frame makes lifting and storage easy.',
        rating: 4.5,
        reviews: 8,
        isNewArrival: false,
        isSale: true
    },
    {
        _id: '3',
        name: 'Drive Travelite Transport Chair',
        category: 'Mobility',
        price: 280.99,
        oldPrice: 320.00,
        image: 'https://www.scottsmedicalsupply.com/cdn/shop/products/travelite_large.jpg?v=1532366852',
        description: 'Lightweight and strong, comes with a carry bag.',
        rating: 4.7,
        reviews: 20,
        isNewArrival: true
    },
    {
        _id: '4',
        name: 'Drive TranSport Aluminum Transport Chair',
        category: 'Mobility',
        price: 299.95,
        image: 'https://www.scottsmedicalsupply.com/cdn/shop/products/transportaluminumchair_large.jpg?v=1532366223',
        description: 'Compact design folds for easy transport and storage.',
        rating: 4.3,
        reviews: 15,
        isNewArrival: false
    },
    {
        _id: '5',
        name: 'Drive Super Light, Folding Transport Chair',
        category: 'Mobility',
        price: 329.95,
        oldPrice: 350.00,
        image: 'https://www.scottsmedicalsupply.com/cdn/shop/products/superlighttransport_large.jpg?v=1532366571',
        description: 'Weighs only 19 lbs. Great for travel.',
        rating: 4.9,
        reviews: 45,
        isNewArrival: false,
        isSale: true
    },
    {
        _id: '6',
        name: 'Drive Steel Transport Chair',
        category: 'Mobility',
        price: 159.95,
        image: 'https://www.scottsmedicalsupply.com/cdn/shop/products/steeltransport_large.jpg?v=1532363985',
        description: 'Durable steel frame provides reliable stability.',
        rating: 4.6,
        reviews: 30,
        isNewArrival: false
    },
    {
        _id: '7',
        name: 'Drive Phoenix 4 Wheel Heavy Duty Scooter',
        category: 'Mobility',
        price: 1499.95,
        oldPrice: 1650.00,
        image: 'https://www.scottsmedicalsupply.com/cdn/shop/products/scooter_large.jpg?v=1533225616',
        description: 'Heavy duty scooter with 350 lb weight capacity.',
        rating: 5.0,
        reviews: 10,
        isNewArrival: true
    },
    {
        _id: '8',
        name: 'Drive Pediatric Viper Plus Reclining Wheelchair',
        category: 'Mobility',
        price: 809.95,
        image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=400&auto=format&fit=crop',
        description: 'State-of-the-art reclining wheelchair for pediatric use.',
        rating: 4.8,
        reviews: 5,
        isNewArrival: true,
        isSale: true
    },

    // --- Hospital / Doctor ---
    {
        _id: '9',
        name: 'Hill-Rom Versa Care Bed',
        category: 'Hospital',
        price: 4500.00,
        image: 'https://images.unsplash.com/photo-1516574187841-693083f0493c?q=80&w=400&auto=format&fit=crop', // Placeholder for hospital bed
        description: 'Advanced hospital bed with pressure redistribution surface.',
        rating: 5.0,
        reviews: 3,
        isNewArrival: true
    },
    {
        _id: '10',
        name: 'Welch Allyn Diagnostic Set',
        category: 'Doctor',
        price: 650.00,
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400&auto=format&fit=crop', // Ophthalmoscope/Otoscope
        description: 'Complete diagnostic set including ophthalmoscope and otoscope.',
        rating: 4.9,
        reviews: 15,
        isNewArrival: false
    },
    {
        _id: '11',
        name: 'Ritter 95 Exam Table',
        category: 'Hospital',
        price: 1200.00,
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400&auto=format&fit=crop', // Exam table
        description: 'Classic hardwood exam table with adjustable backrest.',
        rating: 4.7,
        reviews: 8,
        isNewArrival: false
    },
    {
        _id: '12',
        name: 'Surgical Gloves (Box of 100)',
        category: 'Hospital',
        price: 25.00,
        image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?q=80&w=400&auto=format&fit=crop',
        description: 'Sterile latex-free surgical gloves.',
        rating: 4.6,
        reviews: 150,
        isSale: true
    },
    {
        _id: '13',
        name: 'Digital Blood Pressure Monitor',
        category: 'Doctor',
        price: 85.00,
        image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=400&auto=format&fit=crop',
        description: 'Accurate and easy-to-use upper arm blood pressure monitor.',
        rating: 4.8,
        reviews: 80,
        isNewArrival: true
    },

    // --- Wound Care ---
    {
        _id: '14',
        name: 'Sterile Gauze Pads (Pack of 50)',
        category: 'Wound Care',
        price: 15.99,
        image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=400&auto=format&fit=crop', // Generic medical supply
        description: 'Highly absorbent sterile gauze pads for wound dressing.',
        rating: 4.7,
        reviews: 40
    },

    // --- Orthopedic ---
    {
        _id: '15',
        name: 'Neoprene Knee Brace',
        category: 'Orthopedic',
        price: 45.00,
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=400&auto=format&fit=crop', // Generic
        description: 'Supportive knee brace for injury recovery and prevention.',
        rating: 4.5,
        reviews: 25
    },

    // --- Diabetic ---
    {
        _id: '16',
        name: 'Accu-Chek Guide Me Glucose Monitor',
        category: 'Diabetic',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=400&auto=format&fit=crop',
        description: 'Simple and accurate blood glucose monitoring system.',
        rating: 4.8,
        reviews: 60
    }
];

module.exports = products;
