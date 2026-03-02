const { db } = require('./database');

function seed() {
    // Check if already seeded
    const existing = db.prepare('SELECT COUNT(*) as count FROM trips').get();
    if (existing.count > 0) return;

    console.log('🌱 Seeding database with sample trip data...');

    // Create the trip
    const tripStmt = db.prepare('INSERT INTO trips (name, start_date, end_date) VALUES (?, ?, ?)');
    const tripResult = tripStmt.run('Summer Family Trip 2026', '2026-05-07', '2026-06-21');
    const tripId = tripResult.lastInsertRowid;

    const dayStmt = db.prepare('INSERT INTO trip_days (trip_id, date, title, notes) VALUES (?, ?, ?, ?)');
    const flightStmt = db.prepare('INSERT INTO flights (trip_day_id, airline, flight_number, departure_city, arrival_city, departure_time, arrival_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const placeStmt = db.prepare('INSERT INTO places (trip_day_id, name, location, duration, map_embed_url, notes, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const checkStmt = db.prepare('INSERT INTO checklist_items (trip_day_id, text, is_done, sort_order) VALUES (?, ?, ?, ?)');
    const expenseStmt = db.prepare('INSERT INTO expenses (trip_id, trip_day_id, category, description, amount) VALUES (?, ?, ?, ?, ?)');

    // --- New York (May 7-14) ---
    const ny1 = dayStmt.run(tripId, '2026-05-07', 'Arrival in New York City', 'Landing at JFK and heading to hotel in Manhattan.').lastInsertRowid;
    flightStmt.run(ny1, 'Delta Airlines', 'DL 1042', 'Home', 'New York (JFK)', '08:00 AM', '11:30 AM', 'Non-stop flight');
    placeStmt.run(ny1, 'Times Square', 'Manhattan, New York, NY', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d-73.9857!3d40.758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1234567890', 'The heart of NYC', 1);
    placeStmt.run(ny1, 'Hotel Check-in', 'Midtown Manhattan, New York, NY', '1 hour', '', 'Check-in at the hotel and freshen up', 0);
    checkStmt.run(ny1, 'Print boarding passes', 1, 0);
    checkStmt.run(ny1, 'Pack carry-on essentials', 1, 1);
    checkStmt.run(ny1, 'Confirm hotel reservation', 0, 2);
    checkStmt.run(ny1, 'Exchange currency', 0, 3);
    expenseStmt.run(tripId, ny1, 'Flight', 'Delta flight to JFK', 450.00);
    expenseStmt.run(tripId, ny1, 'Hotel', 'Manhattan hotel - 7 nights', 2100.00);

    const ny2 = dayStmt.run(tripId, '2026-05-08', 'Exploring Manhattan', 'Full day exploring iconic Manhattan landmarks.').lastInsertRowid;
    placeStmt.run(ny2, 'Statue of Liberty', 'Liberty Island, New York, NY', '3 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2!2d-74.0445!3d40.6892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25090129c363d%3A0x40c6a5770d25022b!2sStatue%20of%20Liberty!5e0!3m2!1sen!2sus!4v1234567890', 'Book ferry tickets in advance', 1);
    placeStmt.run(ny2, 'Central Park', 'Manhattan, New York, NY', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3020.5!2d-73.9654!3d40.7829!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2589a018531e3%3A0xb9df1f7387a94119!2sCentral%20Park!5e0!3m2!1sen!2sus!4v1234567890', 'Beautiful afternoon walk', 2);
    placeStmt.run(ny2, 'Empire State Building', '350 5th Ave, New York, NY', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.4!2d-73.9857!3d40.7484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890', 'Evening observation deck visit', 3);
    checkStmt.run(ny2, 'Book Statue of Liberty ferry tickets', 0, 0);
    checkStmt.run(ny2, 'Charge camera batteries', 0, 1);
    checkStmt.run(ny2, 'Pack sunscreen and water', 0, 2);
    expenseStmt.run(tripId, ny2, 'Tickets', 'Statue of Liberty ferry', 24.50);
    expenseStmt.run(tripId, ny2, 'Food', 'Lunch at Central Park café', 65.00);

    const ny3 = dayStmt.run(tripId, '2026-05-10', 'Brooklyn Day', 'Exploring Brooklyn and its culture.').lastInsertRowid;
    placeStmt.run(ny3, 'Brooklyn Bridge', 'Brooklyn Bridge, New York, NY', '1.5 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.0!2d-73.9969!3d40.7061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a2343ce7b2b%3A0x2526ddba7abd465c!2sBrooklyn%20Bridge!5e0!3m2!1sen!2sus!4v1234567890', 'Walk across at sunset', 1);
    placeStmt.run(ny3, 'DUMBO', 'DUMBO, Brooklyn, NY', '2 hours', '', 'Great for photos with Manhattan skyline', 2);
    checkStmt.run(ny3, 'Wear comfortable walking shoes', 0, 0);

    // --- Niagara Falls (May 15-17) ---
    const nf1 = dayStmt.run(tripId, '2026-05-15', 'Travel to Niagara Falls', 'Road trip from NYC to Niagara Falls.').lastInsertRowid;
    flightStmt.run(nf1, 'JetBlue', 'B6 417', 'New York (JFK)', 'Buffalo (BUF)', '09:00 AM', '10:45 AM', 'Short flight to Buffalo, then drive to Falls');
    placeStmt.run(nf1, 'Niagara Falls State Park', 'Niagara Falls, NY 14303', '4 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2901.0!2d-79.0742!3d43.0799!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89d34307a70b15ed%3A0x6e1bdd4ee4b01722!2sNiagara%20Falls%20State%20Park!5e0!3m2!1sen!2sus!4v1234567890', 'One of the natural wonders!', 1);
    checkStmt.run(nf1, 'Pack rain ponchos', 0, 0);
    checkStmt.run(nf1, 'Book Maid of the Mist tickets', 0, 1);
    expenseStmt.run(tripId, nf1, 'Flight', 'JetBlue to Buffalo', 189.00);

    const nf2 = dayStmt.run(tripId, '2026-05-16', 'Niagara Falls Full Day', 'Full day at the Falls with boat tour.').lastInsertRowid;
    placeStmt.run(nf2, 'Maid of the Mist', 'Niagara Falls, NY', '1.5 hours', '', 'The iconic boat tour!', 1);
    placeStmt.run(nf2, 'Cave of the Winds', 'Niagara Falls, NY', '1.5 hours', '', 'Get up close to Bridal Veil Falls', 2);
    placeStmt.run(nf2, 'Rainbow Bridge', 'Niagara Falls, NY', '1 hour', '', 'Walk across to Canadian side', 3);
    checkStmt.run(nf2, 'Bring waterproof phone pouch', 0, 0);
    expenseStmt.run(tripId, nf2, 'Tickets', 'Maid of the Mist + Cave of the Winds', 75.00);

    // --- Pittsburgh (May 18-20) ---
    const pit1 = dayStmt.run(tripId, '2026-05-18', 'Arrival in Pittsburgh', 'Driving from Niagara to Pittsburgh.').lastInsertRowid;
    placeStmt.run(pit1, 'Point State Park', 'Pittsburgh, PA 15222', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3036.6!2d-80.0084!3d40.4416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8834f157c2c6e4c1%3A0xd4a0cf607e905dc4!2sPoint%20State%20Park!5e0!3m2!1sen!2sus!4v1234567890', 'Where three rivers meet', 1);
    placeStmt.run(pit1, 'Andy Warhol Museum', '117 Sandusky St, Pittsburgh, PA', '2 hours', '', 'World-famous art museum', 2);
    checkStmt.run(pit1, 'Check-in at Pittsburgh hotel', 0, 0);
    checkStmt.run(pit1, 'Reserve dinner at Primanti Bros', 0, 1);
    expenseStmt.run(tripId, pit1, 'Hotel', 'Pittsburgh hotel - 2 nights', 320.00);

    // --- Michigan (May 21-27) ---
    const mi1 = dayStmt.run(tripId, '2026-05-21', 'Travel to Michigan', 'Flying from Pittsburgh to Detroit.').lastInsertRowid;
    flightStmt.run(mi1, 'American Airlines', 'AA 2187', 'Pittsburgh (PIT)', 'Detroit (DTW)', '11:00 AM', '12:15 PM', 'Short hop to Michigan');
    placeStmt.run(mi1, 'The Henry Ford Museum', '20900 Oakwood Blvd, Dearborn, MI', '3 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2948.0!2d-83.2341!3d42.3040!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x883b34d79d2f3ee5%3A0x3c0d2d5d73b5a7c4!2sThe%20Henry%20Ford!5e0!3m2!1sen!2sus!4v1234567890', 'American innovation history', 1);
    checkStmt.run(mi1, 'Rent car at Detroit airport', 0, 0);
    expenseStmt.run(tripId, mi1, 'Flight', 'American Airlines to Detroit', 210.00);
    expenseStmt.run(tripId, mi1, 'Car Rental', 'Hertz rental - 6 days', 480.00);

    const mi2 = dayStmt.run(tripId, '2026-05-23', 'Sleeping Bear Dunes', 'Day trip to the beautiful dunes.').lastInsertRowid;
    placeStmt.run(mi2, 'Sleeping Bear Dunes', 'Empire, MI 49630', '5 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2900.0!2d-86.0589!3d44.8073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x881fd6c1e7b3c7e5%3A0x4c2e1c0e8e03b7d5!2sSleeping%20Bear%20Dunes!5e0!3m2!1sen!2sus!4v1234567890', 'Voted most beautiful place in America', 1);
    checkStmt.run(mi2, 'Pack hiking boots', 0, 0);
    checkStmt.run(mi2, 'Bring plenty of water', 0, 1);
    checkStmt.run(mi2, 'Apply sunscreen', 0, 2);

    // --- Chicago (May 28 - June 3) ---
    const chi1 = dayStmt.run(tripId, '2026-05-28', 'Arrival in Chicago', 'Driving from Michigan to the Windy City.').lastInsertRowid;
    placeStmt.run(chi1, 'Millennium Park', '201 E Randolph St, Chicago, IL', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2970.0!2d-87.6226!3d41.8826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e2ca68d8e18b9%3A0xfe2798f4f9830e16!2sMillennium%20Park!5e0!3m2!1sen!2sus!4v1234567890', 'See The Bean / Cloud Gate', 1);
    placeStmt.run(chi1, 'Deep Dish Pizza', 'Lou Malnati\'s, Chicago, IL', '1.5 hours', '', 'Must-try Chicago deep dish!', 2);
    checkStmt.run(chi1, 'Check-in at Chicago hotel', 0, 0);
    checkStmt.run(chi1, 'Buy CTA day pass', 0, 1);
    expenseStmt.run(tripId, chi1, 'Hotel', 'Chicago hotel - 6 nights', 1800.00);

    const chi2 = dayStmt.run(tripId, '2026-05-30', 'Museum Day in Chicago', 'Full day exploring world-class museums.').lastInsertRowid;
    placeStmt.run(chi2, 'Art Institute of Chicago', '111 S Michigan Ave, Chicago, IL', '3 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2970.2!2d-87.6237!3d41.8796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e2ca3e2d94695%3A0x4829f3cc9ca2d0de!2sThe%20Art%20Institute%20of%20Chicago!5e0!3m2!1sen!2sus!4v1234567890', 'One of the best art museums in the world', 1);
    placeStmt.run(chi2, 'Navy Pier', '600 E Grand Ave, Chicago, IL', '2 hours', '', 'Great lakefront views', 2);
    checkStmt.run(chi2, 'Pre-book museum tickets online', 0, 0);
    expenseStmt.run(tripId, chi2, 'Tickets', 'Art Institute tickets x2', 70.00);

    // --- California (June 4-18) ---
    const ca1 = dayStmt.run(tripId, '2026-06-04', 'Flying to California', 'Heading to LA for the California leg!').lastInsertRowid;
    flightStmt.run(ca1, 'United Airlines', 'UA 1523', 'Chicago (ORD)', 'Los Angeles (LAX)', '08:30 AM', '11:00 AM', 'Non-stop to LA');
    placeStmt.run(ca1, 'Santa Monica Pier', 'Santa Monica, CA 90401', '3 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3309.0!2d-118.4968!3d34.0094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2a4cec2910019%3A0xb4170ab5ff23f5ab!2sSanta%20Monica%20Pier!5e0!3m2!1sen!2sus!4v1234567890', 'End of Route 66!', 1);
    checkStmt.run(ca1, 'Pick up rental car at LAX', 0, 0);
    checkStmt.run(ca1, 'Check-in at LA hotel', 0, 1);
    expenseStmt.run(tripId, ca1, 'Flight', 'United to LAX', 380.00);
    expenseStmt.run(tripId, ca1, 'Car Rental', 'Hertz rental - 14 days', 980.00);
    expenseStmt.run(tripId, ca1, 'Hotel', 'LA Hotel - 5 nights', 1500.00);

    const ca2 = dayStmt.run(tripId, '2026-06-06', 'Hollywood & Beverly Hills', 'Exploring the glamorous side of LA.').lastInsertRowid;
    placeStmt.run(ca2, 'Hollywood Walk of Fame', 'Hollywood Blvd, Los Angeles, CA', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.0!2d-118.3264!3d34.1016!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80c2bf20e4c82577%3A0x14015754d926dadb!2sHollywood%20Walk%20of%20Fame!5e0!3m2!1sen!2sus!4v1234567890', 'See the stars!', 1);
    placeStmt.run(ca2, 'Griffith Observatory', '2800 E Observatory Rd, LA, CA', '2 hours', '', 'Amazing views of LA and the Hollywood sign', 2);
    checkStmt.run(ca2, 'Charge camera', 0, 0);

    const ca3 = dayStmt.run(tripId, '2026-06-10', 'San Francisco', 'Road trip up the coast to SF!').lastInsertRowid;
    placeStmt.run(ca3, 'Golden Gate Bridge', 'Golden Gate Bridge, San Francisco, CA', '2 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0!2d-122.4783!3d37.8199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808586deffffffc3%3A0xcded139783705509!2sGolden%20Gate%20Bridge!5e0!3m2!1sen!2sus!4v1234567890', 'Iconic bridge views', 1);
    placeStmt.run(ca3, 'Fisherman\'s Wharf', 'Fisherman\'s Wharf, San Francisco, CA', '2 hours', '', 'Seafood and sea lions!', 2);
    placeStmt.run(ca3, 'Alcatraz Island', 'San Francisco Bay, CA', '3 hours', '', 'Book the ferry in advance', 3);
    checkStmt.run(ca3, 'Book Alcatraz ferry tickets', 0, 0);
    checkStmt.run(ca3, 'Pack warm jacket for SF fog', 0, 1);
    expenseStmt.run(tripId, ca3, 'Hotel', 'San Francisco hotel - 3 nights', 900.00);
    expenseStmt.run(tripId, ca3, 'Tickets', 'Alcatraz ferry tickets x2', 82.00);

    const ca4 = dayStmt.run(tripId, '2026-06-14', 'Yosemite National Park', 'A day in one of America\'s greatest parks.').lastInsertRowid;
    placeStmt.run(ca4, 'Yosemite Valley', 'Yosemite National Park, CA', '6 hours', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3150.0!2d-119.5383!3d37.7456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8096f09df58aecc5%3A0x2d249c2ced8003fe!2sYosemite%20Valley!5e0!3m2!1sen!2sus!4v1234567890', 'Half Dome, El Capitan, Bridalveil Fall', 1);
    checkStmt.run(ca4, 'Pack hiking gear', 0, 0);
    checkStmt.run(ca4, 'Bring bear canister for food', 0, 1);
    checkStmt.run(ca4, 'Download offline maps', 0, 2);
    expenseStmt.run(tripId, ca4, 'Tickets', 'Yosemite park entrance', 35.00);

    // --- Return Home (June 21) ---
    const ret = dayStmt.run(tripId, '2026-06-21', 'Return Home', 'End of an amazing summer trip!').lastInsertRowid;
    flightStmt.run(ret, 'Delta Airlines', 'DL 2065', 'Los Angeles (LAX)', 'Home', '02:00 PM', '10:30 PM', 'Return flight home');
    checkStmt.run(ret, 'Pack all luggage', 0, 0);
    checkStmt.run(ret, 'Check out of hotel', 0, 1);
    checkStmt.run(ret, 'Return rental car', 0, 2);
    checkStmt.run(ret, 'Confirm flight check-in', 0, 3);
    expenseStmt.run(tripId, ret, 'Flight', 'Delta return flight', 420.00);

    // Fill in some more days with basic entries to make the calendar richer
    const additionalDays = [
        { date: '2026-05-09', title: 'NYC Museum Day', notes: 'Visiting MoMA and Guggenheim' },
        { date: '2026-05-11', title: 'NYC Shopping & Rest', notes: 'SoHo shopping and hotel rest' },
        { date: '2026-05-12', title: 'NYC Food Tour', notes: 'Chinatown and Little Italy food crawl' },
        { date: '2026-05-13', title: 'NYC Broadway Show', notes: 'Matinee Broadway show' },
        { date: '2026-05-14', title: 'Leaving New York', notes: 'Last morning in NYC' },
        { date: '2026-05-17', title: 'Niagara Falls - Canadian Side', notes: 'Exploring Horseshoe Falls from Canada' },
        { date: '2026-05-19', title: 'Pittsburgh Exploring', notes: 'Exploring Strip District and Mount Washington' },
        { date: '2026-05-20', title: 'Leaving Pittsburgh', notes: 'Last day in Pittsburgh' },
        { date: '2026-05-22', title: 'Detroit Sightseeing', notes: 'Downtown Detroit and Riverwalk' },
        { date: '2026-05-24', title: 'Traverse City', notes: 'Wine country and beaches' },
        { date: '2026-05-25', title: 'Mackinac Island', notes: 'Day trip to the car-free island' },
        { date: '2026-05-26', title: 'Michigan Relaxation', notes: 'Lakeside relaxation day' },
        { date: '2026-05-27', title: 'Leaving Michigan', notes: 'Packing up and heading to Chicago' },
        { date: '2026-05-29', title: 'Chicago Architecture Tour', notes: 'Boat architecture tour on the river' },
        { date: '2026-05-31', title: 'Chicago Food Day', notes: 'Deep dish, hot dogs, and Italian beef' },
        { date: '2026-06-01', title: 'Chicago Lakefront', notes: 'Biking along Lake Michigan' },
        { date: '2026-06-02', title: 'Chicago Shopping', notes: 'Magnificent Mile shopping' },
        { date: '2026-06-03', title: 'Leaving Chicago', notes: 'Last deep dish pizza before flying out' },
        { date: '2026-06-05', title: 'LA Beach Day', notes: 'Venice Beach and Malibu' },
        { date: '2026-06-07', title: 'Disneyland', notes: 'Full day at the happiest place on Earth' },
        { date: '2026-06-08', title: 'LA Rest Day', notes: 'Pool day and hotel relaxation' },
        { date: '2026-06-09', title: 'Pacific Coast Highway', notes: 'Scenic drive up PCH' },
        { date: '2026-06-11', title: 'SF Chinatown & Cable Cars', notes: 'Classic San Francisco experiences' },
        { date: '2026-06-12', title: 'Silicon Valley', notes: 'Tour of tech campuses' },
        { date: '2026-06-13', title: 'SF Last Day', notes: 'Sausalito and Ferry Building' },
        { date: '2026-06-15', title: 'Yosemite Day 2', notes: 'Hiking and waterfalls' },
        { date: '2026-06-16', title: 'Drive to LA', notes: 'Scenic drive back to Los Angeles' },
        { date: '2026-06-17', title: 'LA Universal Studios', notes: 'Universal Studios Hollywood' },
        { date: '2026-06-18', title: 'LA Getty Museum', notes: 'Art and gardens at The Getty' },
        { date: '2026-06-19', title: 'Last Beach Day', notes: 'Final sunset at Santa Monica' },
        { date: '2026-06-20', title: 'Packing & Goodbyes', notes: 'Packing up and last-minute shopping' },
    ];

    for (const day of additionalDays) {
        dayStmt.run(tripId, day.date, day.title, day.notes);
    }

    console.log('✅ Seed data inserted successfully!');
}

module.exports = { seed };
